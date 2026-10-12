import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/types';

const user = { id: 1, name: 'Admin', email: 'admin@example.test', roleId: 1 } as User;

describe('useAuthStore', () => {
  it('stores the access token and user, and clears both on logout', () => {
    useAuthStore.getState().setAccessToken('token-1');
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState()).toMatchObject({ accessToken: 'token-1', user });

    useAuthStore.getState().logout();
    expect(useAuthStore.getState()).toMatchObject({ accessToken: null, user: null });
  });

  it('starts every test from the initial state (zustand mock reset)', () => {
    useAuthStore.getState().setAccessToken('leaked-token');
  });

  it('does not see state written by the previous test', () => {
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
