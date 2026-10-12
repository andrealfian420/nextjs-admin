// Test-only zustand wrapper (zustand's documented testing recipe). Records every store's
// initial state at creation and restores it after each test, so state never leaks between
// tests. Vitest picks this file up automatically for the bare specifier 'zustand'.

import { act } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import type * as ZustandExportedTypes from 'zustand';

export * from 'zustand';

const { create: actualCreate, createStore: actualCreateStore } =
  await vi.importActual<typeof ZustandExportedTypes>('zustand');

export const storeResetFns = new Set<() => void>();

// getInitialState() captures the COMPLETE object, actions included, so replacing with it
// is safe — a hand-rolled setState({ ... }, true) would delete the store's actions.
const createUncurried = <T,>(initializer: ZustandExportedTypes.StateCreator<T>) => {
  const store = actualCreate(initializer);
  const initialState = store.getInitialState();
  storeResetFns.add(() => store.setState(initialState, true));
  return store;
};

export const create = (<T,>(initializer?: ZustandExportedTypes.StateCreator<T>) =>
  typeof initializer === 'function'
    ? createUncurried(initializer)
    : createUncurried) as typeof ZustandExportedTypes.create;

const createStoreUncurried = <T,>(initializer: ZustandExportedTypes.StateCreator<T>) => {
  const store = actualCreateStore(initializer);
  const initialState = store.getInitialState();
  storeResetFns.add(() => store.setState(initialState, true));
  return store;
};

export const createStore = (<T,>(initializer?: ZustandExportedTypes.StateCreator<T>) =>
  typeof initializer === 'function'
    ? createStoreUncurried(initializer)
    : createStoreUncurried) as typeof ZustandExportedTypes.createStore;

afterEach(() => {
  act(() => storeResetFns.forEach((reset) => reset()));
});
