// User shapes. express-core v3 never returns internal ids on single-user payloads; `slug` is
// the public identifier.

/** The signed-in user (GET /profile) — drives the session store and permission checks. */
export interface UserProfile {
  slug: string;
  name: string;
  email: string;
  avatar: string | null;
  avatarUrl?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: {
    title: string;
    access: string[];
  } | null;
}

/** Role reference carried by a user record. */
export interface UserRole {
  id: number;
  slug: string;
  title: string;
  userType?: string;
}

/**
 * GET /users/:slug. `role` is optional: express-core 3.0.0 omits it, a later backend version
 * includes it so the edit form can preselect the role.
 */
export interface UserDetail {
  slug: string;
  name: string;
  email: string;
  avatar: string | null;
  avatarUrl?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: UserRole | null;
}

/** One row of GET /users. */
export interface UserRow {
  id: number;
  slug: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
  role?: UserRole | null;
  /** Role title, or '-' when the user has no role. */
  roleName: string;
  /** Pre-formatted by the backend. */
  registeredAt: string;
}

/**
 * Create/update body, sent as multipart/form-data. `roleId` is the role option value; an empty
 * `password` on update keeps the current one.
 */
export interface UserInput {
  name: string;
  email: string;
  roleId: string;
  password?: string;
  avatar?: File;
}

/** PUT /profile body, sent as multipart/form-data. A password change ends every session. */
export interface ProfileInput {
  name: string;
  password?: string;
  avatar?: File;
}
