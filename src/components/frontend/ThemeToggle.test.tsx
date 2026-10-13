import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '@/components/frontend/ThemeToggle';

const setTheme = vi.fn();
let resolvedTheme = 'light';
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme, setTheme }) }));

describe('ThemeToggle', () => {
  it('switches between light and dark with a labelled button', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(setTheme).toHaveBeenCalledWith('dark');

    resolvedTheme = 'dark';
    rerender(<ThemeToggle />);
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(setTheme).toHaveBeenLastCalledWith('light');
  });
});
