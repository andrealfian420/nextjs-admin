import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { getApiErrorMessage } from '@/lib/utils';

const axiosErrorWith = (data: unknown) => {
  const err = new AxiosError('Request failed');
  err.response = {
    data,
    status: 500,
    statusText: 'Error',
    headers: {},
    config: { headers: {} } as never,
  };
  return err;
};

describe('getApiErrorMessage', () => {
  it('prefers the message from the API response body', () => {
    expect(getApiErrorMessage(axiosErrorWith({ message: 'Email already taken' }))).toBe(
      'Email already taken',
    );
  });

  it('falls back instead of showing axios\' own message when the body carries none', () => {
    expect(getApiErrorMessage(axiosErrorWith({}))).toBe('An error occurred. Please try again.');
    expect(getApiErrorMessage(axiosErrorWith({ message: '' }))).toBe('An error occurred. Please try again.');
    expect(getApiErrorMessage(new AxiosError('Network Error'), 'Offline')).toBe('Offline');
  });

  it('uses a plain Error message', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back to the default string for an unknown throw value', () => {
    expect(getApiErrorMessage('a string')).toBe('An error occurred. Please try again.');
  });

  it('honours a caller-supplied fallback', () => {
    expect(getApiErrorMessage(null, 'Could not save article')).toBe('Could not save article');
  });
});
