import { describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import {
  isTransientError,
  refreshAccessToken,
  SessionEndedError,
  waitForPendingRefresh,
} from '@/lib/refresh-token';
import { useAuthStore } from '@/store/useAuthStore';
import { deferred, mockRefresh, networkError, respond } from '@/test/axios';

describe('refreshAccessToken', () => {
  it('shares one request between concurrent callers and stores the token', async () => {
    const post = mockRefresh('token-1');

    const tokens = await Promise.all([refreshAccessToken(), refreshAccessToken(), refreshAccessToken()]);

    expect(tokens).toEqual(['token-1', 'token-1', 'token-1']);
    expect(post).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe('token-1');
  });

  it('starts a new request once the previous one settled', async () => {
    const post = mockRefresh('token-1', 'token-2');

    await refreshAccessToken();
    await expect(refreshAccessToken()).resolves.toBe('token-2');
    expect(post).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['no data', {}],
    ['an empty token', { data: { accessToken: '' } }],
    ['a non-string token', { data: { accessToken: 42 } }],
  ])('rejects a response with %s and stores nothing', async (_, body) => {
    vi.spyOn(axios, 'post').mockImplementation((url) => respond({ url } as never, 200, body));

    await expect(refreshAccessToken()).rejects.toThrow('no access token');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('drops a token that arrives after a logout', async () => {
    const answer = deferred<unknown>();
    vi.spyOn(axios, 'post').mockReturnValue(answer.promise as never);

    const refresh = refreshAccessToken();
    useAuthStore.getState().logout();
    answer.resolve({ data: { data: { accessToken: 'late' } } });

    await expect(refresh).rejects.toBeInstanceOf(SessionEndedError);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});

describe('waitForPendingRefresh', () => {
  it('resolves at once when nothing is in flight', async () => {
    await expect(waitForPendingRefresh()).resolves.toBeUndefined();
  });

  it('resolves only after the refresh in flight settles, even when it fails', async () => {
    const answer = deferred<unknown>();
    vi.spyOn(axios, 'post').mockReturnValue(answer.promise as never);
    const refresh = refreshAccessToken().catch(() => 'failed');

    let waited = false;
    const wait = waitForPendingRefresh().then(() => (waited = true));
    await Promise.resolve();
    expect(waited).toBe(false);

    answer.reject(new Error('boom'));
    await wait;
    await expect(refresh).resolves.toBe('failed');
    expect(waited).toBe(true);
  });
});

describe('isTransientError', () => {
  it('is true only for a missing response or a 5xx', async () => {
    const config = { url: '/x' } as never;
    const errorOf = (p: Promise<unknown>) => p.catch((err) => err);

    expect(isTransientError(await errorOf(networkError(config)))).toBe(true);
    expect(isTransientError(await errorOf(respond(config, 503)))).toBe(true);
    expect(isTransientError(await errorOf(respond(config, 401)))).toBe(false);
    expect(isTransientError(new Error('plain'))).toBe(false);
  });
});
