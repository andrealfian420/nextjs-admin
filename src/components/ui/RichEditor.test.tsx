import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichEditor } from '@/components/ui/RichEditor';

// Stored HTML that Tiptap serializes differently (an unknown attribute, a trailing space):
// any emitted update would hand the normalized copy to the form and mark it dirty.
const STORED = '<p data-legacy="1">Hello {{code}} </p>';

const prose = (container: HTMLElement) => container.querySelector('.ProseMirror') as HTMLElement;

async function mount(ui: React.ReactElement) {
  const view = render(ui);
  await waitFor(() => expect(prose(view.container)).not.toBeNull());
  // Let Tiptap's async setup (selection, plugins) settle.
  await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
  return view;
}

const press = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.pointer({ keys: '[MouseLeft]', target: screen.getByRole('button', { name }) });

describe('RichEditor', () => {
  it('shows the initial value without reporting a change', async () => {
    const onChange = vi.fn();
    const { container } = await mount(<RichEditor value={STORED} onChange={onChange} />);

    expect(prose(container)).toHaveTextContent('Hello {{code}}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('never reports a change when `disabled` toggles', async () => {
    const onChange = vi.fn();
    const { container, rerender } = await mount(<RichEditor value={STORED} onChange={onChange} />);

    rerender(<RichEditor value={STORED} onChange={onChange} disabled />);
    expect(prose(container)).toHaveAttribute('contenteditable', 'false');
    rerender(<RichEditor value={STORED} onChange={onChange} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    expect(prose(container)).toHaveAttribute('contenteditable', 'true');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('emits the HTML of a real edit and keeps the toolbar state in sync', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    await mount(<RichEditor value='<p>Hello</p>' onChange={onChange} />);

    await press(user, 'Heading 1');

    // StarterKit's trailing node adds an empty paragraph after the heading.
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^<h1>Hello<\/h1>/)));
    // No parent re-render happened (onChange is a spy): the toolbar follows the editor itself.
    expect(screen.getByRole('button', { name: 'Heading 1' })).toHaveAttribute('aria-pressed', 'true');

    await press(user, 'Undo');
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^<p>Hello<\/p>/)));
    expect(screen.getByRole('button', { name: 'Heading 1' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('applies a value set from outside (reset, Discard) without reporting a change', async () => {
    const onChange = vi.fn();
    const { container, rerender } = await mount(<RichEditor value='' onChange={onChange} />);

    rerender(<RichEditor value='<p>Loaded from the server</p>' onChange={onChange} />);
    await waitFor(() => expect(prose(container)).toHaveTextContent('Loaded from the server'));

    rerender(<RichEditor value='' onChange={onChange} />);
    await waitFor(() => expect(prose(container)).toHaveTextContent(''));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not re-apply its own output echoed back through value', async () => {
    const user = userEvent.setup();
    let value = '<p>Hello</p>';
    const onChange = vi.fn((html: string) => (value = html));
    const { rerender } = await mount(<RichEditor value={value} onChange={onChange} />);

    await press(user, 'Heading 1');
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    rerender(<RichEditor value={value} onChange={onChange} />);

    // Re-applying would reset the history: Undo must still return to the paragraph.
    await press(user, 'Undo');
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^<p>Hello<\/p>/)));
  });
});
