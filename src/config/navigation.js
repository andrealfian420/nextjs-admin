import {
  ChevronDown,
  Database,
  History,
  LayoutDashboard,
  Shield,
  Users,
} from 'lucide-react';

export const ADMIN_MENU = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    key: 'dash',
    href: '/admin',
    access: 'module.dashboard.index',
  },
  {
    name: 'Master Data',
    icon: Database,
    key: 'master',
    children: [
      {
        name: 'Users',
        icon: Users,
        key: 'users',
        href: '/admin/users',
        access: 'module.master-data.user.index',
      },
      {
        name: 'Roles',
        icon: Shield,
        key: 'roles',
        href: '/admin/roles',
        access: 'module.master-data.role.index',
      },
    ],
  },
  { separator: true }, // separator item, if you need to divide sections
  {
    name: 'Log Activity',
    icon: History,
    key: 'log-activity',
    href: '/admin/log-activity',
    access: 'module.log-activity.index',
  },
];
