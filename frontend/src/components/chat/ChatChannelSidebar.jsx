import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash,
  Plus,
  Volume2,
  Lock,
  X,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function ChatChannelSidebar({
  channels = [],
  activeChannelId,
  onSelectChannel,
  userRole,
  onCreateChannel,
  isCreating = false,
  isOpenMobile = false,
  onCloseMobile,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [createError, setCreateError] = useState(null);

  const canCreateChannel = userRole === 'OWNER' || userRole === 'ADMIN';

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    setCreateError(null);
    try {
      const normalized = newChannelName.trim().toLowerCase().replace(/\s+/g, '-');
      await onCreateChannel({
        name: normalized,
        description: newChannelDescription.trim(),
      });
      setShowCreateModal(false);
      setNewChannelName('');
      setNewChannelDescription('');
    } catch (err) {
      setCreateError(err.message || 'Failed to create channel.');
    }
  };

  const content = (
    <div className="flex h-full w-64 flex-col border-r border-border-default bg-surface/60 backdrop-blur-md">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Channels ({channels.length})
          </h3>
        </div>

        {canCreateChannel && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-soft text-primary hover:bg-primary hover:text-white transition shadow-xs"
            title="Create new channel (Owner / Admin)"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {channels.map((ch) => {
          const isActive = ch.id === activeChannelId;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                onSelectChannel(ch.id);
                onCloseMobile?.();
              }}
              className={`group flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-app'
                  : 'text-text-primary hover:bg-surface-alt/70'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Hash
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-muted group-hover:text-primary'
                  }`}
                />
                <span className="truncate">{ch.name}</span>
              </div>

              {ch.isDefault && (
                <span
                  className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-surface-alt text-muted'
                  }`}
                >
                  Default
                </span>
              )}
            </button>
          );
        })}

        {channels.length === 0 && (
          <p className="p-4 text-center text-xs text-muted">No channels available.</p>
        )}
      </div>

      {/* Sidebar Footer Info */}
      <div className="border-t border-border-default p-3 text-[11px] text-muted">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-text-primary">Real-Time Sync</span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted">
          Active WebSocket stream with automatic fallback.
        </p>
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border-default bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary">Create Discussion Channel</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-1 text-muted hover:bg-surface-alt"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-semibold text-rose-600">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  Channel Name *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted font-bold text-sm">#</span>
                  <input
                    type="text"
                    required
                    value={newChannelName}
                    onChange={(e) =>
                      setNewChannelName(
                        e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    placeholder="ideas-and-feedback"
                    className="w-full rounded-2xl border border-border-default bg-surface pl-7 pr-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  Use lowercase letters, numbers, and hyphens.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="What is this channel about?"
                  className="w-full rounded-2xl border border-border-default bg-surface p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-border-default bg-surface px-4 py-2 text-xs font-bold text-muted hover:bg-surface-alt"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChannelName.trim() || isCreating}
                  className="rounded-2xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-app hover:bg-primary-hover transition disabled:opacity-60"
                >
                  {isCreating ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">{content}</div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
            onClick={onCloseMobile}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="h-full w-72"
              onClick={(e) => e.stopPropagation()}
            >
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
