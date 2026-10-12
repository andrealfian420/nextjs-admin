import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isAxiosError } from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A message to show for a failed request: the backend's `message` when it sent one, else
 * `fallback`. Axios' own messages ("Request failed with status code 500") are not shown.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = 'An error occurred. Please try again.',
): string {
  if (isAxiosError<{ message?: unknown }>(err)) {
    const message = err.response?.data?.message;
    return typeof message === 'string' && message ? message : fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
