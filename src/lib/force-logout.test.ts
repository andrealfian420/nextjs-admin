import { beforeEach, describe, expect, it, vi } from 'vitest';

// forceLogout runs once per page load, so every test gets fresh modules.
async function load() {
  vi.resetModules();
  const { clearSessionCookie, forceLogout } = await import('@/lib/force-logout');
  const { useAuthStore } = await import('@/store/useAuthStore');
  return { clearSessionCookie, forceLogout, useAuthStore };
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
});

describe('clearSessionCookie', () => {
  it('sends DELETE /api/auth/logout', async () => {
    const { clearSessionCookie } = await load();
    await clearSessionCookie();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', { method: 'DELETE' });
  });

  it('throws when the response is not ok', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 403 }));
    const { clearSessionCookie } = await load();
    await expect(clearSessionCookie()).rejects.toThrow('HTTP 403');
  });
});

describe('forceLogout', () => {
  it('clears the store and the cookie, then reloads on /login — once', async () => {
    const { forceLogout, useAuthStore } = await load();
    useAuthStore.getState().setAccessToken('token');
    const navigate = vi.fn();

    await Promise.all([forceLogout(navigate), forceLogout(navigate)]);

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('still navigates when the cookie could not be cleared', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    const { forceLogout } = await load();
    const navigate = vi.fn();

    await forceLogout(navigate);
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
