import type { PaginationParams } from '@/types/api';

// Query string for every paginated list endpoint. Empty search is omitted, and sort_dir is
// only sent together with sort_by.
export function toListParams({
  page = 1,
  per_page = 10,
  search = '',
  sort_by,
  sort_dir,
}: PaginationParams = {}): PaginationParams {
  const params: PaginationParams = { page, per_page };

  if (search) params.search = search;
  if (sort_by) {
    params.sort_by = sort_by;
    params.sort_dir = sort_dir ?? 'asc';
  }

  return params;
}
