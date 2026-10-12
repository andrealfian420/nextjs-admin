import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import DataTableSearch from '@/components/ui/DataTable/DataTableSearch';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const input = () => screen.getByRole('textbox', { name: 'Search' });
const type = (value: string) => fireEvent.change(input(), { target: { value } });
const settle = () => act(() => vi.advanceTimersByTime(500));

describe('DataTableSearch', () => {
  it('never searches on mount, also under StrictMode', () => {
    const onSearch = vi.fn();
    render(
      <StrictMode>
        <DataTableSearch onSearch={onSearch} />
      </StrictMode>,
    );
    settle();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('searches once, 500 ms after the last keystroke, with the trimmed term', () => {
    const onSearch = vi.fn();
    render(<DataTableSearch onSearch={onSearch} />);

    type('j');
    act(() => vi.advanceTimersByTime(300));
    type('ja');
    act(() => vi.advanceTimersByTime(300));
    type('jan ');
    expect(onSearch).not.toHaveBeenCalled();

    settle();
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('jan');
  });

  it('does not search again when a parent re-render passes a new callback', () => {
    const first = vi.fn();
    const { rerender } = render(<DataTableSearch onSearch={first} />);
    type('jan');
    settle();

    const second = vi.fn();
    rerender(<DataTableSearch onSearch={second} />);
    settle();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it('calls the latest callback when the timer fires', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<DataTableSearch onSearch={first} />);

    type('jan');
    rerender(<DataTableSearch onSearch={second} />);
    settle();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('jan');
  });

  it('does not search when the term ends up unchanged (typed and deleted)', () => {
    const onSearch = vi.fn();
    render(<DataTableSearch onSearch={onSearch} />);

    type('x');
    type('');
    settle();

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('drops a pending search on unmount', () => {
    const onSearch = vi.fn();
    const { unmount } = render(<DataTableSearch onSearch={onSearch} />);
    type('jan');
    unmount();
    settle();
    expect(onSearch).not.toHaveBeenCalled();
  });
});
