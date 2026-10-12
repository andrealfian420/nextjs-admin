import { describe, expect, it } from 'vitest';
import { filterMenuByAccess, hasAccess } from '@/lib/permission';
import type { MenuItem, User } from '@/types';

const userWith = (access: string[]) =>
  ({ role: { access } }) as unknown as User;

const USER_INDEX = 'module.master-data.user.index';
const ROLE_INDEX = 'module.master-data.role.index';
const LOG_INDEX = 'module.activity-log.index';

describe('hasAccess', () => {
  it('grants access when the permission is in the list', () => {
    expect(hasAccess(userWith([USER_INDEX]), USER_INDEX)).toBe(true);
  });

  it('denies access when the permission is absent', () => {
    expect(hasAccess(userWith([ROLE_INDEX]), USER_INDEX)).toBe(false);
  });

  it('grants access when ANY permission of an array matches', () => {
    expect(hasAccess(userWith([ROLE_INDEX]), [USER_INDEX, ROLE_INDEX])).toBe(true);
  });

  it('denies access when no permission of an array matches', () => {
    expect(hasAccess(userWith(['other']), [USER_INDEX, ROLE_INDEX])).toBe(false);
  });

  it('denies access for a missing user, role or access list', () => {
    expect(hasAccess(null, USER_INDEX)).toBe(false);
    expect(hasAccess({} as User, USER_INDEX)).toBe(false);
    expect(hasAccess({ role: null } as unknown as User, USER_INDEX)).toBe(false);
  });
});

describe('filterMenuByAccess', () => {
  const menu: MenuItem[] = [
    { name: 'Dashboard', key: 'dash', href: '/admin' },
    {
      name: 'Master Data',
      key: 'master',
      children: [
        { name: 'Users', key: 'users', href: '/admin/users', access: USER_INDEX },
        { name: 'Roles', key: 'roles', href: '/admin/roles', access: ROLE_INDEX },
      ],
    },
    { separator: true },
    { name: 'Activity Logs', key: 'logs', href: '/admin/activity-logs', access: LOG_INDEX },
  ];

  const names = (items: MenuItem[]) => items.map((item) => item.name);

  it('keeps only the items the user can reach', () => {
    const result = filterMenuByAccess(menu, userWith([LOG_INDEX]));
    expect(names(result)).toContain('Activity Logs');
    expect(names(result)).not.toContain('Master Data');
  });

  it('keeps separators and items without an access requirement', () => {
    const result = filterMenuByAccess(menu, userWith([]));
    expect(result.some((item) => item.separator)).toBe(true);
    expect(names(result)).toContain('Dashboard');
  });

  it('keeps only the permitted children of a parent item', () => {
    const result = filterMenuByAccess(menu, userWith([ROLE_INDEX]));
    const parent = result.find((item) => item.name === 'Master Data');
    expect(parent?.children?.map((child) => child.name)).toEqual(['Roles']);
  });

  it('hides restricted items from an anonymous visitor', () => {
    const result = filterMenuByAccess(menu, null);
    expect(names(result)).not.toContain('Activity Logs');
    expect(names(result)).not.toContain('Master Data');
  });
});
