import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Can from '@/components/layout/admin/Can';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserProfile } from '@/types/user';

const signIn = (role: UserProfile['role']) =>
  useAuthStore.getState().setUser({ slug: 'a', name: 'A', email: 'a@example.test', avatar: null, role });

const renderAction = () =>
  render(
    <Can permission='module.master-data.user.delete' fallback={<span>no access</span>}>
      <button type='button'>Delete</button>
    </Can>,
  );

describe('Can', () => {
  it('shows the action when the role grants the permission', () => {
    signIn({ title: 'Admin', access: ['module.master-data.user.delete'] });
    renderAction();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it.each([
    ['a role without the permission', { title: 'Viewer', access: ['module.master-data.user.index'] }],
    ['no role', null],
  ])('hides the action for %s', (_, role) => {
    signIn(role);
    renderAction();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('no access')).toBeInTheDocument();
  });

  it('renders nothing before the profile is loaded', () => {
    const { container } = renderAction();
    expect(container).toBeEmptyDOMElement();
  });
});
