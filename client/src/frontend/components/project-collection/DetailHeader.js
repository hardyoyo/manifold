import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import IconComputed from "global/components/icon-computed";
import Filters from "./Filters";
import Constants from "./Constants";

const BLOCKCLASS = "project-collection";

export default class ProjectCollectionDetailHeader extends PureComponent {
  static displayName = "ProjectCollectionDetailHeader";

  static propTypes = {
    projectCollection: PropTypes.object.isRequired,
    filterChangeHandler: PropTypes.func,
    initialState: PropTypes.func,
    showFilters: PropTypes.bool
  };

  static defaultProps = {
    showFilters: false
  };

  get showFilters() {
    return this.props.showFilters;
  }

  get projectCollection() {
    return this.props.projectCollection;
  }

  get collectionAttributes() {
    return this.projectCollection.attributes;
  }

  get iconFill() {
    if (this.collectionAttributes.icon === "new-round") {
      return "var(--accent-primary, #52e3ac)";
    }

    return "currentColor";
  }

  get title() {
    return (
      <div className="body">
        <h2 className="title project-collection__title">
          {this.collectionAttributes.title}
        </h2>
      </div>
    );
  }

  get description() {
    if (!this.collectionAttributes.descriptionFormatted) {
      return null;
    }

    return (
      <div className="entity-section-wrapper__details">
        <p className="description">
          {this.collectionAttributes.descriptionFormatted}
        </p>
      </div>
    );
  }

  get icon() {
    if (this.collectionAttributes.iconStyles) {
      return (
        <img
          className="project-collection__icon"
          src={this.collectionAttributes.iconStyles.square}
          alt="square"
        />
      );
    }

    if (this.collectionAttributes.icon) {
      return (
        <IconComputed.ProjectCollection
          icon={this.collectionAttributes.icon}
          size={56}
          fill={this.iconFill}
        />
      );
    }

    return null;
  }

  get filter() {
    return (
      <Filters
        filterChangeHandler={this.props.filterChangeHandler}
        initialState={this.props.initialState}
      />
    );
  }

  get isIcon() {
    return !!(
      this.collectionAttributes.iconStyles || this.collectionAttributes.icon
    );
  }

  get isSquare() {
    return !!(
      this.collectionAttributes.heroStyles &&
      this.collectionAttributes.heroLayout === Constants.SQUARE
    );
  }

  get isWide() {
    return !!(
      this.collectionAttributes.heroStyles &&
      this.collectionAttributes.heroLayout === Constants.WIDE
    );
  }

  get isFull() {
    return !!(
      this.collectionAttributes.heroStyles &&
      this.collectionAttributes.heroLayout === Constants.FULL
    );
  }

  render() {
    if (this.isSquare) {
      return (
        <div className={`${BLOCKCLASS}__wrapper_square `}>
          <img
            className={`${BLOCKCLASS}__square-image`}
            src={this.collectionAttributes.heroStyles.mediumSquare}
            alt="Project Collection"
          />
          <div>
            {this.showFilters ? (
              <div className={`${BLOCKCLASS}__search-title`}>
                <div className={`${BLOCKCLASS}__icon-title main`}>
                  {this.icon}
                  {this.title}
                </div>
                {this.filter}
              </div>
            ) : (
              <div className={`${BLOCKCLASS}__icon-title main`}>
                {this.icon}
                {this.title}
              </div>
            )}
            {this.description}
          </div>
        </div>
      );
    }

    if (this.isWide) {
      return (
        <div className={`${BLOCKCLASS}__wrapper `}>
          <div className={`${BLOCKCLASS}__icon-title main`}>
            {this.icon}
            {this.title}
          </div>
          <div
            className={`${BLOCKCLASS}__hero-image-wrapper ${BLOCKCLASS}__hero-image-wrapper_wide`}
          >
            <img
              className={`${BLOCKCLASS}__hero-image`}
              src={this.collectionAttributes.heroStyles.mediumLandscape}
              alt="Project Collection"
            />
          </div>
          {this.description}
        </div>
      );
    }

    if (this.isFull) {
      return (
        <div className={`${BLOCKCLASS}__wrapper_full`}>
          <div
            className={`${BLOCKCLASS}__hero-image-wrapper ${BLOCKCLASS}__hero-image-wrapper_full`}
          >
            <img
              className={`${BLOCKCLASS}__hero-image`}
              src={this.collectionAttributes.heroStyles.largeLandscape}
              alt="Project Collection"
            />
          </div>
          <div className="container">
            <div className={`${BLOCKCLASS}__icon-title main`}>
              {this.icon}
              {this.title}
            </div>
            {this.description}
          </div>
        </div>
      );
    }

    return (
      <div className={`${BLOCKCLASS}__wrapper `}>
        {this.showFilters ? (
          <div className={`${BLOCKCLASS}__search-title`}>
            <div className={`${BLOCKCLASS}__icon-title`}>
              {this.icon}
              {this.title}
            </div>
            {this.showFilters && this.filter}
          </div>
        ) : (
          <div className={`${BLOCKCLASS}__icon-title main`}>
            {this.icon}
            {this.title}
          </div>
        )}
        {this.description}
      </div>
    );
  }
}
