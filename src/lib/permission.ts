import type { MenuItem, MenuLink } from '@/types/ui';
import type { UserProfile } from '@/types/user';

// UI-side permission checks against the signed-in user's `role.access`. They decide what to
// show; the backend still authorizes every API call.

export function hasAccess(
  user: UserProfile | null | undefined,
  permission: string | string[],
): boolean {
  const access = user?.role?.access;

  if (!Array.isArray(access)) {
    return false;
  }

  if (Array.isArray(permission)) {
    return permission.some((p) => access.includes(p));
  }

  return access.includes(permission);
}

// Links without `access` are visible to every signed-in user; a group is dropped when none
// of its links is visible.
export function filterMenuByAccess(
  menu: MenuItem[],
  user: UserProfile | null | undefined,
): MenuItem[] {
  const visible = (link: MenuLink) =>
    !link.access || hasAccess(user, link.access);

  return menu.flatMap((item): MenuItem[] => {
    if ('separator' in item) return [item];

    if ('children' in item) {
      const children = item.children.filter(visible);
      return children.length > 0 ? [{ ...item, children }] : [];
    }

    return visible(item) ? [item] : [];
  });
}
