// Helpers for tests that drive axios without a network: build the settled response or
// AxiosError a real adapter would produce, and route the api instance through a fake adapter.

import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { vi } from 'vitest';
import api from '@/lib/axios';

type Config = InternalAxiosRequestConfig;

/** What a real adapter does with an HTTP answer: resolve 2xx, reject anything else. */
export function respond<T>(config: Config, status: number, data?: T): Promise<AxiosResponse<T>> {
  const response = { data: data as T, status, statusText: String(status), headers: {}, config };
  if (status >= 200 && status < 300) return Promise.resolve(response);
  return Promise.reject(
    new AxiosError(`HTTP ${status}`, AxiosError.ERR_BAD_RESPONSE, config, null, response),
  );
}

/** A request that never got an answer. */
export function networkError(config: Config = {} as Config): Promise<never> {
  return Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config));
}

/** Routes every `api` request through `handler`; restore with the returned function. */
export function mockApi(handler: (config: Config) => Promise<AxiosResponse>) {
  const original = api.defaults.adapter;
  const adapter = vi.fn<AxiosAdapter>((config) => handler(config));
  api.defaults.adapter = adapter;
  return { adapter, restore: () => void (api.defaults.adapter = original) };
}

/**
 * Stubs the raw-axios POST /api/auth/refresh. Each call to `next` decides one answer:
 * a token string, an HTTP status, or 'network'.
 */
export function mockRefresh(...answers: Array<string | number | 'network'>) {
  const queue = [...answers];
  return vi.spyOn(axios, 'post').mockImplementation((url) => {
    if (url !== '/api/auth/refresh') throw new Error(`Unexpected POST ${url}`);
    const answer = queue.length > 1 ? queue.shift()! : queue[0];
    const config = { url } as Config;
    if (answer === 'network') return networkError(config);
    if (typeof answer === 'number') return respond(config, answer, { message: 'refresh failed' });
    return respond(config, 200, { data: { accessToken: answer } });
  });
}

/** A promise with its resolve/reject handles, to hold a request open mid-test. */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
