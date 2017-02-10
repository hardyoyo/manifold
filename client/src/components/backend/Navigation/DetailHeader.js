import React, { PureComponent, PropTypes } from 'react';
import { Navigation } from 'components/backend';

export default class DetailHeader extends PureComponent {

  static displayName = "Navigation.DetailHeader";

  static propTypes = {
    breadcrumb: PropTypes.array,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string
  };

  static defaultProps = {
  }

  typeToManiconClass(type) {
    let segment = `${type}-placeholder`;
    if (type === "resource") segment = 'cube-shine';
    return `manicon-${segment}`;
  }

  render() {
    const breadcrumb = this.props.breadcrumb;
    return (
      <section className="bg-neutral95">
        {breadcrumb && breadcrumb.length > 0 ?
          <Navigation.Breadcrumb links={this.props.breadcrumb} />
          : null
        }
        <div className="container flush">
          <header className="project-header">
            <figure>
              <i className={`manicon ${this.typeToManiconClass(this.props.type)}`}></i>
            </figure>
            <div className="project-title">
              <h1>
                {this.props.title}
                <span className="subtitle">
                  {this.props.subtitle}
                </span>
              </h1>
                <div className="project-utility">
                  { this.props.utility ? this.props.utility : null }
                  { this.props.note ?
                    <span className="notes">
                      {this.props.note}
                    </span>
                  : null}
                </div>
            </div>
          </header>
        </div>
      </section>
    );
  }
}
