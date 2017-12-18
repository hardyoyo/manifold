import React, { Component } from "react";
import { Utility } from "components/global";
import PropTypes from "prop-types";

export default class Filters extends Component {
  static displayName = "Notes.List.Filters";

  static propTypes = {
    filterChangeHandler: PropTypes.func,
    filter: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  filteredBy(filter, format) {
    return filter.indexOf(format) > -1;
  }

  toggleFormat = (event, format) => {
    event.preventDefault();
    let formatsFilter = this.props.filter.formats;
    this.filteredBy(formatsFilter, format)
      ? formatsFilter.splice(formatsFilter.indexOf(format), 1)
      : formatsFilter.push(format);
    this.props.filterChangeHandler('formats', formatsFilter);
  };

  renderCheckBox(label, format) {
    const formats = this.props.filter.formats;
    const checked = this.filteredBy(formats, format);

    return (
      <label className="checkbox">
        <input type="checkbox" checked={checked} onChange={(e) => this.toggleFormat(e, format)} />
        <div className="control-indicator">
          <i className="manicon manicon-check" />
        </div>
        {label}
      </label>
    );
  }

  render() {
    return (
      <nav className="search-menu">
        <div className="filters">
          <label>Show your:</label>
          <div className="checkbox-group">
            {this.renderCheckBox('Highlights', 'highlight')}
            {this.renderCheckBox('Annotations', 'annotation')}
          </div>
        </div>
      </nav>
    );
  }
}