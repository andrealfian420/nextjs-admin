import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useObjectUrl } from '@/hooks/useObjectUrl';

let create: ReturnType<typeof vi.spyOn>;
let revoke: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers();
  let n = 0;
  create = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:test/${++n}`);
  revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
});
afterEach(() => vi.useRealTimers());

const file = (name: string) => new File(['x'], name, { type: 'image/png' });
const flush = () => act(() => vi.runAllTimers());

describe('useObjectUrl', () => {
  it('returns null and creates nothing without a file', () => {
    const { result } = renderHook(() => useObjectUrl(null));
    expect(result.current).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it('creates one URL per file and revokes it on replace, clear and unmount', () => {
    const a = file('a.png');
    const b = file('b.png');
    const { result, rerender, unmount } = renderHook(
      ({ f }: { f: File | null }) => useObjectUrl(f),
      { initialProps: { f: null as File | null } },
    );

    rerender({ f: a });
    expect(result.current).toBe('blob:test/1');
    rerender({ f: a });
    expect(create).toHaveBeenCalledTimes(1);

    rerender({ f: b });
    flush();
    expect(result.current).toBe('blob:test/2');
    expect(revoke).toHaveBeenCalledWith('blob:test/1');

    rerender({ f: null });
    flush();
    expect(result.current).toBeNull();
    expect(revoke).toHaveBeenCalledWith('blob:test/2');

    rerender({ f: a });
    unmount();
    flush();
    expect(revoke).toHaveBeenLastCalledWith('blob:test/3');
    expect(revoke).toHaveBeenCalledTimes(create.mock.calls.length);
  });

  it.each([
    ['picked after mount', false],
    ['present at mount', true],
  ])('keeps exactly one live URL under StrictMode for a file %s', (_, atMount) => {
    const a = file('a.png');
    const { result, rerender, unmount } = renderHook(
      ({ f }: { f: File | null }) => useObjectUrl(f),
      { initialProps: { f: atMount ? a : null }, wrapper: StrictMode },
    );

    rerender({ f: a });
    flush();

    expect(create).toHaveBeenCalledTimes(1);
    expect(revoke).not.toHaveBeenCalled();
    expect(result.current).toBe('blob:test/1');

    unmount();
    flush();
    expect(revoke).toHaveBeenCalledWith('blob:test/1');
  });
});
