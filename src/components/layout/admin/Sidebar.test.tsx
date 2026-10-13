import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '@/components/layout/admin/Sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useSidebarStore } from '@/store/useSidebarStore';

let pathname = '/admin/users/jane';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));
vi.mock('@/hooks/useLogout', () => ({ useLogout: () => ({ handleLogout: vi.fn() }) }));

const signIn = (access: string[]) =>
  useAuthStore.getState().setUser({ slug: 'a', name: 'A', email: 'a@example.test', avatar: null, role: { title: 'R', access } });

const open = () => act(() => useSidebarStore.setState({ isOpen: true }));

describe('Sidebar', () => {
  it('shows only permitted links and marks the most specific active one', () => {
    signIn(['module.dashboard.index', 'module.master-data.user.index']);
    open();
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('link', { name: 'Roles' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Activity Logs' })).toBeNull();
  });

  it('opens the group of the active link and lets the user collapse it', async () => {
    const user = userEvent.setup();
    signIn(['module.master-data.user.index', 'module.master-data.role.index']);
    open();
    render(<Sidebar />);

    const group = screen.getByRole('button', { name: 'Master Data' });
    expect(group).toHaveAttribute('aria-expanded', 'true');

    await user.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'false');
    // Collapsed links are out of the tab order.
    expect(document.getElementById(group.getAttribute('aria-controls')!)).toHaveAttribute('inert');
  });

  it('keeps a closed sidebar out of the tab order', () => {
    signIn(['module.dashboard.index']);
    render(<Sidebar />);
    expect(document.getElementById('admin-sidebar')).toHaveAttribute('inert');
  });

  it('shows the app identity from config', () => {
    signIn([]);
    open();
    render(<Sidebar />);
    expect(screen.getByText('nextjs-admin')).toBeInTheDocument();
  });
});
