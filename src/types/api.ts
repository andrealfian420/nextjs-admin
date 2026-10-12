// Response envelopes and list contracts shared by every service (backend: express-core).

/** One field-level validation error; the backend sends `errors[]` on every 4xx. */
export interface ApiFieldError {
  field: string;
  message: string;
}

/** Standard envelope: `{ success, message, data }`, plus `errors` on validation failures. */
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  errors?: ApiFieldError[];
  data: T;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
  /** Honoured only when the backend whitelists the column; otherwise its default sort applies. */
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLink[];
}

/** What a list service resolves with: the envelope around one page. */
export type PaginatedResponse<T> = ApiResponse<PaginatedResult<T>>;
