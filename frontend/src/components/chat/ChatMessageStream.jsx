import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pin,
  ChevronDown,
  ArrowDown,
  MessageSquareDashed,
  Loader2,
  Sparkles,
} from 'lucide-react';
import ChatMessageItem from './ChatMessageItem';

/**
 * Format date for separator pills
 */
function getMessageDateGroup(dateString) {
  if (!dateString) return 'Today';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Today';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export default function ChatMessageStream({
  messages = [],
  pinnedMessages = [],
  typingUsers = [],
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  currentUser = null,
  userRole = null,
  onLoadMore,
  onReply,
  onReactionToggle,
  onPinToggle,
  onDelete,
  onEdit,
  onRetry,
}) {
  const containerRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [showPinnedExpanded, setShowPinnedExpanded] = useState(false);
  const prevMessagesLengthRef = useRef(messages.length);

  // Map of messages by ID for fast parent lookup
  const messageMap = useMemo(() => {
    const map = new Map();
    messages.forEach((m) => {
      if (m.id) map.set(m.id, m);
    });
    return map;
  }, [messages]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((msg) => {
      const dateKey = getMessageDateGroup(msg.createdAt);
      if (!currentGroup || currentGroup.date !== dateKey) {
        currentGroup = { date: dateKey, items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(msg);
    });

    return groups;
  }, [messages]);

  // Scroll detection to show "↓ New Messages" pill
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsScrolledUp(distanceFromBottom > 150);
  };

  // Auto scroll to bottom when new message arrives (unless scrolled up)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const hadNewMessages = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (hadNewMessages && !isScrolledUp) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 0 && prevMessagesLengthRef.current === messages.length) {
      // First load scroll instantly to bottom
      bottomAnchorRef.current?.scrollIntoView();
    }
  }, [messages, isScrolledUp]);

  const scrollToBottom = () => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsScrolledUp(false);
  };

  const jumpToMessage = (messageId) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-primary-soft/40');
      setTimeout(() => {
        el.classList.remove('bg-primary-soft/40');
      }, 1800);
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Sticky Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="relative z-20 border-b border-border-default bg-surface/90 px-4 py-2 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div
              onClick={() => setShowPinnedExpanded((prev) => !prev)}
              className="flex items-center gap-2 cursor-pointer text-amber-600 font-bold truncate flex-1"
            >
              <Pin className="h-3.5 w-3.5 shrink-0" />
              <span>
                {pinnedMessages.length} Pinned Message{pinnedMessages.length !== 1 ? 's' : ''}
              </span>
              <span className="text-muted font-normal truncate hidden sm:inline">
                — {pinnedMessages[0]?.content}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => jumpToMessage(pinnedMessages[0]?.id)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Jump to latest
              </button>
              <button
                onClick={() => setShowPinnedExpanded((prev) => !prev)}
                className="rounded-lg p-1 text-muted hover:bg-surface-alt transition"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    showPinnedExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Expanded Pinned Messages Drawer */}
          <AnimatePresence>
            {showPinnedExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2 border-t border-border-default/60 pt-2"
              >
                {pinnedMessages.map((pm) => (
                  <div
                    key={pm.id}
                    className="flex items-center justify-between rounded-xl bg-surface-alt/70 p-2 text-xs"
                  >
                    <div
                      onClick={() => jumpToMessage(pm.id)}
                      className="cursor-pointer truncate flex-1 pr-3"
                    >
                      <strong className="text-text-primary mr-2">
                        {pm.sender?.fullName || pm.sender?.name || 'Member'}:
                      </strong>
                      <span className="text-muted">{pm.content}</span>
                    </div>
                    {onPinToggle && (userRole === 'OWNER' || userRole === 'ADMIN') && (
                      <button
                        onClick={() => onPinToggle(pm.id)}
                        className="text-[11px] font-semibold text-muted hover:text-amber-600 shrink-0"
                      >
                        Unpin
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Message List Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 py-4 space-y-4"
      >
        {/* Load older messages button / spinner */}
        {hasMore && (
          <div className="flex justify-center pb-2">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-border-default bg-surface px-4 py-1.5 text-xs font-semibold text-muted hover:bg-surface-alt hover:text-text-primary shadow-xs transition"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span>Loading history...</span>
                </>
              ) : (
                <span>↑ Load older messages</span>
              )}
            </button>
          </div>
        )}

        {/* Loading initial skeleton */}
        {isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-xs">Loading channel discussion...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-soft text-primary shadow-sm">
              <MessageSquareDashed className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">No messages here yet</h3>
              <p className="mt-1 text-xs text-muted max-w-xs mx-auto">
                Be the first to start the discussion in this channel! Share an idea, ask a question, or post an update.
              </p>
            </div>
          </div>
        )}

        {/* Render grouped messages */}
        {groupedMessages.map((group) => (
          <div key={group.date} className="space-y-1">
            {/* Date separator pill */}
            <div className="sticky top-2 z-10 my-3 flex items-center justify-center">
              <span className="rounded-full border border-border-default/80 bg-surface/90 px-3 py-0.5 text-[11px] font-bold text-muted shadow-xs backdrop-blur-md">
                {group.date}
              </span>
            </div>

            {/* Messages in group */}
            {group.items.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                parentMessage={msg.parentMessageId ? messageMap.get(msg.parentMessageId) : null}
                currentUser={currentUser}
                userRole={userRole}
                onReply={onReply}
                onReactionToggle={onReactionToggle}
                onPinToggle={onPinToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onRetry={onRetry}
                onJumpToParent={jumpToMessage}
              />
            ))}
          </div>
        ))}

        <div ref={bottomAnchorRef} className="h-2" />
      </div>

      {/* Typing Indicator Bar */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex items-center gap-2 px-6 py-1.5 text-xs text-muted italic border-t border-border-default/40 bg-surface/60 backdrop-blur-xs"
          >
            <span className="flex gap-1 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
            </span>
            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0].displayName} is typing...`
                : typingUsers.length === 2
                ? `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing...`
                : `${typingUsers.length} members are typing...`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating "↓ New Messages" Pill */}
      <AnimatePresence>
        {isScrolledUp && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 right-6 z-30 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-app hover:bg-primary-hover active:scale-95 transition-all"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span>New Messages</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
