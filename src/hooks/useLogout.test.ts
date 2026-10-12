import { beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import axios from 'axios';
import { toast } from 'sonner';
import { useLogout } from '@/hooks/useLogout';
import { refreshAccessToken } from '@/lib/refresh-token';
import { useAuthStore } from '@/store/useAuthStore';
import { deferred, networkError, respond } from '@/test/axios';

const replace = vi.fn();
const router = { replace }; // Next returns a stable router instance
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

let fetchMock: ReturnType<typeof vi.fn>;
let post: MockInstance<typeof axios.post>;

beforeEach(() => {
  replace.mockReset();
  useAuthStore.getState().setAccessToken('token');
  fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  post = vi.spyOn(axios, 'post').mockImplementation((url) => respond({ url } as never, 200, {}));
});

async function logout(arg?: unknown) {
  const { result } = renderHook(() => useLogout());
  await act(() => result.current.handleLogout(arg as never));
}

const loggedOut = () => {
  expect(useAuthStore.getState().accessToken).toBeNull();
  expect(replace).toHaveBeenCalledWith('/login');
};

describe('useLogout', () => {
  it('revokes the session on the backend, clears the store and replaces the route', async () => {
    await logout();
    expect(post).toHaveBeenCalledWith('/api/auth/logout');
    expect(fetchMock).not.toHaveBeenCalled();
    loggedOut();
  });

  it('treats a click event passed by onClick as a regular logout', async () => {
    await logout({ type: 'click' });
    expect(post).toHaveBeenCalledWith('/api/auth/logout');
    loggedOut();
  });

  it('after a password change only clears the cookie, without a second backend logout', async () => {
    await logout('PROFILE_PASSWORD_CHANGED');
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', { method: 'DELETE' });
    expect(post).not.toHaveBeenCalled();
    loggedOut();
  });

  it('keeps the session and reports failure when the cookie deletion is not ok', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));

    await logout('PROFILE_PASSWORD_CHANGED');

    expect(toast.error).toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBe('token');
    expect(replace).not.toHaveBeenCalled();
  });

  it('logs out locally when the backend fails, because the BFF cleared the cookie anyway', async () => {
    post.mockImplementation((url) => respond({ url } as never, 503));
    await logout();
    loggedOut();
  });

  it.each([
    ['the BFF is unreachable', () => networkError()],
    ['the origin is rejected', () => respond({} as never, 403)],
  ])('keeps the session when %s', async (_, answer) => {
    post.mockImplementation(answer as never);

    await logout();

    expect(toast.error).toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBe('token');
    expect(replace).not.toHaveBeenCalled();
  });

  it('waits for a refresh in flight so the rotated cookie is the one revoked', async () => {
    const refreshAnswer = deferred<unknown>();
    post.mockImplementation((url) =>
      url === '/api/auth/refresh' ? (refreshAnswer.promise as never) : respond({ url } as never, 200, {}),
    );
    const refreshing = refreshAccessToken();

    const { result } = renderHook(() => useLogout());
    let done = false;
    const loggingOut = act(() => result.current.handleLogout().then(() => void (done = true)));

    await Promise.resolve();
    expect(post).not.toHaveBeenCalledWith('/api/auth/logout');

    refreshAnswer.resolve({ data: { data: { accessToken: 'rotated' } } });
    await refreshing;
    await loggingOut;

    expect(done).toBe(true);
    expect(post).toHaveBeenLastCalledWith('/api/auth/logout');
    loggedOut();
  });
});
