import { useEffect, useCallback } from 'react';

/**
 * useKeyboardShortcuts — Register keyboard shortcuts that are inactive when user is typing.
 *
 * @param {Object} shortcutMap - { key: handler } e.g. { 'j': () => ..., 'k': () => ... }
 * @param {boolean} enabled - whether shortcuts are active (default true)
 */
export default function useKeyboardShortcuts(shortcutMap = {}, enabled = true) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!enabled) return;

      // Don't fire shortcuts when user is typing in an input/textarea/contenteditable
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Handle Ctrl+K / Cmd+K specially
      if (isCtrlOrMeta && key === 'k') {
        if (shortcutMap['ctrl+k'] || shortcutMap['meta+k']) {
          e.preventDefault();
          const handler = shortcutMap['ctrl+k'] || shortcutMap['meta+k'];
          handler(e);
          return;
        }
      }

      // Skip if modifier keys are held for non-modifier shortcuts
      if (isCtrlOrMeta || e.altKey) return;

      if (shortcutMap[key]) {
        e.preventDefault();
        shortcutMap[key](e);
      }
    },
    [shortcutMap, enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
