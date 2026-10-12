import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshProfile, restoreSession } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserProfile } from '@/types/user';
import { deferred, mockApi, mockRefresh, networkError, respond } from '@/test/axios';
import type { AxiosResponse } from 'axios';

const profile: UserProfile = {
  slug: 'admin',
  name: 'Admin',
  email: 'admin@example.test',
  avatar: null,
  role: { title: 'Super Admin', access: ['module.dashboard.index'] },
};

let backend: ReturnType<typeof mockApi> | undefined;
afterEach(() => backend?.restore());

const profileAnswers = (status: number | 'network') =>
  (backend = mockApi((config) =>
    status === 'network'
      ? networkError(config)
      : respond(config, status, status === 200 ? { data: profile } : { message: 'x' }),
  ));

describe('restoreSession', () => {
  it('stores the token and the profile', async () => {
    mockRefresh('token-1');
    profileAnswers(200);

    await expect(restoreSession()).resolves.toBe('authenticated');
    expect(useAuthStore.getState()).toMatchObject({ accessToken: 'token-1', user: profile });
    expect(backend!.adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer token-1');
  });

  it.each([
    ['refresh rejected', 401, 200, 'anonymous'],
    ['refresh unreachable', 'network', 200, 'unreachable'],
    ['refresh 5xx', 503, 200, 'unreachable'],
    ['malformed refresh', '', 200, 'anonymous'],
    ['profile 5xx', 'token-1', 500, 'unreachable'],
    ['profile unreachable', 'token-1', 'network', 'unreachable'],
  ] as const)('%s → %s', async (_, refresh, profileStatus, expected) => {
    mockRefresh(refresh);
    profileAnswers(profileStatus);

    await expect(restoreSession()).resolves.toBe(expected);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('treats a 401 on the profile as anonymous, without a second refresh that would wait on itself', async () => {
    const refresh = mockRefresh('token-1');
    profileAnswers(401);

    await expect(restoreSession()).resolves.toBe('anonymous');
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(backend!.adapter).toHaveBeenCalledTimes(1);
  });

  it('shares one attempt between concurrent callers (StrictMode runs effects twice)', async () => {
    const refresh = mockRefresh('token-1');
    profileAnswers(200);

    await expect(Promise.all([restoreSession(), restoreSession()])).resolves.toEqual([
      'authenticated',
      'authenticated',
    ]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(backend!.adapter).toHaveBeenCalledTimes(1);
  });

  it('does not bring the session back when the profile lands after a logout', async () => {
    mockRefresh('token-1');
    const answer = deferred<AxiosResponse>();
    backend = mockApi(() => answer.promise);

    const restoring = restoreSession();
    await vi.waitFor(() => expect(backend!.adapter).toHaveBeenCalled());
    useAuthStore.getState().logout();
    answer.resolve({ data: { data: profile }, status: 200, statusText: 'OK', headers: {}, config: {} as never });

    await expect(restoring).resolves.toBe('anonymous');
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null });
  });
});

describe('refreshProfile', () => {
  it('replaces the stored profile', async () => {
    profileAnswers(200);
    await refreshProfile();
    expect(useAuthStore.getState().user).toEqual(profile);
  });

  it('keeps the last known profile when the request fails', async () => {
    const stale = { ...profile, name: 'Stale' };
    useAuthStore.getState().setUser(stale);
    profileAnswers(500);

    await refreshProfile();
    expect(useAuthStore.getState().user).toEqual(stale);
  });
});
