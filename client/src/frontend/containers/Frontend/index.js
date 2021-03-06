import React, { Component } from "react";
import PropTypes from "prop-types";
import Utility from "global/components/utility";
import Footers from "global/components/Footers";
import BackLink from "frontend/components/back-link";
import Layout from "frontend/components/layout";
import { commonActions } from "actions/helpers";
import { pagesAPI, subjectsAPI, requests } from "api";
import { entityStoreActions } from "actions";
import { select, isLoaded } from "utils/entityUtils";
import connectAndFetch from "utils/connectAndFetch";
import { renderRoutes } from "react-router-config";
import get from "lodash/get";
import BodyClass from "hoc/body-class";
import redirectIfLibraryDisabled from "hoc/redirect-if-library-disabled";

const { request } = entityStoreActions;

export class FrontendContainer extends Component {
  static fetchData = (getState, dispatch) => {
    if (!isLoaded(requests.gPages, getState())) {
      const pages = request(pagesAPI.index(), requests.gPages, {
        oneTime: true
      });
      const subjects = request(
        subjectsAPI.index({ used: true }, {}, true),
        requests.feSubjects,
        { oneTime: true }
      );
      const promises = [];
      const pagesRes = dispatch(pages);
      const subjectsRes = dispatch(subjects);
      if (pagesRes) promises.push(pagesRes.promise);
      if (subjectsRes) promises.push(subjectsRes.promise);
      return Promise.all(promises);
    }
  };

  static mapStateToProps = state => {
    return {
      authentication: state.authentication,
      visibility: state.ui.transitory.visibility,
      loading: state.ui.transitory.loading.active,
      notifications: state.notifications,
      frontendMode: state.ui.transitory.frontendMode,
      pages: select(requests.gPages, state.entityStore),
      settings: select(requests.settings, state.entityStore)
    };
  };

  static propTypes = {
    location: PropTypes.object,
    dispatch: PropTypes.func,
    fetchData: PropTypes.func,
    authentication: PropTypes.object,
    visibility: PropTypes.object,
    notifications: PropTypes.object,
    pages: PropTypes.array,
    settings: PropTypes.object,
    route: PropTypes.object,
    match: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.commonActions = commonActions(props.dispatch);
  }

  componentDidUpdate(prevProps) {
    // The store will be cleared if the user has changed. If this happens, reload content.
    if (
      this.props.authentication.currentUser !==
      prevProps.authentication.currentUser
    ) {
      this.props.fetchData(this.props);
    }
  }

  render() {
    const mainClasses = get(
      this.props.settings,
      "attributes.pressLogoStyles.small"
    )
      ? "extra-top"
      : "";

    return (
      <BodyClass className={"browse"}>
        <BackLink.Provider>
          <Utility.ScrollToTop />
          <Layout.Header
            pages={this.props.pages}
            visibility={this.props.visibility}
            match={this.props.match}
            location={this.props.location}
            authentication={this.props.authentication}
            notifications={this.props.notifications}
            commonActions={this.commonActions}
            settings={this.props.settings}
          />
          <main
            ref={mainContainer => {
              this.mainContainer = mainContainer;
            }}
            id="skip-to-main"
            className={mainClasses}
          >
            <div>{renderRoutes(this.props.route.routes)}</div>
          </main>
          <Footers.FrontendFooter
            pages={this.props.pages}
            authentication={this.props.authentication}
            commonActions={this.commonActions}
            settings={this.props.settings}
          />
        </BackLink.Provider>
      </BodyClass>
    );
  }
}

export default connectAndFetch(redirectIfLibraryDisabled(FrontendContainer));
