import blocks from "../Block/types";
import forms from "../TypeForm/types";
import contentBlockHelpers from "helpers/contentBlockHelpers";

class Resolver {
  typeToBlockComponent(type) {
    return contentBlockHelpers.typeToComponent(type, blocks);
  }

  typeToFormComponent(type) {
    return contentBlockHelpers.typeToComponent(type, forms);
  }

  typeToAvailableId(type) {
    return type;
  }

  typeToCurrentId(id) {
    return `current-${id}`;
  }
}

export default new Resolver();