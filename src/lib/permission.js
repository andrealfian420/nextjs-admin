export function hasAccess(user, permission) {
  if (!user?.role?.access) {
    return false;
  }

  if (Array.isArray(permission)) {
    return permission.some((p) => user.role.access.includes(p));
  }

  return user.role.access.includes(permission);
}
