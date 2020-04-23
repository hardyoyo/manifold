import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Form from "global/components/form";
import { sectionsAPI } from "api";
import { connect } from "react-redux";
import { entityStoreActions } from "actions";
import get from "lodash/get";
import Authorization from "helpers/authorization";

const { flush } = entityStoreActions;

export class StylesheetTextSections extends PureComponent {
  static mapStateToProps = state => {
    return {
      updateStylesheets: get(
        state.entityStore.responses,
        "update-textSections"
      ),
      authentication: state.authentication
    };
  };

  static displayName = "Stylesheet.Form.TextSections";

  static propTypes = {
    stylesheet: PropTypes.object,
    dispatch: PropTypes.func,
    authentication: PropTypes.object,
    wide: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.authorization = new Authorization();
  }

  componentWillUnmount() {
    this.props.dispatch(flush(["update-textSections"]));
  }

  fetchTextSections = () => {
    return sectionsAPI.forText(this.props.stylesheet.relationships.text.id);
  };

  render() {
    const stylesheet = this.props.stylesheet;
    if (!stylesheet) return null;

    return (
      <Form.Picker
        label="Apply to these text sections"
        placeholder={"Add a text section"}
        name="relationships[textSections]"
        optionToLabel={t => t.attributes.name}
        options={this.fetchTextSections}
        rowProps={{ namePath: "attributes.title" }}
        showAddRemoveAll
      />
    );
  }
}

export default connect(StylesheetTextSections.mapStateToProps)(
  StylesheetTextSections
);
