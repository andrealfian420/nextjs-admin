import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import api from '@/lib/axios';
import { authService } from '@/services/authService';
import { logService } from '@/services/logService';
import { roleService } from '@/services/roleService';
import { toListParams } from '@/services/listParams';
import { userService } from '@/services/userService';
import { utilService } from '@/services/utilService';

vi.mock('@/lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const envelope = { success: true, message: 'OK', data: { slug: 'x' } };

beforeEach(() => {
  for (const method of ['get', 'post', 'put', 'delete'] as const) {
    vi.mocked(api[method]).mockResolvedValue({ data: envelope });
  }
});

/** The body passed to the mocked api call, as a plain object (FormData is unpacked). */
function sentBody(method: 'post' | 'put'): Record<string, unknown> {
  const body = vi.mocked(api[method]).mock.calls[0][1];
  return body instanceof FormData ? Object.fromEntries(body.entries()) : (body as Record<string, unknown>);
}

describe('toListParams', () => {
  it('defaults to the first page of 10 and omits an empty search', () => {
    expect(toListParams()).toEqual({ page: 1, per_page: 10 });
    expect(toListParams({ search: '' })).toEqual({ page: 1, per_page: 10 });
  });

  it('sends sort_dir only with sort_by, defaulting to asc', () => {
    expect(toListParams({ sort_dir: 'desc' })).toEqual({ page: 1, per_page: 10 });
    expect(toListParams({ sort_by: 'name' })).toMatchObject({ sort_by: 'name', sort_dir: 'asc' });
    expect(toListParams({ page: 3, per_page: 25, search: 'ann', sort_by: 'email', sort_dir: 'desc' })).toEqual({
      page: 3,
      per_page: 25,
      search: 'ann',
      sort_by: 'email',
      sort_dir: 'desc',
    });
  });
});

describe('list services', () => {
  it.each([
    ['users', () => userService.getUsers({ search: 'a' }), '/users'],
    ['roles', () => roleService.getRoles({ search: 'a' }), '/roles'],
    ['activity logs', () => logService.getActivityLogs({ search: 'a' }), '/activity-logs'],
  ])('%s: sends the list query and resolves with the envelope', async (_, call, path) => {
    await expect(call()).resolves.toEqual(envelope);
    expect(api.get).toHaveBeenCalledWith(path, { params: { page: 1, per_page: 10, search: 'a' } });
  });
});

describe('identifiers are URL-encoded', () => {
  it('encodes user and role slugs and log ids', async () => {
    await userService.getUser('a/b c');
    await roleService.deleteRole('../admin');
    await logService.getActivityLog(42);

    expect(api.get).toHaveBeenCalledWith('/users/a%2Fb%20c');
    expect(api.delete).toHaveBeenCalledWith('/roles/..%2Fadmin');
    expect(api.get).toHaveBeenCalledWith('/activity-logs/42');
  });
});

describe('userService payloads', () => {
  const avatar = new File(['png'], 'me.png', { type: 'image/png' });

  it('sends multipart fields with the avatar file', async () => {
    await userService.createUser({ name: 'Ann', email: 'ann@example.test', roleId: '2', password: 'Secret1!', avatar });

    const body = vi.mocked(api.post).mock.calls[0][1];
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('avatar')).toBe(avatar);
    expect(sentBody('post')).toMatchObject({ name: 'Ann', email: 'ann@example.test', roleId: '2', password: 'Secret1!' });
  });

  it('omits an empty password and a missing avatar on update', async () => {
    await userService.updateUser('ann', { name: 'Ann', email: 'ann@example.test', roleId: '2', password: '' });

    expect(api.put).toHaveBeenCalledWith('/users/ann', expect.any(FormData));
    expect(Object.keys(sentBody('put')).sort()).toEqual(['email', 'name', 'roleId']);
  });
});

describe('roleService', () => {
  it('sends permissions as `access`', async () => {
    const input = { title: 'Editor', userType: 'Administrator', description: null, access: ['module.dashboard.index'] };
    await roleService.createRole(input);
    await roleService.updateRole('editor', input);

    expect(api.post).toHaveBeenCalledWith('/roles', input);
    expect(api.put).toHaveBeenCalledWith('/roles/editor', input);
  });

  it('reads the access list, user types and role options', async () => {
    await roleService.getAccessList();
    await roleService.getUserTypes();
    await utilService.getRoleOptions();

    expect(vi.mocked(api.get).mock.calls.map(([path]) => path)).toEqual([
      '/roles/access-list',
      '/roles/user-types',
      '/utils/role-options',
    ]);
  });
});

describe('authService', () => {
  it('posts password reset requests through the BFF without the session interceptor', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: envelope });

    await authService.forgotPassword({ email: 'ann@example.test' });
    await authService.resetPassword({ token: 't0k', newPassword: 'Secret1!' });

    expect(post).toHaveBeenCalledWith('/api/auth/request-password-reset', { email: 'ann@example.test' });
    expect(post).toHaveBeenCalledWith('/api/auth/reset-password', { token: 't0k', newPassword: 'Secret1!' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('sends a profile update as multipart, without an empty password', async () => {
    await authService.updateProfile({ name: 'Ann', password: '' });

    expect(api.put).toHaveBeenCalledWith('/profile', expect.any(FormData));
    expect(sentBody('put')).toEqual({ name: 'Ann' });
  });
});
