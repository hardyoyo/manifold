import React, { Component } from "react";
import PropTypes from "prop-types";
import connectAndFetch from "utils/connectAndFetch";
import { bindActionCreators } from "redux";
import Overlay from "global/components/Overlay";
import CheckFrontendMode from "global/containers/CheckFrontendMode";
import TextMeta from "reader/components/TextMeta";
import Layout from "reader/components/layout";
import Notes from "reader/components/notes";
import Toc from "reader/components/Toc";
import Footers from "global/components/Footers";
import Header from "reader/components/Header";
import ReaderNotes from "reader/containers/ReaderNotes";
import { select, grab, isEntityLoaded } from "utils/entityUtils";
import { commonActions } from "actions/helpers";
import { textsAPI, requests } from "api";
import lh from "helpers/linkHandler";
import locationHelper from "helpers/location";
import { childRoutes } from "helpers/router";
import { Redirect } from "react-router-dom";
import { matchRoutes } from "react-router-config";
import {
  uiColorActions,
  uiTypographyActions,
  entityStoreActions
} from "actions";
import { setPersistentUI } from "actions/ui/persistentUi";
import { CSSTransition } from "react-transition-group";
import get from "lodash/get";
import ScrollAware from "hoc/scroll-aware";
import BodyClass from "hoc/body-class";
import Authorize from "hoc/authorize";
import { ReaderContext } from "helpers/contexts";

const {
  selectFont,
  incrementFontSize,
  decrementFontSize,
  incrementMargins,
  decrementMargins,
  resetTypography
} = uiTypographyActions;
const { setColorScheme } = uiColorActions;
const { request, flush } = entityStoreActions;

export class ReaderContainer extends Component {
  static fetchData = (getState, dispatch, location, match) => {
    const promises = [];
    const state = getState();
    const { textId } = match.params;
    const textLoaded = textId ? isEntityLoaded("texts", textId, state) : false;
    if (textId && !textLoaded) {
      const textCall = textsAPI.show(textId);
      const { promise: one } = dispatch(request(textCall, requests.rText));
      promises.push(one);
    }
    return Promise.all(promises);
  };

  static mapStateToProps = (state, ownProps) => {
    const appearance = state.ui.persistent.reader;
    return {
      annotations: select(requests.rAnnotations, state.entityStore),
      section: grab(
        "textSections",
        ownProps.match.params.sectionId,
        state.entityStore
      ),
      text: grab("texts", ownProps.match.params.textId, state.entityStore),
      resources: select(requests.rSectionResources, state.entityStore),
      resourceCollections: select(
        requests.rSectionResourceCollections,
        state.entityStore
      ),
      authentication: state.authentication,
      visibility: state.ui.transitory.visibility,
      loading: state.ui.transitory.loading.active,
      notifications: state.notifications,
      renderDevTools: state.developer.renderDevTools,
      appearance
    };
  };

