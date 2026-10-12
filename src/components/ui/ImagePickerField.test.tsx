import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ImagePickerField,
  type ImagePickerFieldProps,
} from '@/components/ui/ImagePickerField';

const png = () => new File(['x'], 'a.png', { type: 'image/png' });

const renderPicker = (props: Partial<ImagePickerFieldProps> = {}) => {
  const handlers = { onPick: vi.fn(), onCancel: vi.fn() };
  const view = render(
    <ImagePickerField
      id='avatar'
      label='Avatar'
      hint='JPG, PNG, WEBP — max 2 MB'
      preview={null}
      isNewPick={false}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, ...view };
};

const input = () => screen.getByLabelText(/^Avatar/) as HTMLInputElement;

describe('ImagePickerField — labelling', () => {
  it('links label, hint, error and required state to the input', () => {
    renderPicker({ required: true, error: 'Avatar is required' });

    const field = input();
    expect(field).toHaveAttribute('type', 'file');
    expect(field).toHaveAttribute('aria-required', 'true');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(
      'JPG, PNG, WEBP — max 2 MB Avatar is required',
    );
    expect(screen.getByText('(required)')).toHaveClass('sr-only');
    expect(
      screen.getByRole('button', { name: 'Upload Avatar' }),
    ).toHaveAccessibleDescription('JPG, PNG, WEBP — max 2 MB Avatar is required');
  });

  it('describes only the hint and is not invalid without an error', () => {
    renderPicker();

    expect(input()).toHaveAttribute('aria-invalid', 'false');
    expect(input()).toHaveAccessibleDescription('JPG, PNG, WEBP — max 2 MB');
    expect(input()).not.toHaveAttribute('aria-required');
  });

  it('accepts raster images by default and takes an override', () => {
    const { unmount } = renderPicker();
    expect(input()).toHaveAttribute('accept', '.jpg,.jpeg,.png,.webp');
    unmount();

    renderPicker({ accept: '.svg,.png,.jpg,.jpeg,.webp' });
    expect(input()).toHaveAttribute('accept', '.svg,.png,.jpg,.jpeg,.webp');
  });
});

describe('ImagePickerField — actions', () => {
  it('opens the file dialog from Upload and hands over the picked file', async () => {
    const user = userEvent.setup();
    const { onPick } = renderPicker();
    const click = vi.spyOn(input(), 'click');

    await user.click(screen.getByRole('button', { name: 'Upload Avatar' }));
    expect(click).toHaveBeenCalled();

    const file = png();
    await user.upload(input(), file);
    expect(onPick).toHaveBeenCalledWith(file);
    expect(screen.queryByRole('button', { name: /Cancel/ })).toBeNull();
  });

  it('ignores a dismissed dialog and lets the same file be picked twice', async () => {
    const user = userEvent.setup();
    const { onPick } = renderPicker();

    fireEvent.change(input(), { target: { files: [] } });
    expect(onPick).not.toHaveBeenCalled();

    const file = png();
    await user.upload(input(), file);
    expect(input().value).toBe('');
    await user.upload(input(), file);
    expect(onPick).toHaveBeenCalledTimes(2);
  });

  it('offers Replace for a stored image and Cancel only for a new pick', async () => {
    const user = userEvent.setup();
    const { onCancel, rerender } = renderPicker({ preview: 'https://cdn.test/a.png' });

    expect(screen.getByAltText('Avatar preview')).toHaveAttribute(
      'src',
      'https://cdn.test/a.png',
    );
    expect(screen.getByRole('button', { name: 'Replace Avatar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel new Avatar' })).toBeNull();

    rerender(
      <ImagePickerField
        id='avatar'
        label='Avatar'
        hint='h'
        preview='blob:test/1'
        isNewPick
        onPick={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel new Avatar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('keeps Cancel reachable for an invalid pick that has no preview', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderPicker({ isNewPick: true, error: 'Only JPG' });

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('button', { name: 'Upload Avatar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel new Avatar' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables the input and every action', async () => {
    const user = userEvent.setup();
    const { onCancel, onPick } = renderPicker({
      preview: 'blob:test/1',
      isNewPick: true,
      disabled: true,
    });

    expect(input()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Replace Avatar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel new Avatar' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancel new Avatar' }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(onPick).not.toHaveBeenCalled();
  });
});

describe('ImagePickerField — preview fit', () => {
  it('covers by default and contains when asked', () => {
    const { unmount } = renderPicker({ preview: 'blob:test/1' });
    expect(screen.getByAltText('Avatar preview')).toHaveClass('object-cover');
    unmount();

    renderPicker({ preview: 'blob:test/1', previewFit: 'contain' });
    expect(screen.getByAltText('Avatar preview')).toHaveClass('object-contain');
  });
});
