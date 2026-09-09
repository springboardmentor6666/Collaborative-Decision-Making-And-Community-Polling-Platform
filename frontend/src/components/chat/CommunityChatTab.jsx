/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: CommunityChatTab.jsx
 * Architecture Tier: Real-Time Chat Component (UI Layer)
 * Path: frontend/src/components/chat/CommunityChatTab.jsx
 *
 * Purpose:
 *   Integrated community chat view orchestrating channel selection, message stream, real-time STOMP subscriptions, and active presence.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Hash,
  Menu,
  Wifi,
  WifiOff,
  Radio,
  Lock,
  UserPlus,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { getCommunityChannelsApi, createCommunityChannelApi } from '../../api/axiosClient';
import { useCommunityChat } from '../../hooks/useCommunityChat';
import ChatChannelSidebar from './ChatChannelSidebar';
import ChatMessageStream from './ChatMessageStream';
import ChatComposer from './ChatComposer';

export default function CommunityChatTab({
  community,
  currentUser,
  token,
  onJoinCommunity,
}) {
  const communityId = community?.id;
  const isMember = Boolean(
    community?.isMember ||
    community?.member ||
    (community?.currentUserRole && community?.currentUserRole !== 'NONE') ||
    (currentUser && community?.createdBy && (String(community?.createdBy?.id) === String(currentUser?.id) || community?.createdBy?.email === currentUser?.email))
  );

  const [channels, setChannels] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Message composing state
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  // 1. Fetch channel list
  useEffect(() => {
    if (!communityId) return;

    let isMounted = true;
    setLoadingChannels(true);

    getCommunityChannelsApi(communityId, token)
      .then((data) => {
        if (!isMounted) return;
        const channelList = Array.isArray(data) ? data : [];
        setChannels(channelList);

        if (channelList.length > 0) {
          const defaultCh = channelList.find((c) => c.isDefault) || channelList[0];
          setActiveChannelId(defaultCh.id);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingChannels(false);
      });

    return () => {
      isMounted = false;
    };
  }, [communityId, token]);

  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === activeChannelId) || channels[0] || null;
  }, [channels, activeChannelId]);

  // 2. Real-time chat hook for active channel
  const {
    messages,
    pinnedMessages,
    typingUsers,
    isLoading: isLoadingMessages,
    isLoadingMore,
    hasMore,
    isConnected,
    errorToast,
    sendMessage,
    sendTyping,
    toggleReaction,
    togglePin,
    deleteMessage,
    editMessage,
    retryMessage,
    loadMoreMessages,
  } = useCommunityChat({
    communityId,
    channelId: activeChannelId,
    currentUser,
    token,
  });

  // Handle Channel creation
  const handleCreateChannel = async (channelData) => {
    setIsCreatingChannel(true);
    try {
      const created = await createCommunityChannelApi(communityId, channelData, token);
      if (created && created.id) {
        setChannels((prev) => [...prev, created]);
        setActiveChannelId(created.id);
      }
    } finally {
      setIsCreatingChannel(false);
    }
  };

  // Last sent message by current user for quick ArrowUp edit
  const lastSentMessage = useMemo(() => {
    if (!currentUser) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (
        !m.isDeleted &&
        !m.isPending &&
        m.sender &&
        (String(m.sender.id) === String(currentUser.id) || m.sender.email === currentUser.email)
      ) {
        return m;
      }
    }
    return null;
  }, [messages, currentUser]);

  // Private community lock gate
  if (community?.visibility === 'PRIVATE' && !isMember) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border-default bg-surface/80 p-12 text-center backdrop-blur-md shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Private Discussion Room</h2>
        <p className="max-w-md text-xs text-muted mb-6">
          This community is private. You must join or be invited as a member to read channel discussions, post messages, and interact with polls.
        </p>
        {onJoinCommunity && (
          <button
            onClick={onJoinCommunity}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-app hover:bg-primary-hover transition active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Join Community to Participate</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-[620px] flex-col overflow-hidden rounded-3xl border border-border-default bg-surface/80 backdrop-blur-md shadow-sm">
      {/* Chat Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3 bg-surface/90">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle button */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-surface-alt md:hidden transition"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-sm font-bold text-text-primary leading-tight">
                {activeChannel?.name || 'general'}
              </h2>
              {activeChannel?.description && (
                <p className="text-[11px] text-muted truncate max-w-xs sm:max-w-md">
                  {activeChannel.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Live sync connection badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
            }`}
            title={
              isConnected
                ? 'Live WebSocket connection active'
                : 'Connected in Fallback Polling mode (auto-syncing every 4s)'
            }
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden sm:inline">
              {isConnected ? 'Live WebSocket' : 'Polling (4s)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Body: Channels Sidebar + Message Stream */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Channels Sidebar */}
        <ChatChannelSidebar
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={(chId) => {
            setActiveChannelId(chId);
            setReplyingTo(null);
            setEditingMessage(null);
          }}
          userRole={community?.currentUserRole}
          onCreateChannel={handleCreateChannel}
          isCreating={isCreatingChannel}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Column: Message Stream + Composer */}
        <div className="flex flex-1 flex-col overflow-hidden bg-background/50">
          <ChatMessageStream
            messages={messages}
            pinnedMessages={pinnedMessages}
            typingUsers={typingUsers}
            isLoading={isLoadingMessages}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            currentUser={currentUser}
            userRole={community?.currentUserRole}
            onLoadMore={loadMoreMessages}
            onReply={(msg) => {
              setReplyingTo(msg);
              setEditingMessage(null);
            }}
            onReactionToggle={toggleReaction}
            onPinToggle={togglePin}
            onDelete={deleteMessage}
            onEdit={(msg) => {
              setEditingMessage(msg);
              setReplyingTo(null);
            }}
            onRetry={retryMessage}
          />

          {/* Composer */}
          <div className="p-3 border-t border-border-default bg-surface/60 backdrop-blur-sm">
            <ChatComposer
              channelName={activeChannel?.name || 'general'}
              replyingTo={replyingTo}
              editingMessage={editingMessage}
              onCancelReply={() => setReplyingTo(null)}
              onCancelEdit={() => setEditingMessage(null)}
              onSendMessage={(content, parentId) => sendMessage(content, parentId, 'TEXT')}
              onSaveEdit={(msgId, newContent) => editMessage(msgId, newContent)}
              onTyping={sendTyping}
              lastSentMessage={lastSentMessage}
              onTriggerEditLast={(msg) => {
                setEditingMessage(msg);
                setReplyingTo(null);
              }}
              disabled={!isMember && community?.visibility === 'PRIVATE'}
            />
          </div>
        </div>
      </div>

      {/* Error Toast Notification with Retry */}
      <AnimatePresence>
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-surface/95 px-4 py-2.5 text-xs font-semibold text-rose-600 shadow-xl backdrop-blur-md"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorToast.message}</span>
            {errorToast.retryAction && (
              <button
                onClick={() => {
                  errorToast.retryAction();
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 px-2.5 py-1 text-rose-700 font-bold hover:bg-rose-500/20 transition"
              >
                <RotateCcw className="h-3 w-3" />
                Retry
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
