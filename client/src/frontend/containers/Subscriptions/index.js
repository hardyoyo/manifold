import React, { Component } from "react";
import { connect } from "react-redux";
import { requests, meAPI } from "api";
import Preferences from "global/components/preferences";
import { entityStoreActions } from "actions";
import lh from "helpers/linkHandler";
import PropTypes from "prop-types";
import mapValues from "lodash/mapValues";
import withProjectContext from "hoc/with-project-context";
import Authorize from "hoc/authorize";

const { request } = entityStoreActions;

export class SubscriptionsContainer extends Component {
  static mapStateToProps = state => ({
    authentication: state.authentication
  });

  static propTypes = {
    dispatch: PropTypes.func,
    authentication: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = this.initialState(props);
  }

  initialState(props) {
    const currentUser = props.authentication.currentUser;
    if (!currentUser) return { notificationPreferencesByKind: {} };
    return {
      notificationPreferencesByKind:
        currentUser.attributes.notificationPreferences
    };
  }

  handlePreferenceChange = event => {
    const notifications = {
      ...this.state.notificationPreferencesByKind
    };
    notifications[event.target.name] = event.target.value;
    this.setState({ notificationPreferencesByKind: notifications });
  };

  handleProjectsPreferenceChange = toInclude => {
    const notifications = {
      ...this.state.notificationPreferencesByKind
    };
    const toExclude =
      toInclude === "projects" ? "followedProjects" : "projects";

    notifications[toInclude] = "always";
    notifications[toExclude] = "never";

    this.setState({ notificationPreferencesByKind: notifications });
  };

  unsubscribeAll = event => {
    event.preventDefault();
    const notifications = mapValues(
      this.state.notificationPreferencesByKind,
      () => "never"
    );
    this.setState({ notificationPreferencesByKind: notifications });
  };

  updateUser = event => {
    event.preventDefault();
    window.scrollTo(0, 0);
    this.props.dispatch(
      request(meAPI.update(this.state), requests.gAuthenticatedUserUpdate)
    );
  };

  render() {
    return (
      <Authorize
        kind="any"
        failureRedirect={lh.link("frontendLogin")}
        failureNotification={{
          heading: "Access Denied.",
          body: "You must be logged in to manage notification preferences.",
          level: 2
        }}
      >
        <section className="bg-neutral05">
          {this.props.projectBackLink}
          <div className="container">
            <form
              autoComplete="off"
              className="subscriptions"
              method="post"
              onSubmit={this.updateUser}
            >
              <h1 className="form-heading">
                Notification Settings
                <span className="instructions">
                  Edit your email notifications and subscriptions.
                </span>
              </h1>
              <Preferences.NotificationsForm
                preferences={this.state.notificationPreferencesByKind}
                changeHandler={this.handlePreferenceChange}
                digestProjectsChangeHandler={
                  this.handleProjectsPreferenceChange
                }
                unsubscribeAllHandler={this.unsubscribeAll}
              />
              <div className="row-1-p">
                <div className="form-input form-error">
                  <input
                    className="button-secondary button-secondary--with-room"
                    type="submit"
                    value="Save Changes"
                  />
                </div>
              </div>
            </form>
          </div>
        </section>
      </Authorize>
    );
  }
}

export default connect(SubscriptionsContainer.mapStateToProps)(
  withProjectContext(SubscriptionsContainer)
);
