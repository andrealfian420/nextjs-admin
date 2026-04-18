export function hasAccess(user, permission) {
  if (!user?.role?.access) {
    return false;
  }

  if (Array.isArray(permission)) {
    return permission.some((p) => user.role.access.includes(p));
  }

  return user.role.access.includes(permission);
}

export function filterMenuByAccess(menu, user) {
  return menu
    .map((item) => {
      if (item.separator) return item;

      if (item.children) {
        const filteredChildren = item.children.filter((child) => {
          return hasAccess(user, child.access);
        });

        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }

      if (!item.access || hasAccess(user, item.access)) {
        return item;
      }

      return null;
    })
    .filter(Boolean);
}
