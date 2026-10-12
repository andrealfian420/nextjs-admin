import { describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { applyApiFieldErrors, extractApiFieldErrors } from '@/lib/api-errors';

/** Builds an axios error carrying the backend's validation payload. */
const validationError = (errors: unknown) => {
  const err = new AxiosError('Validation failed');
  err.response = {
    data: { success: false, message: 'Validation failed', errors },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: {} } as never,
  };
  return err;
};

/**
 * Minimal react-hook-form stand-in: applyApiFieldErrors only reads setError and getValues.
 * The cast is needed because UseFormReturn['getValues'] is an overloaded signature that a
 * plain closure cannot satisfy structurally.
 */
const formStub = <T extends FieldValues>(values: T) => {
  const setError = vi.fn();
  const form = { setError, getValues: () => values } as unknown as UseFormReturn<T>;
  return { setError, form };
};

describe('extractApiFieldErrors', () => {
  it('reads the errors array off an axios validation error', () => {
    const err = validationError([{ field: 'email', message: 'Email already taken' }]);
    expect(extractApiFieldErrors(err)).toEqual([
      { field: 'email', message: 'Email already taken' },
    ]);
  });

  it('returns an empty array for a non-axios error', () => {
    expect(extractApiFieldErrors(new Error('boom'))).toEqual([]);
    expect(extractApiFieldErrors(null)).toEqual([]);
  });

  it('returns an empty array when errors is absent or not an array', () => {
    expect(extractApiFieldErrors(validationError(undefined))).toEqual([]);
    expect(extractApiFieldErrors(validationError('nope'))).toEqual([]);
  });

  it('drops malformed entries instead of trusting the payload', () => {
    const err = validationError([
      { field: 'email', message: 'ok' },
      { field: 'name' }, // no message
      { message: 'orphan' }, // no field
      { field: '', message: 'empty field' },
      { field: 'x', message: '' },
      null,
      'garbage',
      { field: 42, message: 'wrong type' },
    ]);
    expect(extractApiFieldErrors(err)).toEqual([{ field: 'email', message: 'ok' }]);
  });
});

describe('applyApiFieldErrors', () => {
  it('sets an error on a field the form owns', () => {
    const { setError, form } = formStub({ email: '', name: '' });
    const result = applyApiFieldErrors(
      validationError([{ field: 'email', message: 'Email already taken' }]),
      form,
    );

    expect(setError).toHaveBeenCalledWith(
      'email',
      { type: 'server', message: 'Email already taken' },
      { shouldFocus: true },
    );
    expect(result.applied).toHaveLength(1);
    expect(result.unmatched).toHaveLength(0);
    expect(result.description).toBe('1 field needs attention.');
  });

  it('resolves a nested array path (answers.1.attributeId)', () => {
    const { setError, form } = formStub({ answers: [{ attributeId: null }, { attributeId: null }] });
    const result = applyApiFieldErrors(
      validationError([{ field: 'answers.1.attributeId', message: 'Attribute is required' }]),
      form,
    );

    expect(setError).toHaveBeenCalledWith(
      'answers.1.attributeId',
      { type: 'server', message: 'Attribute is required' },
      { shouldFocus: true },
    );
    expect(result.applied).toHaveLength(1);
  });

  it('accepts bracket notation as well as dot notation', () => {
    const { setError, form } = formStub({ answers: [{ attributeId: null }] });
    applyApiFieldErrors(
      validationError([{ field: 'answers[0].attributeId', message: 'Required' }]),
      form,
    );

    expect(setError).toHaveBeenCalledWith(
      'answers[0].attributeId',
      expect.objectContaining({ type: 'server' }),
      expect.anything(),
    );
  });

  it('treats presence, not truthiness, as ownership', () => {
    // An optional file input legitimately holds undefined and must still be matched.
    const { setError, form } = formStub({ coverThumbnail: undefined });
    const result = applyApiFieldErrors(
      validationError([{ field: 'coverThumbnail', message: 'File too large' }]),
      form,
    );

    expect(result.applied).toHaveLength(1);
    expect(result.unmatched).toHaveLength(0);
  });

  it('collects fields the form does not own instead of dropping them', () => {
    const { setError, form } = formStub({ email: '' });
    const result = applyApiFieldErrors(
      validationError([
        { field: 'email', message: 'Taken' },
        { field: 'serverOnly', message: 'Quota exceeded' },
        { field: 'answers.9.attributeId', message: 'Out of bounds' },
      ]),
      form,
    );

    expect(result.applied).toHaveLength(1);
    expect(result.unmatched).toEqual([
      { field: 'serverOnly', message: 'Quota exceeded' },
      { field: 'answers.9.attributeId', message: 'Out of bounds' },
    ]);
    // Unmatched messages win the description — they have nowhere else to appear.
    expect(result.description).toBe(
      'serverOnly: Quota exceeded\nanswers.9.attributeId: Out of bounds',
    );
    expect(setError).toHaveBeenCalledTimes(1);
  });

  it('requests focus only for the first applied error', () => {
    const { setError, form } = formStub({ email: '', name: '' });
    applyApiFieldErrors(
      validationError([
        { field: 'email', message: 'a' },
        { field: 'name', message: 'b' },
      ]),
      form,
    );

    expect(setError).toHaveBeenNthCalledWith(1, 'email', expect.anything(), {
      shouldFocus: true,
    });
    expect(setError).toHaveBeenNthCalledWith(2, 'name', expect.anything(), {
      shouldFocus: false,
    });
  });

  it('summarises the count when every error landed inline', () => {
    const { setError, form } = formStub({ email: '', name: '' });
    const result = applyApiFieldErrors(
      validationError([
        { field: 'email', message: 'a' },
        { field: 'name', message: 'b' },
      ]),
      form,
    );

    expect(result.description).toBe('2 fields need attention.');
  });

  it('remaps an API field name through fieldMap', () => {
    const { setError, form } = formStub({ phone: '' });
    const result = applyApiFieldErrors(
      validationError([{ field: 'noTelp', message: 'Invalid number' }]),
      form,
      { fieldMap: { noTelp: 'phone' } },
    );

    expect(setError).toHaveBeenCalledWith('phone', expect.anything(), expect.anything());
    expect(result.applied).toHaveLength(1);
  });

  it('never matches inherited names such as __proto__', () => {
    const { setError, form } = formStub({ email: '' });
    const result = applyApiFieldErrors(
      validationError([{ field: '__proto__', message: 'x' }, { field: 'constructor', message: 'y' }]),
      form,
    );

    expect(setError).not.toHaveBeenCalled();
    expect(result.unmatched).toHaveLength(2);
  });

  it('does nothing for an error carrying no errors[]', () => {
    const { setError, form } = formStub({ email: '' });
    const result = applyApiFieldErrors(new Error('network down'), form);

    expect(setError).not.toHaveBeenCalled();
    expect(result).toEqual({ applied: [], unmatched: [], description: '' });
  });
});
