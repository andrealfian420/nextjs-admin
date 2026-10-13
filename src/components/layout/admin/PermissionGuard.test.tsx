import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

import PermissionGuard from '@/components/layout/admin/PermissionGuard';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserProfile } from '@/types/user';

const USER_EDIT = 'module.master-data.user.edit';

const signIn = (access: string[]) =>
  useAuthStore.getState().setUser({
    slug: 'a',
    name: 'A',
    email: 'a@example.test',
    avatar: null,
    role: { title: 'Role', access },
  } satisfies UserProfile);

const renderPage = () =>
  render(
    <PermissionGuard permission={USER_EDIT}>
      <h1>Edit User</h1>
    </PermissionGuard>,
  );

describe('PermissionGuard', () => {
  it('renders the page for a user holding the permission', () => {
    signIn([USER_EDIT]);
    renderPage();

    expect(screen.getByRole('heading', { name: 'Edit User' })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('never renders the page for a user without it and sends them to the dashboard', () => {
    signIn(['module.master-data.user.index']);
    renderPage();

    expect(screen.queryByRole('heading')).toBeNull();
    expect(replace).toHaveBeenCalledWith('/admin');
  });

  it('waits for the profile before deciding', () => {
    renderPage();

    expect(screen.queryByRole('heading')).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });
});
