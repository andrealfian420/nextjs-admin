export interface Role {
  id: number;
  name: string;
  title?: string;
  slug: string;
  access: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  roleId: number;
  role?: Role;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLink[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  field: string;
  message: string;
}

export interface MenuItem {
  name?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
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

export interface FetchParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  slug: string;
  roleName: string;
  registeredAt: string;
}

export interface RoleRow {
  id: number;
  name: string;
  slug: string;
  title: string;
  description: string;
}

export interface ActivityLogRow {
  id: number;
  actionType: string;
  subjectType: string;
  description: string;
  user: { name: string };
  causedAt: string;
}
