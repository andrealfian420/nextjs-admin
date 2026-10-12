// Shared helpers for tests of forms that render AdminFormActions: read the bar's buttons in
// DOM (= keyboard) order and drive the Discard changes confirmation.

import { expect } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';

type User = ReturnType<typeof userEvent.setup>;

/** The rendered action bar; a form renders exactly one. */
export function actionBar(): HTMLElement {
  const bars = document.querySelectorAll<HTMLElement>(
    '[data-slot="admin-form-actions"]',
  );
  if (bars.length !== 1) {
    throw new Error(`Expected one admin form action bar, found ${bars.length}`);
  }
  return bars[0];
}

/** Button labels of the action bar in DOM (= keyboard) order. */
export const actionBarLabels = () =>
  within(actionBar())
    .getAllByRole('button')
    .map((button) => button.textContent?.trim() ?? '');

export const discardButton = () =>
  within(actionBar()).getByRole('button', { name: /Discard changes/ });

/** Opens the Discard confirmation and confirms it. */
export async function confirmDiscard(user: User) {
  await user.click(discardButton());
  const dialog = await screen.findByRole('dialog');
  await user.click(within(dialog).getByRole('button', { name: 'Discard' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
}

/** Opens the Discard confirmation and backs out of it. */
export async function cancelDiscard(user: User) {
  await user.click(discardButton());
  const dialog = await screen.findByRole('dialog');
  await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
}
