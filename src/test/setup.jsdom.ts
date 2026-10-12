// Global setup for the `jsdom` test project. jsdom ships no layout engine, so the browser
// APIs Radix/base-ui and Tiptap rely on are installed here, and per-test state (DOM,
// storage, cookies) is cleared between tests.
//
// Use plain assignment here, never vi.stubGlobal(): `unstubGlobals: true` would tear a
// setup-file stub down after the first test of each file.

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Swap zustand for __mocks__/zustand.ts in every jsdom test: stores reset after each test.
vi.mock('zustand');

// matchMedia (Radix, base-ui, next-themes, reduced-motion checks)
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

// ResizeObserver (Radix Popover/Select/Tooltip sizing)
class MockResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Layout / scrolling — jsdom throws "Not implemented".
Element.prototype.scrollIntoView = function scrollIntoView() {};
Element.prototype.scrollTo = function scrollTo() {};
window.scrollTo = function scrollTo() {};

// Pointer capture (Radix Select / base-ui menus)
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

// Object URLs (avatar previews). Vitest's shim reads jsdom's internal Blob buffer, which a
// File built in a test does not carry, so it throws from inside change handlers. Components
// only need a unique `blob:` string.
let objectUrlSeq = 0;
URL.createObjectURL = function createObjectURL() {
  objectUrlSeq += 1;
  return `blob:test/${objectUrlSeq}`;
};
URL.revokeObjectURL = function revokeObjectURL() {};

// Range geometry (Tiptap / ProseMirror selection)
if (!Range.prototype.getClientRects) {
  Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
  Range.prototype.getClientRects = () =>
    Object.assign([], { item: () => null }) as unknown as DOMRectList;
}

afterEach(() => {
  cleanup(); // `globals: false` disables RTL's auto-cleanup
  localStorage.clear();
  sessionStorage.clear(); // usePendingToastStore
  document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter(Boolean)
    .forEach((name) => {
      document.cookie = `${name}=; path=/; max-age=0`;
    });
});
