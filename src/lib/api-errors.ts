import { isAxiosError } from 'axios';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import type { ApiFieldError } from '@/types/api';

// Maps the backend's validation payload ({ message, errors: [{ field, message }] }) onto
// react-hook-form fields, so failures show next to the input. Fields the form does not own
// are returned as `unmatched` for the caller to show (e.g. in a toast), never dropped.

export type { ApiFieldError };

export interface ApplyFieldErrorsResult {
  /** Errors set on a form field via setError(). */
  applied: ApiFieldError[];
  /** Errors with no matching form field. */
  unmatched: ApiFieldError[];
  /**
   * Toast description: the unmatched messages when any exist, otherwise "N fields need
   * attention.". Empty when the response carried no `errors[]`.
   */
  description: string;
}

type MinimalForm<T extends FieldValues> = Pick<
  UseFormReturn<T>,
  'setError' | 'getValues'
>;

/** `response.data.errors[]` of an axios error; [] for any other error or malformed entries. */
export function extractApiFieldErrors(err: unknown): ApiFieldError[] {
  if (!isAxiosError<{ errors?: unknown }>(err)) return [];

  const raw = err.response?.data?.errors;
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const { field, message } = entry as { field?: unknown; message?: unknown };
    if (typeof field !== 'string' || typeof message !== 'string') return [];
    if (!field || !message) return [];
    return [{ field, message }];
  });
}

/** 'answers.1.id' and 'answers[1].id' → ['answers', '1', 'id']. */
function splitPath(path: string): string[] {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
}

/**
 * Whether `path` addresses a field present on `values`. Presence, not truthiness: a field
 * may hold undefined (e.g. an empty file input). Own properties only, so names such as
 * `__proto__` never match.
 */
function hasFieldPath(values: unknown, path: string): boolean {
  const segments = splitPath(path);
  if (segments.length === 0) return false;

  let cursor: unknown = values;

  for (const segment of segments) {
    if (cursor === null || typeof cursor !== 'object') return false;

    if (Array.isArray(cursor)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= cursor.length) {
        return false;
      }
      cursor = cursor[index];
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(cursor, segment)) return false;
    cursor = (cursor as Record<string, unknown>)[segment];
  }

  return true;
}

/**
 * Sets the API's field errors on the form (`type: 'server'`; the first one requests focus)
 * and returns what could not be placed. `fieldMap` renames an API field to a form field
 * where the two disagree.
 */
export function applyApiFieldErrors<T extends FieldValues>(
  err: unknown,
  form: MinimalForm<T>,
  opts?: { fieldMap?: Record<string, string> },
): ApplyFieldErrorsResult {
  const fieldErrors = extractApiFieldErrors(err);

  if (fieldErrors.length === 0) {
    return { applied: [], unmatched: [], description: '' };
  }

  const values = form.getValues();
  const applied: ApiFieldError[] = [];
  const unmatched: ApiFieldError[] = [];

  for (const fieldError of fieldErrors) {
    const field = opts?.fieldMap?.[fieldError.field] ?? fieldError.field;

    if (!hasFieldPath(values, field)) {
      unmatched.push(fieldError);
      continue;
    }

    form.setError(
      field as FieldPath<T>,
      { type: 'server', message: fieldError.message },
      { shouldFocus: applied.length === 0 },
    );
    applied.push(fieldError);
  }

  return { applied, unmatched, description: describe(applied, unmatched) };
}

function describe(applied: ApiFieldError[], unmatched: ApiFieldError[]): string {
  if (unmatched.length > 0) {
    return unmatched.map((e) => `${e.field}: ${e.message}`).join('\n');
  }
  if (applied.length === 1) return '1 field needs attention.';
  return `${applied.length} fields need attention.`;
}
