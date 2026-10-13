// Client-only UI shapes (navigation menu, deferred toasts).

import type { ComponentType } from 'react';

type MenuIcon = ComponentType<{ size?: number; className?: string }>;

/** A navigation link. Without `access` it is visible to every signed-in user. */
export interface MenuLink {
  key: string;
  name: string;
  href: string;
  icon?: MenuIcon;
  access?: string | string[];
}

/** A collapsible group; hidden when none of its links is visible. */
export interface MenuGroup {
  key: string;
  name: string;
  icon?: MenuIcon;
  children: MenuLink[];
}

export interface MenuSeparator {
  separator: true;
}

export type MenuItem = MenuLink | MenuGroup | MenuSeparator;

export interface PendingToast {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}
