import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthProvider from '@/components/providers/AuthProvider';
import { useAuthStore } from '@/store/useAuthStore';
import { mockApi, mockRefresh, respond } from '@/test/axios';

const replace = vi.fn();
const router = { replace }; // Next returns a stable router instance
let pathname = '/admin/users';
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => pathname,
}));

const profile = { slug: 'admin', name: 'Admin', email: 'a@example.test', avatar: null, role: { title: 'Admin', access: [] } };

let fetchMock: ReturnType<typeof vi.fn>;
let backend: ReturnType<typeof mockApi>;

function at(path: string) {
  pathname = path;
  window.history.replaceState(null, '', path);
}

beforeEach(() => {
  replace.mockReset();
  at('/admin/users');
  fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  backend = mockApi((config) => respond(config, 200, { data: profile }));
});
afterEach(() => backend.restore());

const renderProvider = () =>
  render(
    <StrictMode>
      <AuthProvider>
        <p>admin content</p>
      </AuthProvider>
    </StrictMode>,
  );

describe('AuthProvider', () => {
  it('restores the session with a single refresh under StrictMode', async () => {
    const refresh = mockRefresh('token-1');

    renderProvider();

    await waitFor(() => expect(useAuthStore.getState().user).toEqual(profile));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText('admin content')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('clears a rejected session cookie before redirecting an admin page to /login', async () => {
    mockRefresh(401);

    renderProvider();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', { method: 'DELETE' });
  });

  it('offers a retry when the cookie could not be cleared, and recovers', async () => {
    mockRefresh(401);
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }));

    renderProvider();

    expect(await screen.findByRole('alert')).toHaveTextContent("couldn't end your session");
    expect(replace).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('offers a retry when the backend is unreachable, without ending the session', async () => {
    const refresh = mockRefresh(503, 'token-1');

    renderProvider();

    expect(await screen.findByRole('alert')).toHaveTextContent("couldn't reach the server");
    expect(fetchMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(screen.getByText('admin content')).toBeInTheDocument());
    expect(useAuthStore.getState().user).toEqual(profile);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('leaves public pages alone when there is no session', async () => {
    at('/login');
    const refresh = mockRefresh(401);

    renderProvider();

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(screen.getByText('admin content')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
