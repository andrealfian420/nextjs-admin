'use client';

import { useEffect, useRef } from 'react';
import { toast } from '@/components/ui/Toast';
import { usePendingToastStore } from '@/store/usePendingToastStore';

// Reads any pending toast from the store (persisted in sessionStorage) and fires
// it once it's set. Works for both:
// - Full page reloads (window.location.href): store is hydrated from sessionStorage on mount
// - Client-side navigation (router.replace): store change triggers this effect reactively
export default function PendingToastHandler() {
  const pendingToast = usePendingToastStore((state) => state.pendingToast);
  const clearPendingToast = usePendingToastStore(
    (state) => state.clearPendingToast,
  );
  const timerRef = useRef(null);

  useEffect(() => {
    if (!pendingToast) return;
    // No return/cleanup here — returning a cleanup function would cause React to call
    // clearTimeout when clearPendingToast() triggers a re-render, cancelling the toast
    // before it fires. Instead, we cancel only on unmount via the second effect below.

    const { type, title, description } = pendingToast;

    // Clear the store first to prevent re-firing on subsequent re-renders
    clearPendingToast();

    // Defer slightly so the Toaster component has time to mount first
    timerRef.current = setTimeout(() => {
      toast[type]?.(title, { description, duration: 5000 });
    }, 100);
  }, [pendingToast]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel timer only on unmount — not on every re-render
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
