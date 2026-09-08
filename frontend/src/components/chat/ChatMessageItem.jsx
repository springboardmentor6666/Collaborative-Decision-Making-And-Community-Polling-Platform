import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pin,
  Reply,
  Smile,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
  CornerDownRight,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import ChatReactionPicker from './ChatReactionPicker';
import { useAlert } from '../../context/AlertContext';

/**
 * Basic markdown parser for chat messages.
 */
function renderMarkdownContent(text) {
  if (!text) return '';

  // Handle code blocks
  if (text.startsWith('```') && text.endsWith('```')) {
    const code = text.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
    return (
      <pre className="my-1.5 overflow-x-auto rounded-xl bg-surface-alt p-3 font-mono text-xs text-text-primary border border-border-default">
        <code>{code}</code>
      </pre>
    );
  }

  // Split lines for formatting
  const lines = text.split('\n');

  return lines.map((line, lIdx) => {
    // Process bold, italic, inline code, and URLs
    const parts = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      // Inline code `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className="rounded bg-surface-alt px-1.5 py-0.5 font-mono text-[11px] text-primary border border-border-default"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold **bold**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={key++} className="font-bold text-text-primary">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic *italic*
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        parts.push(
          <em key={key++} className="italic text-text-primary">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // URL [title](url) or http(s)://
      const linkMatch = remaining.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary-hover font-semibold break-all"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      const rawUrlMatch = remaining.match(/^(https?:\/\/[^\s]+)/);
      if (rawUrlMatch) {
        parts.push(
          <a
            key={key++}
            href={rawUrlMatch[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary-hover font-medium break-all"
          >
            {rawUrlMatch[1]}
          </a>
        );
        remaining = remaining.slice(rawUrlMatch[0].length);
        continue;
      }

      // Plain text up to the next potential token
      const nextSpecial = remaining.search(/[`*\[h]/);
      if (nextSpecial === -1 || nextSpecial === 0) {
        parts.push(remaining.charAt(0));
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return (
      <span key={lIdx} className="block leading-relaxed">
        {parts.length > 0 ? parts : <br />}
      </span>
    );
  });
}

function formatChatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessageItem({
  message,
  parentMessage = null,
  currentUser,
  userRole,
  onReply,
  onReactionToggle,
  onPinToggle,
  onDelete,
  onEdit,
  onRetry,
  onJumpToParent,
}) {
  const { showConfirm } = useAlert();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sender = message.sender || {};
  const isAuthor =
    (currentUser && sender.id && String(currentUser.id) === String(sender.id)) ||
    (currentUser && sender.email && currentUser.email === sender.email);

  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN' || currentUser?.role === 'ADMIN';
  const canDelete = !message.isDeleted && (isAuthor || isOwnerOrAdmin);
  const canPin = !message.isDeleted && isOwnerOrAdmin;
  const canEdit = !message.isDeleted && isAuthor && !message.isPending;

  const currentUserName = currentUser?.name || currentUser?.fullName || currentUser?.email || 'You';

  // Format avatar
  const avatarUrl =
    sender.profileImage ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sender.email || sender.fullName || 'user')}`;

  const reactionEntries = useMemo(() => {
    return Object.entries(message.reactions || {}).filter(([_, users]) => Array.isArray(users) && users.length > 0);
  }, [message.reactions]);

  return (
    <div
      id={`msg-${message.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowReactionPicker(false);
      }}
      className={`group relative flex gap-3 px-4 py-2.5 transition-colors rounded-2xl ${
        message.isPinned ? 'bg-amber-500/5 border-l-4 border-l-amber-500' : 'hover:bg-surface-alt/40'
      } ${message.isPending ? 'opacity-70' : ''}`}
    >
      {/* Sender Avatar */}
      <div className="relative shrink-0 pt-0.5">
        <img
          src={avatarUrl}
          alt={sender.fullName || 'User'}
          className="h-9 w-9 rounded-2xl border border-border-default bg-surface-alt object-cover shadow-xs"
        />
        {sender.role === 'OWNER' && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs" title="Community Owner">
            <Crown className="h-2.5 w-2.5" />
          </span>
        )}
        {sender.role === 'ADMIN' && sender.role !== 'OWNER' && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-white shadow-xs" title="Community Admin">
            <ShieldCheck className="h-2.5 w-2.5" />
          </span>
        )}
      </div>

      {/* Message Body */}
      <div className="min-w-0 flex-1">
        {/* Header (Author, Role badge, timestamp, pinned badge) */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold text-xs text-text-primary hover:underline cursor-pointer">
            {sender.fullName || sender.name || sender.email || 'Member'}
          </span>

          {sender.role && (
            <span
              className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider ${
                sender.role === 'OWNER'
                  ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                  : sender.role === 'ADMIN'
                  ? 'bg-purple-500/15 text-purple-600 border border-purple-500/30'
                  : 'bg-surface-alt text-muted'
              }`}
            >
              {sender.role}
            </span>
          )}

          <span className="text-[11px] text-muted">
            {formatChatTime(message.createdAt)}
          </span>

          {message.isEdited && !message.isDeleted && (
            <span className="text-[10px] italic text-muted">(edited)</span>
          )}

          {message.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-600">
              <Pin className="h-2.5 w-2.5" /> Pinned
            </span>
          )}

          {message.isPending && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" /> Sending...
            </span>
          )}

          {message.isFailed && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
              <AlertCircle className="h-3 w-3" /> Sending failed
              {onRetry && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="underline hover:text-rose-700 cursor-pointer"
                >
                  Retry
                </button>
              )}
            </span>
          )}
        </div>

        {/* Threaded Parent Message Quote Preview */}
        {message.parentMessageId && (
          <div
            onClick={() => onJumpToParent?.(message.parentMessageId)}
            className="mb-2 flex items-center gap-1.5 rounded-xl border border-border-default/60 bg-surface-alt/50 px-2.5 py-1 text-xs text-muted hover:border-primary-soft hover:bg-surface-alt transition-colors cursor-pointer group/quote max-w-fit"
          >
            <CornerDownRight className="h-3 w-3 text-primary shrink-0" />
            <span className="font-semibold text-text-primary text-[11px]">
              {parentMessage?.sender?.fullName || parentMessage?.sender?.name || 'Message'}
            </span>
            <span className="truncate max-w-xs text-[11px]">
              {parentMessage?.content || 'Replying to previous discussion...'}
            </span>
          </div>
        )}

        {/* Text / Markdown Content */}
        <div className={`text-xs text-text-primary break-words [overflow-wrap:anywhere] ${message.isDeleted ? 'italic text-muted' : ''}`}>
          {message.isDeleted ? '[This message has been deleted]' : renderMarkdownContent(message.content)}
        </div>

        {/* Emoji Reactions Pills */}
        {reactionEntries.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {reactionEntries.map(([emoji, users]) => {
              const hasReacted = users.includes(currentUserName);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onReactionToggle?.(message.id, emoji)}
                  title={users.join(', ')}
                  className={`inline-flex items-center gap-1 rounded-xl px-2 py-0.5 text-xs font-semibold transition-all ${
                    hasReacted
                      ? 'border border-primary bg-primary-soft text-primary shadow-xs'
                      : 'border border-border-default bg-surface hover:bg-surface-alt text-text-primary'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[11px] font-bold">{users.length}</span>
                </button>
              );
            })}

            {/* Quick add reaction button next to pills */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowReactionPicker((prev) => !prev)}
                className="flex h-6 w-6 items-center justify-center rounded-xl border border-dashed border-border-default bg-surface text-muted hover:text-text-primary hover:border-primary-soft text-xs transition"
                title="Add Reaction"
              >
                +
              </button>
              <AnimatePresence>
                {showReactionPicker && (
                  <ChatReactionPicker
                    position="top"
                    onSelectReaction={(emoji) => onReactionToggle?.(message.id, emoji)}
                    onClose={() => setShowReactionPicker(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Floating Hover Action Bar */}
      {!message.isDeleted && !message.isPending && (
        <div
          className={`absolute top-2 right-4 z-20 flex items-center gap-0.5 rounded-2xl border border-border-default bg-surface/95 p-1 shadow-md backdrop-blur-md transition-opacity ${
            isHovered || showReactionPicker ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Reaction picker trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReactionPicker((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-muted hover:bg-surface-alt hover:text-amber-500 transition"
              title="Add Reaction"
            >
              <Smile className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showReactionPicker && (
                <ChatReactionPicker
                  position="top"
                  onSelectReaction={(emoji) => onReactionToggle?.(message.id, emoji)}
                  onClose={() => setShowReactionPicker(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Reply */}
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-muted hover:bg-surface-alt hover:text-primary transition"
              title="Reply in thread"
            >
              <Reply className="h-4 w-4" />
            </button>
          )}

          {/* Edit (author only) */}
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(message)}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-muted hover:bg-surface-alt hover:text-text-primary transition"
              title="Edit message"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Pin (owner/admin only) */}
          {canPin && onPinToggle && (
            <button
              type="button"
              onClick={() => onPinToggle(message.id)}
              className={`flex h-7 w-7 items-center justify-center rounded-xl transition ${
                message.isPinned
                  ? 'text-amber-500 hover:bg-amber-500/10'
                  : 'text-muted hover:bg-surface-alt hover:text-amber-500'
              }`}
              title={message.isPinned ? 'Unpin message' : 'Pin message'}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Delete */}
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={async () => {
                const confirmed = await showConfirm({
                  title: 'Delete Message',
                  message: 'Delete this message for everyone?',
                  confirmText: 'Delete',
                  isDangerous: true,
                });
                if (confirmed) {
                  onDelete(message.id);
                }
              }}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-muted hover:bg-rose-50 hover:text-rose-600 transition"
              title="Delete message"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
