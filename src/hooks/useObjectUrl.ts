import { useEffect, useMemo } from 'react';

// Revocations wait one task, so StrictMode's effect replay (cleanup, then the same effect
// again) can take a URL back instead of breaking a preview that is still on screen.
const pendingRevokes = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Blob URL to preview `file`, or null without one. One URL per File; it is revoked when the
 * file changes or is cleared and on unmount. Pass null for a file that must not be
 * previewed, e.g. a pick that failed validation, so no URL is allocated for it.
 */
export function useObjectUrl(file: File | null | undefined): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!url) return;

    clearTimeout(pendingRevokes.get(url));
    pendingRevokes.delete(url);

    return () => {
      pendingRevokes.set(
        url,
        setTimeout(() => {
          pendingRevokes.delete(url);
          URL.revokeObjectURL(url);
        }),
      );
    };
  }, [url]);

  return url;
}
