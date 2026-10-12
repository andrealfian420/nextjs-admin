// Barrel for all shared types. New code may import from the domain module directly
// (e.g. '@/types/user'); both resolve to the same declarations.

export * from './api';
export * from './auth';
export * from './log';
export * from './role';
export * from './ui';
export * from './user';
export * from './util';

import type { PaginationParams } from './api';
import type { UserProfile } from './user';

// Legacy names kept while callers migrate; remove once nothing imports them.
/** @deprecated Use `UserProfile` (session user) or `UserDetail` (user management). */
export type User = UserProfile;
/** @deprecated Use `PaginationParams`. */
export type FetchParams = PaginationParams;
