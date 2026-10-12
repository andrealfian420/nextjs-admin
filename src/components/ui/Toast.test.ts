import { describe, expect, it, vi } from 'vitest';
import { toast as sonnerToast } from 'sonner';
import { toast } from '@/components/ui/Toast';

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn(), loading: vi.fn() }),
}));

describe('toast', () => {
  it('applies the default position and duration', () => {
    toast.success('Saved');
    expect(sonnerToast.success).toHaveBeenCalledWith(
      'Saved',
      expect.objectContaining({ position: 'top-right', duration: 5000 }),
    );
  });

  it('keeps an explicit duration of 0 and a custom position', () => {
    toast.error('Failed', { duration: 0, position: 'top-center', description: 'Retry' });
    expect(sonnerToast.error).toHaveBeenCalledWith(
      'Failed',
      expect.objectContaining({ duration: 0, position: 'top-center', description: 'Retry' }),
    );
  });
});
