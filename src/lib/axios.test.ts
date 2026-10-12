import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/lib/axios';
import { forceLogout } from '@/lib/force-logout';
import { useAuthStore } from '@/store/useAuthStore';
import { mockApi, mockRefresh, networkError, respond } from '@/test/axios';

vi.mock('@/lib/force-logout', () => ({ forceLogout: vi.fn(), clearSessionCookie: vi.fn() }));

// Backend double: accepts only `Bearer fresh`, answers 401 otherwise.
let backend: ReturnType<typeof mockApi>;
beforeEach(() => {
  useAuthStore.getState().setAccessToken('expired');
  backend = mockApi((config) =>
    config.headers.Authorization === 'Bearer fresh'
      ? respond(config, 200, { ok: true })
      : respond(config, 401, { message: 'Unauthorized' }),
  );
});
afterEach(() => backend.restore());

describe('api 401 handling', () => {
  it('refreshes once and retries the request with the new token', async () => {
    const refresh = mockRefresh('fresh');

    await expect(api.get('/users')).resolves.toMatchObject({ data: { ok: true } });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(backend.adapter).toHaveBeenCalledTimes(2);
  });

  it('shares one refresh between parallel 401s', async () => {
    const refresh = mockRefresh('fresh');

    const results = await Promise.all([api.get('/users'), api.get('/roles'), api.get('/profile')]);

    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('gives up after one retry instead of looping', async () => {
    const refresh = mockRefresh('still-wrong');

    await expect(api.get('/users')).rejects.toMatchObject({ response: { status: 401 } });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(backend.adapter).toHaveBeenCalledTimes(2);
  });

  it('ends the session when the refresh is rejected', async () => {
    mockRefresh(401);

    await expect(Promise.all([api.get('/users'), api.get('/roles')])).rejects.toBeDefined();
    expect(forceLogout).toHaveBeenCalled();
  });

  it.each([503, 'network' as const])('keeps the session when the refresh fails with %s', async (answer) => {
    mockRefresh(answer);

    await expect(api.get('/users')).rejects.toBeDefined();
    expect(forceLogout).not.toHaveBeenCalled();
  });

  it('rejects a 401 as is when the request opts out of refreshing', async () => {
    const refresh = mockRefresh('fresh');

    await expect(api.get('/profile', { skipAuthRefresh: true })).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('passes other failures through untouched', async () => {
    const refresh = mockRefresh('fresh');
    backend.restore();
    backend = mockApi((config) => (config.url === '/down' ? networkError(config) : respond(config, 403)));

    await expect(api.get('/users')).rejects.toMatchObject({ response: { status: 403 } });
    await expect(api.get('/down')).rejects.toMatchObject({ code: 'ERR_NETWORK' });
    expect(refresh).not.toHaveBeenCalled();
  });
});
