// Role and permission shapes. Permissions are plain strings checked against `role.access`.

export interface Role {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  /** One of GET /roles/user-types. */
  userType: string;
  access: string[];
}

/** One row of GET /roles. */
export interface RoleRow {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  userType: string;
}

/** Create/update body. */
export interface RoleInput {
  title: string;
  userType: string;
  description?: string | null;
  access: string[];
}

/** GET /roles/access-list: module → sub-module → selectable permissions. */
export interface PermissionActivity {
  label: string;
  value: string;
}

export interface PermissionSubModule {
  module: string;
  activities: PermissionActivity[];
}

export interface PermissionModule {
  module: string;
  sub_module: PermissionSubModule[];
}
