/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: ChatComposer.jsx
 * Architecture Tier: Real-Time Chat Component (UI Layer)
 * Path: frontend/src/components/chat/ChatComposer.jsx
 *
 * Purpose:
 *   Rich message composer component supporting multi-line text input, file attachment selection, emoji picker, and Enter-to-send.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Smile,
  CornerDownRight,
  X,
  Edit2,
  Paperclip,
  Sparkles,
} from 'lucide-react';
import ChatReactionPicker from './ChatReactionPicker';

const MAX_CHAR_LIMIT = 2000;

export default function ChatComposer({
  channelName = 'general',
  replyingTo = null,
  editingMessage = null,
  onCancelReply,
  onCancelEdit,
  onSendMessage,
  onSaveEdit,
  onTyping,
  lastSentMessage = null,
  onTriggerEditLast,
  disabled = false,
}) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Auto populate when editing
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content || '');
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          editingMessage.content.length,
          editingMessage.content.length
        );
      }
    }
  }, [editingMessage]);

  // Focus on replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  // Adjust textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    }
  }, [content]);

  // Debounced typing notification
  const handleTypingEvent = useCallback(() => {
    if (onTyping) {
      onTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  }, [onTyping]);

  const handleChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHAR_LIMIT) {
      setContent(text);
      handleTypingEvent();
    }
  };

  const handleSend = () => {
    if (!content.trim() || disabled) return;

    if (editingMessage) {
      onSaveEdit?.(editingMessage.id, content.trim());
      onCancelEdit?.();
    } else {
      onSendMessage?.(content.trim(), replyingTo ? replyingTo.id : null);
      if (replyingTo) onCancelReply?.();
    }

    setContent('');
    if (onTyping) onTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    // Escape key
    if (e.key === 'Escape') {
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
        e.preventDefault();
        return;
      }
      if (editingMessage) {
        onCancelEdit?.();
        setContent('');
        e.preventDefault();
        return;
      }
      if (replyingTo) {
        onCancelReply?.();
        e.preventDefault();
        return;
      }
    }

    // ArrowUp on empty input edits last message
    if (e.key === 'ArrowUp' && !content && !editingMessage && lastSentMessage && onTriggerEditLast) {
      e.preventDefault();
      onTriggerEditLast(lastSentMessage);
      return;
    }

    // Enter without Shift to send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="relative rounded-3xl border border-border-default bg-surface p-3 shadow-sm transition-all focus-within:border-primary-soft focus-within:shadow-md">
      {/* Banner for Replying or Editing State */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex items-center justify-between overflow-hidden rounded-2xl bg-surface-alt/70 px-3 py-1.5 border border-border-default/60 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CornerDownRight className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-semibold text-text-primary">
                Replying to {replyingTo.sender?.fullName || replyingTo.sender?.name || 'Member'}:
              </span>
              <span className="text-muted truncate max-w-xs">{replyingTo.content}</span>
            </div>
            <button
              onClick={onCancelReply}
              className="rounded-xl p-1 text-muted hover:bg-surface hover:text-text-primary transition"
              title="Cancel reply (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}

        {editingMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex items-center justify-between overflow-hidden rounded-2xl bg-amber-500/10 px-3 py-1.5 border border-amber-500/20 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0 text-amber-700 dark:text-amber-300 font-semibold">
              <Edit2 className="h-3.5 w-3.5 shrink-0" />
              <span>Editing message:</span>
              <span className="text-amber-800/80 dark:text-amber-200/80 truncate max-w-xs font-normal">
                {editingMessage.content}
              </span>
            </div>
            <button
              onClick={() => {
                onCancelEdit?.();
                setContent('');
              }}
              className="rounded-xl p-1 text-amber-700 hover:bg-amber-500/20 transition"
              title="Cancel edit (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            disabled
              ? 'Join this community to participate in discussion...'
              : `Message #${channelName} (Shift+Enter for newline, Enter to send)`
          }
          rows={1}
          className="max-h-36 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-xs sm:text-sm text-text-primary placeholder:text-muted focus:outline-none disabled:cursor-not-allowed leading-relaxed"
        />

        {/* Action icons & Send button */}
        <div className="flex items-center gap-1.5 shrink-0 pb-1">
          {/* Emoji Picker Button */}
          <div className="relative">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-surface-alt hover:text-amber-500 transition disabled:opacity-40"
              title="Choose emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showEmojiPicker && (
                <ChatReactionPicker
                  position="top"
                  onSelectReaction={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Send / Save Button */}
          <button
            type="button"
            disabled={!content.trim() || disabled}
            onClick={handleSend}
            className={`flex h-9 items-center gap-1.5 rounded-2xl px-3.5 text-xs font-bold text-white shadow-app transition-all ${
              content.trim() && !disabled
                ? 'bg-primary hover:bg-primary-hover active:scale-95'
                : 'bg-primary/40 cursor-not-allowed opacity-60'
            }`}
          >
            <span>{editingMessage ? 'Save' : 'Send'}</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Footer helpers (Character counter + hint) */}
      <div className="mt-1 flex items-center justify-between px-2 text-[10px] text-muted">
        <span className="hidden sm:inline">
          {editingMessage
            ? 'Press Escape to cancel edit, Enter to save.'
            : 'Supports **bold**, *italic*, `code`, and links.'}
        </span>
        <span className={`ml-auto font-mono ${content.length > 1800 ? 'text-amber-500 font-bold' : ''}`}>
          {content.length}/{MAX_CHAR_LIMIT}
        </span>
      </div>
    </div>
  );
}
