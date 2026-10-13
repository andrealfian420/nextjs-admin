import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileMenu from '@/components/layout/admin/profile/ProfileMenu';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserProfile } from '@/types/user';

const handleLogout = vi.fn();
vi.mock('@/hooks/useLogout', () => ({ useLogout: () => ({ handleLogout }) }));

const signIn = (user: Partial<UserProfile>) =>
  useAuthStore.getState().setUser({ slug: 'ann', name: 'Ann', email: 'ann@example.test', avatar: null, ...user });

describe.each(['navbar', 'sidebar'] as const)('ProfileMenu (%s)', (variant) => {
  it('opens from the keyboard and offers Profile and Logout', async () => {
    const user = userEvent.setup();
    signIn({ role: { title: 'Editor', access: [] } });
    render(<ProfileMenu variant={variant} />);

    const trigger = screen.getByRole('button', { name: 'Account menu for Ann' });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('menuitem', { name: 'Profile' })).toHaveAttribute('href', '/admin/profile');
    expect(screen.getByText('ann@example.test')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Logout' }));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('falls back when the profile has no name, role or avatar', () => {
    signIn({ name: '', role: null });
    render(<ProfileMenu variant={variant} />);

    expect(screen.getByRole('button', { name: 'Account menu for Account' })).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    if (variant === 'sidebar') expect(screen.getByText('—')).toBeInTheDocument();
  });
});
