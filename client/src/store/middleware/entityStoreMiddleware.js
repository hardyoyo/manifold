import { ApiClient } from "api";
import { constantizeMeta } from "utils/entityUtils";
import get from "lodash/get";
import has from "lodash/has";
import { entityStoreActions } from "actions";

function sendRequest(request, authToken) {
  const client = new ApiClient();
  const token = authToken;
  const { endpoint, method } = request;
  const options = { ...request.options, authToken: token };
  return client.call(endpoint, method, options);
}

function buildResponseAction(requestAction, payload, meta, error) {
  const type = `API_RESPONSE/${constantizeMeta(meta)}`;
  /* eslint-disable no-param-reassign */
  if (payload) {
    payload.notificationScope =
      get(requestAction, "payload.notificationScope") || "global";
    payload.suppressErrors =
      get(requestAction, "payload.suppressErrors") || false;
    payload.noTouch = get(requestAction, "payload.noTouch") || false;
    payload.force = get(requestAction, "payload.force") || false;
  }
  /* eslint-enable no-param-reassign */
  return { type, error, payload, meta };
}

function buildRemovesAction(entity) {
  const type = `ENTITY_STORE_REMOVE`;
  return { type, payload: { entity } };
}

function buildClearsAction(requests) {
  const type = `ENTITY_STORE_FLUSH`;
  return { type, payload: requests };
}

function buildAddsAction(meta, entity) {
  const type = `ENTITY_STORE_ADD`;
  return { type, payload: { meta, entity } };
}

export default function entityStoreMiddleware({ dispatch, getState }) {
  return next => action => {
    // Guards
    if (action.type !== "API_REQUEST") {
      return next(action);
    }
    if (action.payload.state !== 0) return next(action);

    const state = getState();

    // If it's a one time request, we treat it as a noop and do not send it again.
    if (
      action.payload.oneTime === true &&
      get(state, `entityStore.responses.${action.meta}.loaded`) === true
    ) {
      return next(action);
    }

    // If the authToken is explicitly included in the request options, use it.
    // Generally speaking we pull the authToken from the store. However, when we load
    // the settings during the server-side bootstrap, it's easier to just include the
    // token from the cookie. This condition supports that possibility.
    const authToken = has(action, "payload.request.options.authToken")
      ? action.payload.request.options.authToken
      : state.authentication.authToken;

    // Inject headers, etc. from state
    const requestPromise = sendRequest(action.payload.request, authToken);

    setTimeout(() => {
      // Start and stop loading indication based on this promise.
      dispatch({ type: "START_LOADING", payload: action.meta });
    }, 0);

    requestPromise
      .then(
        () => {
          dispatch({ type: "STOP_LOADING", payload: action.meta });
        },
        () => {
          dispatch({ type: "STOP_LOADING", payload: action.meta });
        }
      )
      .catch(() => {
        dispatch({ type: "STOP_LOADING", payload: action.meta });
      });

    // Pass through the request action with updated state
    // We add the promise to the payload so that it can be used in fetch data to delay
    // loading.
    const withState = { state: 1, promise: requestPromise };
    const requestPayload = { ...action.payload, ...withState };
    let newMeta = action.meta;
    if (!Array.isArray(newMeta)) newMeta = [action.meta];

    newMeta.forEach(meta => {
      const type = `API_REQUEST/${meta.toUpperCase().replace(/-/g, "_")}`;
      const adjustedRequestAction = {
        type,
        payload: requestPayload,
        meta
      };
      next(adjustedRequestAction);
    });

    // Execute the API call and when it is complete, dispatch a response action.
    requestPromise.then(
      response => {
        newMeta.forEach(meta => {
          const payload = response || {};
          payload.request = action.payload.request;
          dispatch(buildResponseAction(action, response, meta, false));
        });
      },
      response => {
        newMeta.forEach(meta => {
          const payload = response || {};
          payload.request = action.payload.request;
          dispatch(buildResponseAction(action, response, meta, true));
        });
      }
    );

    // Remove object if requested on success.
    if (requestPayload.removes) {
      requestPromise.then(
        () => {
          dispatch(buildRemovesAction(requestPayload.removes));
        },
        () => {
          // noop
        }
      );
    }

    // Add object if requested on success.
    if (requestPayload.adds) {
      requestPromise.then(
        response => {
          if (Array.isArray(response.data)) {
            throw new Error(
              "Request options 'adds' is only supported for requests that return a " +
                "single object. The attempt to add to the " +
                requestPayload.adds +
                " response" +
                "did not succeed because the response contained a collection of entities."
            );
          }
          const { type, id } = response.data;
          dispatch(buildAddsAction(requestPayload.adds, { type, id }));
        },
        () => {
          // noop
        }
      );
    }

    // Takes an array of request identifiers and flushes
    // them from the store.
    if (requestPayload.clears) {
      requestPromise.then(
        () => {
          dispatch(buildClearsAction(requestPayload.clears));
        },
        () => {
          // noop
        }
      );
    }

    // Replay a previous API call. Useful for updating a collection after creating
    // or removing an entity.
    if (requestPayload.refreshes) {
      requestPromise.then(
        () => {
          const refreshResponse = get(
            state,
            `entityStore.responses.${requestPayload.refreshes}`
          );
          if (
            !refreshResponse ||
            !refreshResponse.loaded ||
            !refreshResponse.request
          )
            return;
          const refreshAction = entityStoreActions.request(
            refreshResponse.request,
            requestPayload.refreshes
          );
          dispatch(refreshAction);
        },
        () => {
          // noop
        }
      );
    }

    return { meta: action.meta, promise: requestPromise };
  };
}
