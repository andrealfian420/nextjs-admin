import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthSplitShell from '@/components/layout/auth/AuthSplitShell';

vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }) }));

describe('AuthSplitShell', () => {
  it('renders the heading, the app identity and the form', () => {
    render(
      <AuthSplitShell title='Welcome back' subtitle='Sign in to continue'>
        <form aria-label='Sign in' />
      </AuthSplitShell>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByText('nextjs-admin')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument();
  });
});
