import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';

vi.mock('@/components/ui/Toast', () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

import PendingToastHandler from '@/components/providers/PendingToastHandler';
import { usePendingToastStore } from '@/store/usePendingToastStore';
import { toast } from '@/components/ui/Toast';

const notice = {
  type: 'info' as const,
  title: 'Password Changed',
  description: 'Your password has been updated. Please sign in again.',
};

describe('PendingToastHandler', () => {
  it('shows a queued notice once and clears it', async () => {
    vi.useFakeTimers();
    try {
      render(<PendingToastHandler />);

      act(() => usePendingToastStore.getState().setPendingToast(notice));
      await act(() => vi.advanceTimersByTimeAsync(100));

      expect(toast.info).toHaveBeenCalledTimes(1);
      expect(toast.info).toHaveBeenCalledWith(notice.title, {
        description: notice.description,
        duration: 5000,
      });
      expect(usePendingToastStore.getState().pendingToast).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('survives a full reload through sessionStorage', () => {
    usePendingToastStore.getState().setPendingToast(notice);

    expect(JSON.parse(sessionStorage.getItem('pending-toast') ?? '{}')).toMatchObject({
      state: { pendingToast: notice },
    });
  });
});
