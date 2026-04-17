'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  ListChecksIcon,
  TextQuoteIcon,
  CodeIcon,
  CodeSquareIcon,
  SeparatorHorizontalIcon,
  Undo2Icon,
  Redo2Icon,
  RemoveFormattingIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  HighlighterIcon,
  LinkIcon,
  Link2OffIcon,
  SubscriptIcon,
  SuperscriptIcon,
  PilcrowIcon,
  PaletteIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Toolbar button                                                       */
/* ------------------------------------------------------------------ */

function ToolbarButton({ onClick, active, disabled, label, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onMouseDown={(e) => {
            e.preventDefault();
            onClick?.();
          }}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            'flex size-7 items-center justify-center rounded transition-colors',
            'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            'dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100',
            'disabled:pointer-events-none disabled:opacity-40',
            active &&
              'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100',
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent className='[&_svg]:hidden!' side='top'>{label}</TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Color picker button                                                  */
/* ------------------------------------------------------------------ */

function ColorButton({ editor }) {
  const inputRef = React.useRef(null);
  const currentColor = editor.getAttributes('textStyle').color ?? '#000000';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onMouseDown={(e) => {
            e.preventDefault();
            inputRef.current?.click();
          }}
          aria-label='Text Color'
          className={cn(
            'flex size-7 flex-col items-center justify-center gap-0.5 rounded transition-colors',
            'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            'dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100',
          )}
        >
          <PaletteIcon className='size-3.5' />
          <span
            className='h-1 w-4 rounded-full'
            style={{ backgroundColor: currentColor }}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent className='[&_svg]:hidden!' side='top'>Text Color</TooltipContent>
      <input
        ref={inputRef}
        type='color'
        className='sr-only'
        value={currentColor}
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
      />
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Toolbar separator                                                    */
/* ------------------------------------------------------------------ */

function ToolbarSeparator() {
  return (
    <div className='mx-0.5 h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-700' />
  );
}

/* ------------------------------------------------------------------ */
/*  Link handler                                                         */
/* ------------------------------------------------------------------ */

function handleLinkToggle(editor) {
  if (editor.isActive('link')) {
    editor.chain().focus().unsetLink().run();
    return;
  }
  const url = window.prompt('Enter URL', 'https://');
  if (!url || url === 'https://') return;
  editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
}

/* ------------------------------------------------------------------ */
/*  Toolbar                                                             */
/* ------------------------------------------------------------------ */

function EditorToolbar({ editor }) {
  if (!editor) return null;

  return (
    <TooltipProvider delayDuration={600}>
      <div
        className={cn(
          'flex flex-wrap items-center gap-0.5 border-b border-input bg-slate-50 px-2 py-1.5',
          'dark:bg-slate-800/60 dark:border-slate-700',
        )}
      >
        {/* History */}
        <ToolbarButton
          label='Undo'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2Icon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Redo'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2Icon className='size-3.5' />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Block type */}
        <ToolbarButton
          label='Paragraph'
          active={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <PilcrowIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Heading 1'
          active={editor.isActive('heading', { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1Icon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Heading 2'
          active={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2Icon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Heading 3'
          active={editor.isActive('heading', { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3Icon className='size-3.5' />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Inline marks */}
        <ToolbarButton
          label='Bold'
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Italic'
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Underline'
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Strikethrough'
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Subscript'
          active={editor.isActive('subscript')}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <SubscriptIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Superscript'
          active={editor.isActive('superscript')}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <SuperscriptIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Highlight'
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <HighlighterIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Inline Code'
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <CodeIcon className='size-3.5' />
        </ToolbarButton>
        <ColorButton editor={editor} />

        <ToolbarSeparator />

        {/* Text alignment */}
        <ToolbarButton
          label='Align Left'
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeftIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Align Center'
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenterIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Align Right'
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRightIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Justify'
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustifyIcon className='size-3.5' />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Lists */}
        <ToolbarButton
          label='Bullet List'
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Ordered List'
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrderedIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Task List'
          active={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <ListChecksIcon className='size-3.5' />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Block elements */}
        <ToolbarButton
          label='Blockquote'
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <TextQuoteIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Code Block'
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <CodeSquareIcon className='size-3.5' />
        </ToolbarButton>
        <ToolbarButton
          label='Horizontal Rule'
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <SeparatorHorizontalIcon className='size-3.5' />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Link */}
        <ToolbarButton
          label={editor.isActive('link') ? 'Remove Link' : 'Insert Link'}
          active={editor.isActive('link')}
          onClick={() => handleLinkToggle(editor)}
        >
          {editor.isActive('link') ? (
            <Link2OffIcon className='size-3.5' />
          ) : (
            <LinkIcon className='size-3.5' />
          )}
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Clear */}
        <ToolbarButton
          label='Clear Formatting'
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <RemoveFormattingIcon className='size-3.5' />
        </ToolbarButton>
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  RichEditor                                                          */
/* ------------------------------------------------------------------ */

/**
 * RichEditor â€” TipTap-powered WYSIWYG editor styled to match the design system.
 *
 * Props:
 *   value          {string}   â€” HTML string (controlled)
 *   onChange       {Function} â€” called with new HTML string on every change
 *   placeholder    {string}   â€” placeholder text shown when editor is empty
 *   minHeight      {string}   â€” min-height CSS value for the editable area (default '160px')
 *   disabled       {boolean}
 *   aria-invalid   {boolean}  â€” shows destructive ring when true
 *   className      {string}   â€” applied to the outer wrapper
 *
 * Usage with react-hook-form:
 *   <Controller
 *     name='bio'
 *     control={control}
 *     render={({ field }) => (
 *       <RichEditor
 *         value={field.value}
 *         onChange={field.onChange}
 *         aria-invalid={!!errors.bio}
 *         placeholder='Write somethingâ€¦'
 *       />
 *     )}
 *   />
 */
function RichEditor({
  className,
  value,
  onChange,
  placeholder = 'Start typingâ€¦',
  minHeight = '160px',
  disabled = false,
  'aria-invalid': ariaInvalid,
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Link.configure({ openOnClick: false, autolink: true }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextStyle,
      Color,
    ],
    content: value ?? '',
    editable: !disabled,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange?.(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: { class: 'outline-none' },
    },
  });

  // Sync external value changes (e.g. form reset) without resetting cursor
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (!editor) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const current = editor.getHTML();
    const incoming = value ?? '';
    if (current !== incoming && (incoming === '' || incoming === '<p></p>')) {
      editor.commands.setContent(incoming, false);
    }
  }, [editor, value]);

  // Sync editable state
  React.useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      data-slot='rich-editor'
      aria-invalid={ariaInvalid}
      data-disabled={disabled || undefined}
      className={cn(
        'overflow-hidden rounded-md border border-input shadow-xs transition-[color,box-shadow]',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
        'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
    >
      <EditorToolbar editor={editor} />

      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className={cn(
          '[&_.tiptap]:min-h-[inherit] [&_.tiptap]:p-3 [&_.tiptap]:text-sm',

          // Placeholder
          '[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:float-left',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:h-0',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',

          // Headings
          '[&_.tiptap_h1]:text-xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mb-2',
          '[&_.tiptap_h2]:text-lg [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:mb-1.5',
          '[&_.tiptap_h3]:text-base [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mb-1',

          // Paragraph & inline
          '[&_.tiptap_p]:mb-1.5 [&_.tiptap_p:last-child]:mb-0',
          '[&_.tiptap_strong]:font-semibold',
          '[&_.tiptap_a]:text-blue-600 [&_.tiptap_a]:underline [&_.tiptap_a:hover]:text-blue-700',
          'dark:[&_.tiptap_a]:text-blue-400 dark:[&_.tiptap_a:hover]:text-blue-300',
          '[&_.tiptap_mark]:bg-yellow-200 [&_.tiptap_mark]:px-0.5 [&_.tiptap_mark]:rounded-sm',
          'dark:[&_.tiptap_mark]:bg-yellow-500/30',

          // Lists
          '[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ul]:mb-1.5',
          '[&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_ol]:mb-1.5',
          '[&_.tiptap_li]:mb-0.5',

          // Task list
          '[&_.tiptap_ul[data-type=taskList]]:list-none [&_.tiptap_ul[data-type=taskList]]:pl-0',
          '[&_.tiptap_li[data-type=taskItem]]:flex [&_.tiptap_li[data-type=taskItem]]:items-start [&_.tiptap_li[data-type=taskItem]]:gap-2',
          '[&_.tiptap_li[data-type=taskItem]_label]:flex [&_.tiptap_li[data-type=taskItem]_label]:items-center',
          '[&_.tiptap_li[data-type=taskItem]_input[type=checkbox]]:mt-0.5 [&_.tiptap_li[data-type=taskItem]_input[type=checkbox]]:cursor-pointer',

          // Blockquote
          '[&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-slate-300 [&_.tiptap_blockquote]:pl-3 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-muted-foreground [&_.tiptap_blockquote]:mb-1.5',
          'dark:[&_.tiptap_blockquote]:border-slate-600',

          // Inline code
          '[&_.tiptap_code]:rounded [&_.tiptap_code]:bg-slate-100 [&_.tiptap_code]:px-1 [&_.tiptap_code]:py-0.5 [&_.tiptap_code]:font-mono [&_.tiptap_code]:text-xs',
          'dark:[&_.tiptap_code]:bg-slate-700 dark:[&_.tiptap_code]:text-slate-200',

          // Code block
          '[&_.tiptap_pre]:rounded-md [&_.tiptap_pre]:bg-slate-900 [&_.tiptap_pre]:p-3 [&_.tiptap_pre]:mb-2 [&_.tiptap_pre]:overflow-x-auto',
          '[&_.tiptap_pre_code]:bg-transparent [&_.tiptap_pre_code]:text-slate-100 [&_.tiptap_pre_code]:text-xs [&_.tiptap_pre_code]:p-0',

          // HR
          '[&_.tiptap_hr]:my-3 [&_.tiptap_hr]:border-border',
        )}
      />
    </div>
  );
}

export { RichEditor };
