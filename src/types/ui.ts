// Client-only UI shapes (navigation menu, deferred toasts).

import type { ComponentType } from 'react';

export interface MenuItem {
  name?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  key?: string;
  href?: string;
  access?: string | string[];
  children?: MenuItem[];
  separator?: boolean;
}

export interface PendingToast {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}
