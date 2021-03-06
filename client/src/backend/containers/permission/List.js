import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import connectAndFetch from "utils/connectAndFetch";
import { permissionsAPI, requests } from "api";
import { entityStoreActions } from "actions";
import lh from "helpers/linkHandler";
import entityUtils from "utils/entityUtils";
import EntitiesList, {
  Button,
  PermissionRow
} from "backend/components/list/EntitiesList";

const { select } = entityUtils;
const { request } = entityStoreActions;

export class PermissionContainer extends PureComponent {
  static mapStateToProps = state => {
    return {
      permissions: select(requests.bePermissions, state.entityStore)
    };
  };

  static displayName = "PermissionContainer";

  static propTypes = {
    entity: PropTypes.object.isRequired,
    permissions: PropTypes.array,
    linkName: PropTypes.string,
    dispatch: PropTypes.func,
    match: PropTypes.object
  };

  componentDidMount() {
    const entity = this.props.entity;
    const action = request(
      permissionsAPI.index(entity, {}, {}),
      requests.bePermissions
    );
    this.props.dispatch(action);
  }

  render() {
    const { match, entity, permissions } = this.props;
    const active = match.params.id;
    const listUrl = lh.nameFromType("backend", "Permission", entity);
    const newUrl = lh.nameFromType("backend", "PermissionsNew", entity);

    return (
      <section>
        {permissions && (
          <EntitiesList
            title="Editor Permissions"
            instructions="Use permissions to specify which users may modify this project in the backend, and the extent to which they can modify it."
            titleStyle="section"
            entities={permissions}
            entityComponent={PermissionRow}
            entityComponentProps={{
              active,
              linkName: listUrl
            }}
            buttons={[
              <Button
                path={lh.link(newUrl, entity.id)}
                text="Grant editor permissions"
                type="add"
                authorizedTo="createPermissions"
                authorizedFor={entity}
              />
            ]}
          />
        )}
      </section>
    );
  }
}

export default connectAndFetch(PermissionContainer);
