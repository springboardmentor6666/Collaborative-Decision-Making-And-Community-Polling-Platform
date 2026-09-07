import React, { useState, useCallback, useRef } from 'react';

/**
 * Lightweight markdown-to-HTML renderer.
 * Supports: **bold**, *italic*, `code`, ```code blocks```, - lists, [links](url), # headings
 */
function renderMarkdown(text) {
  if (!text) return '';

  let html = text
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (```)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="rounded-xl bg-surface-alt border border-border-default p-3 text-xs font-mono overflow-x-auto my-2"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rounded-md bg-surface-alt px-1.5 py-0.5 text-xs font-mono text-primary">$1</code>');

  // Headings (### then ## then #)
  html = html.replace(/^### (.+)$/gm, '<h4 class="text-sm font-bold text-text-primary mt-3 mb-1">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="text-base font-bold text-text-primary mt-3 mb-1">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="text-lg font-black text-text-primary mt-3 mb-1">$1</h2>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-primary underline hover:opacity-80">$1</a>');

  // Bullet lists (consecutive lines starting with - )
  html = html.replace(/(^- .+$(\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => `<li class="flex items-start gap-1.5"><span class="text-primary mt-1">•</span><span>${line.replace(/^- /, '')}</span></li>`)
      .join('');
    return `<ul class="space-y-0.5 text-sm my-1">${items}</ul>`;
  });

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="mt-2">');

  // Single newlines to <br>
  html = html.replace(/\n/g, '<br/>');

  return html;
}

const TOOLBAR_BUTTONS = [
  { label: 'B', title: 'Bold (Ctrl+B)', prefix: '**', suffix: '**', placeholder: 'bold text' },
  { label: 'I', title: 'Italic (Ctrl+I)', prefix: '*', suffix: '*', placeholder: 'italic text', italic: true },
  { label: '—', title: 'Bullet List', prefix: '- ', suffix: '', placeholder: 'list item', newline: true },
  { label: '🔗', title: 'Link', prefix: '[', suffix: '](url)', placeholder: 'link text' },
  { label: '<>', title: 'Code', prefix: '`', suffix: '`', placeholder: 'code' },
  { label: '{ }', title: 'Code Block', prefix: '```\n', suffix: '\n```', placeholder: 'code block', newline: true },
];

/**
 * MarkdownEditor — Textarea with formatting toolbar and live preview tab.
 */
export default function MarkdownEditor({
  value = '',
  onChange,
  placeholder = 'Write with markdown support...',
  rows = 5,
  disabled = false,
  compact = false,
}) {
  const [activeTab, setActiveTab] = useState('write');
  const textareaRef = useRef(null);

  const insertFormatting = useCallback(
    (btn) => {
      const textarea = textareaRef.current;
      if (!textarea || disabled) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      const text = selected || btn.placeholder;

      let before = value.substring(0, start);
      const after = value.substring(end);

      // Add newline before block elements if not at start
      if (btn.newline && before.length > 0 && !before.endsWith('\n')) {
        before += '\n';
      }

      const newValue = before + btn.prefix + text + btn.suffix + after;
      onChange(newValue);

      // Reset cursor position after React re-render
      requestAnimationFrame(() => {
        const cursorPos = before.length + btn.prefix.length + text.length;
        textarea.focus();
        textarea.setSelectionRange(
          before.length + btn.prefix.length,
          cursorPos
        );
      });
    },
    [value, onChange, disabled]
  );

  const handleKeyDown = useCallback(
    (e) => {
      // Ctrl+B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertFormatting(TOOLBAR_BUTTONS[0]);
      }
      // Ctrl+I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertFormatting(TOOLBAR_BUTTONS[1]);
      }
    },
    [insertFormatting]
  );

  return (
    <div className="rounded-2xl border border-border-default bg-surface overflow-hidden transition focus-within:border-primary">
      {/* Toolbar + Tab switcher */}
      <div className="flex items-center justify-between border-b border-border-default bg-surface-alt/50 px-3 py-1.5">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              activeTab === 'write'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              activeTab === 'preview'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Toolbar (only in write mode) */}
        {activeTab === 'write' && (
          <div className="flex items-center gap-0.5">
            {TOOLBAR_BUTTONS.map((btn, i) => (
              <button
                key={i}
                type="button"
                title={btn.title}
                disabled={disabled}
                onClick={() => insertFormatting(btn)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition hover:bg-surface hover:text-primary disabled:opacity-40 ${
                  btn.italic ? 'italic' : ''
                } ${btn.label === 'B' ? 'font-black' : 'font-semibold'} text-text-secondary`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Write Tab */}
      {activeTab === 'write' && (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={compact ? 3 : rows}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        />
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div
          className="min-h-[80px] px-4 py-3 text-sm text-text-primary leading-relaxed prose-sm"
          style={{ minHeight: compact ? '72px' : `${rows * 24}px` }}
        >
          {value.trim() ? (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
          ) : (
            <p className="text-text-secondary/60 italic">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}

// Export the renderer for use in CommentItem
export { renderMarkdown };
