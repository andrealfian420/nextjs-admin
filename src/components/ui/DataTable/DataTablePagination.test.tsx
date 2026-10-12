import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTablePagination, { buildPageItems } from '@/components/ui/DataTable/DataTablePagination';

describe('buildPageItems', () => {
  it.each([
    [1, 1, []],
    [1, 2, [1, 2]],
    [2, 3, [1, 2, 3]],
    [6, 20, [1, '...', 5, 6, 7, '...', 20]],
    [1, 20, [1, 2, '...', 20]],
    [20, 20, [1, '...', 19, 20]],
  ])('page %i of %i → %j', (current, total, expected) => {
    expect(buildPageItems(current, total)).toEqual(expected);
  });
});

describe('DataTablePagination', () => {
  const renderAt = (page: number, lastPage: number) => {
    const onPageChange = vi.fn();
    render(
      <DataTablePagination page={page} lastPage={lastPage} onPageChange={onPageChange} limit={10} onLimitChange={vi.fn()} />,
    );
    return onPageChange;
  };

  it('disables previous on the first page and next on the last', () => {
    renderAt(1, 1);
    for (const button of screen.getAllByRole('button', { name: /Previous page|Next page/ })) {
      expect(button).toBeDisabled();
    }
  });

  it('moves to the previous, next and a numbered page', async () => {
    const onPageChange = renderAt(2, 3);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });

    await userEvent.click(screen.getAllByRole('button', { name: 'Previous page' })[0]);
    await userEvent.click(screen.getAllByRole('button', { name: 'Next page' })[0]);
    await userEvent.click(nav.querySelector('button[aria-current="page"]')!.nextElementSibling as HTMLElement);

    expect(onPageChange.mock.calls).toEqual([[1], [3], [3]]);
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('2');
  });
});