  static propTypes = {
    children: PropTypes.object,
    match: PropTypes.object,
    location: PropTypes.object,
    text: PropTypes.object,
    section: PropTypes.object,
    visibility: PropTypes.object,
    appearance: PropTypes.object,
    authentication: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object,
    loading: PropTypes.bool,
    notifications: PropTypes.object,
    route: PropTypes.object.isRequired,
    hideTocDrawer: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      showMeta: false
    };
    this.readerActions = this.makeReaderActions(props.dispatch);
    this.commonActions = commonActions(props.dispatch);
  }

  componentDidMount() {
    this.setPersistentUI(this.props);
  }

  componentDidUpdate(prevProps) {
    if (
      locationHelper.triggersScrollToTop(
        this.props.location,
        prevProps.location
      )
    ) {
      window.scrollTo(0, 0);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(flush(requests.rText));
    this.props.dispatch(flush(requests.rMyAnnotationsForText));
    this.props.dispatch(flush(requests.rMyFilteredAnnotationsForText));
  }

  get bodyClass() {
    let colorScheme = get(this.props, "appearance.colors.colorScheme");
    colorScheme = colorScheme ? `scheme-${colorScheme}` : "scheme-light";
    return `reader ${colorScheme}`;
  }

  get transitionProps() {
    return {
      classNames: "overlay-full",
      timeout: { enter: 200, exit: 200 }
    };
  }

  setPersistentUI = props => {
    const user = props.authentication.currentUser;
    if (!user) return null;
    this.readerActions.setPersistentUI(user.attributes.persistentUi.reader);
  };

  shouldRedirect(props) {
    const matches = matchRoutes(
      props.route.routes,
      this.props.location.pathname
    );
    return matches.length === 0;
  }

  makeReaderActions = dispatch => {
    const b = bindActionCreators;
    return {
      selectFont: b(el => selectFont(el), dispatch),
      incrementFontSize: b(incrementFontSize, dispatch),
      decrementFontSize: b(decrementFontSize, dispatch),
      incrementMargins: b(incrementMargins, dispatch),
      decrementMargins: b(decrementMargins, dispatch),
      resetTypography: b(resetTypography, dispatch),
      setColorScheme: b(el => setColorScheme(el), dispatch),
      setPersistentUI: b(userUi => setPersistentUI(userUi), dispatch)
    };
  };

  hideTocDrawer = () => {
    this.commonActions.panelHide("tocDrawer");
  };

  toggleMeta = () => {
    this.setState({ showMeta: !this.state.showMeta });
  };

  maybeRenderOverlay(props) {
    if (this.state.showMeta) return this.renderTextMetaOverlay();
    if (props.location.hash === "#my-annotations")
      return this.renderNotesOverlay();
    return null;
  }

  renderTextMetaOverlay() {
    const text = this.props.text;
    return (
      <CSSTransition {...this.transitionProps}>
        <Overlay closeCallback={this.toggleMeta} appearance="overlay-full">
          <TextMeta
            title={text.attributes.titlePlaintext}
            subtitle={text.attributes.subtitle}
            meta={text.attributes.metadataFormatted}
          />
        </Overlay>
      </CSSTransition>
    );
  }

  renderNotesOverlay() {
    return (
      <Authorize kind="any">
        <CSSTransition {...this.transitionProps}>
          <Overlay
            closeCallback={this.props.history.goBack}
            title={"My Notes"}
            icon="notes24"
            contentWidth={850}
          >
            <ReaderNotes>
              <Notes.DetailedList />
            </ReaderNotes>
          </Overlay>
        </CSSTransition>
      </Authorize>
    );
  }

  renderRedirect(props) {
    const startTextSectionId = props.text.attributes.startTextSectionId;
    const path = lh.link(
      "readerSection",
      props.text.attributes.slug,
      startTextSectionId
    );
    return <Redirect to={path} />;
  }

  renderRoutes() {
    /* eslint-disable no-unused-vars */
    const { route, ...otherProps } = this.props;
    /* eslint-enable no-unused-vars */
    const childProps = { ...otherProps, ...this.readerActions };
    return childRoutes(this.props.route, { childProps, switch: false });
  }

  render() {
    if (!this.props.text) return null;
    if (this.shouldRedirect(this.props)) return this.renderRedirect(this.props);

    return (
      <BodyClass className={this.bodyClass}>
        <ReaderContext.Provider value={this.props.text}>
          <div>
            <CheckFrontendMode
              debugLabel="ReaderWrapper"
              project={this.props.text.relationships.project}
            />
            <ScrollAware>
              {/* Header inside scroll-aware HOC */}
              <Header
                // Props required by body component
                text={this.props.text}
                section={this.props.section}
                authentication={this.props.authentication}
                visibility={this.props.visibility}
                location={this.props.location}
                appearance={this.props.appearance}
                notifications={this.props.notifications}
                commonActions={this.commonActions}
                history={this.props.history}
                match={this.props.match}
                {...this.readerActions}
              />
            </ScrollAware>
            <Toc
              text={this.props.text}
              section={this.props.section}
              tocDrawerVisible={this.props.visibility.uiPanels.tocDrawer}
              hideTocDrawer={this.hideTocDrawer}
              showMeta={this.toggleMeta}
            />
            <main id="skip-to-main">
              {this.maybeRenderOverlay(this.props)}
              {this.renderRoutes()}
            </main>
            <Footers.ReaderFooter text={this.props.text} />
            <Layout.PostFooter />
          </div>
        </ReaderContext.Provider>
      </BodyClass>
    );
  }
}

export default connectAndFetch(ReaderContainer);
