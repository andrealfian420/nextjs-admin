// Activity log shapes (read-only module).

/** One row of GET /activity-logs. */
export interface ActivityLogRow {
  id: number;
  actionType: string | null;
  subjectType: string | null;
  description: string | null;
  user: { id: number; name: string } | null;
  /** Pre-formatted by the backend. */
  causedAt: string;
}

/**
 * GET /activity-logs/:id. `oldData`/`newData` are JSON snapshots of the subject (an object,
 * or `[]` when absent), so callers must not assume an object.
 */
export interface ActivityLog {
  id: number;
  userId: number;
  action: string | null;
  description: string | null;
  subjectType: string | null;
  subjectId: number;
  oldData: unknown;
  newData: unknown;
  createdAt: string;
  /** Pre-formatted by the backend. */
  causedAt: string;
  user: { id: number; name: string } | null;
}
