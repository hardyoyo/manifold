import React, { PureComponent } from "react";
import Form from "global/components/form";
import PropTypes from "prop-types";

export default class ProjectContentTypeFormResources extends PureComponent {
  static displayName = "Project.Content.TypeForm.Types.Resources";

  static propTypes = {
    project: PropTypes.object.isRequired,
    getModelValue: PropTypes.func.isRequired
  };

  get showAllCollections() {
    return this.props.getModelValue("attributes[showAllCollections]");
  }

  get collections() {
    return this.props.project.relationships.resourceCollections;
  }

  render() {
    return (
      <>
        <Form.TextInput
          debug
          label="Title"
          name="attributes[title]"
          instructions={`If blank, the block title will default to "Resources"`}
          focusOnMount
        />
        <Form.Switch
          label="Show All Collections?"
          instructions="If set, all project collections will be included in the block. Otherwise, only featured selections will be shown."
          name="attributes[showAllCollections]"
          wide
        />
        {!this.showAllCollections ? (
          <>
            <Form.Picker
              placeholder="Add a Resource Collection"
              label="Show Specific Collections"
              optionToLabel={rc => rc.attributes.title}
              name="relationships[featuredCollections]"
              options={this.collections}
              listStyle="rows"
              showAddRemoveAll
              reorderable
              listRowComponent="FormOptionRow"
            />
          </>
        ) : null}
      </>
    );
  }
}
