import { describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import AdminAccessGuard from '@/components/layout/admin/AdminAccessGuard';
import { useAuthStore } from '@/store/useAuthStore';

describe('AdminAccessGuard', () => {
  it('holds the shell until the profile is loaded', () => {
    render(
      <AdminAccessGuard>
        <p>shell</p>
      </AdminAccessGuard>,
    );
    expect(screen.queryByText('shell')).toBeNull();

    act(() =>
      useAuthStore.getState().setUser({ slug: 'a', name: 'A', email: 'a@example.test', avatar: null, role: null }),
    );
    expect(screen.getByText('shell')).toBeInTheDocument();
  });
});
