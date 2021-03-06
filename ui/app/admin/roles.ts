import { Component, Input } from '@angular/core';
import { AuthService } from '../services/auth';
import { DataService, pagedResult } from '../services/data';
import { User, Role, PermissionGroup } from '../models';
import { Modal } from '../directives';
import * as _ from 'lodash';

type rolesPermissionGroupsType = {[key: string]: string[]};

@Component({
  selector: '[PermissionsGroup]',
  templateUrl: './app/templates/roles_permissions_group.html'
})
export class PermissionsGroup {
  @Input() group: PermissionGroup;
  @Input() roles: Role[];
  rolesPermissionGroups: rolesPermissionGroupsType = {};

  constructor() {
  }

  getRoleGroupPermissions(role: Role): string[] {
    let rolePermissionsGroup = _.find(role.data.permissions, {name: this.group.name});
    return rolePermissionsGroup ? rolePermissionsGroup.permissions : [];
  }

  getRolePermission(permission: string, role: Role) {
    return _.includes(this.getRoleGroupPermissions(role), permission);
  }
}

@Component({
  templateUrl: './app/templates/roles.html'
})
export class RolesComponent {
  roles: Role[] = null;
  permissions: PermissionGroup[] = [];
  newRole: Role = new Role({data: {permissions: []}});

  constructor(
    private data: DataService,
    private modal: Modal,
    private auth: AuthService
  ) {
    this.fetchData();
    // Permissions are not going to change
    this.data.permission().findAll({})
      .then(
        (permissions: pagedResult) => this.permissions = permissions.items,
        (error: any) => this.data.handleResponseError(error)
      );
  }

  fetchData() {
    this.data.role().findAll({})
      .then(
        (roles: pagedResult) => this.roles = roles.items,
        (error: any) => this.data.handleResponseError(error)
      );
  }

  editRole(role: Role = null) {
    this.newRole = _.isNull(role) ? new Role({data: {permissions: []}}) : role.clone();
    this.modal.show();
  }

  deleteRole(role: Role = null) {
    this.data.role().destroy(role.id)
      .then(
        () => this.fetchData(),
        (error: any) => this.data.handleResponseError(error)
      );
  }

  getGroupPermission(group: PermissionGroup, permission: string): boolean {
    let roleGroup = _.find(this.newRole.data.permissions, {name: group.name});
    if (!roleGroup) {
      return false;
    }
    return _.includes(roleGroup.permissions, permission);
  }

  toggleGroupPermission(group: PermissionGroup, permission: string) {
    let groupIndex = _.findIndex(this.newRole.data.permissions, {name: group.name});
    let groupPermissions = groupIndex >= 0 ?
      this.newRole.data.permissions[groupIndex] :
      new PermissionGroup({name: group.name, permissions: []});

    if (_.includes(groupPermissions.permissions, permission)) {
      _.pull(groupPermissions.permissions, permission);
      if (_.isEmpty(groupPermissions.permissions)) {
        _.remove(
          this.newRole.data.permissions,
          (roleGroup) => roleGroup.name === group.name
        ) as [PermissionGroup];
        return;
      }
    } else {
      groupPermissions.permissions.push(permission);
    }

    if (groupIndex >= 0) {
      this.newRole.data.permissions[groupIndex] = groupPermissions;
    } else {
      this.newRole.data.permissions.push(groupPermissions);
    }
  }

  save() {
    var savePromise: Promise<any>;
    if (this.newRole.id) {
      // Update role
      savePromise = this.data.role().postUpdate(this.newRole.id, this.newRole)
        .then(() => this.auth.invalidateUser());
    } else {
      // Create new role
      savePromise = this.data.role().postCreate(this.newRole);
    }
    return savePromise
      .then(
        () => {
          this.modal.close();
          this.fetchData();
        },
        (error: any) => this.data.handleResponseError(error)
      );
  }
};

