/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: useCommunityChat.js
 * Architecture Tier: Custom React Hook (Logic Layer)
 * Path: frontend/src/hooks/useCommunityChat.js
 *
 * Purpose:
 *   Custom React hook managing WebSocket STOMP connections, channel subscriptions, incoming messages, and typing indicators.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getChannelMessagesApi,
  sendChannelMessageApi,
  editChatMessageApi,
  deleteChatMessageApi,
  toggleMessageReactionApi,
  pinMessageApi,
  getPinnedMessagesApi,
} from '../api/axiosClient';

/**
 * Determine the appropriate WebSocket STOMP endpoint URL.
 */
function getWebSocketUrl() {
  const envUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || '';
  if (envUrl.startsWith('http://')) {
    return envUrl.replace('http://', 'ws://') + '/ws-chat';
  }
  if (envUrl.startsWith('https://')) {
    return envUrl.replace('https://', 'wss://') + '/ws-chat';
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // In dev vite setup or container port forwarding
    if (window.location.port === '3000') {
      return `${protocol}//${window.location.hostname}:8080/ws-chat`;
    }
    return `${protocol}//${host}/ws-chat`;
  }
  return 'ws://localhost:8080/ws-chat';
}

/**
 * Lightweight STOMP Frame encoder
 */
function encodeStompFrame(command, headers = {}, body = '') {
  let frame = `${command}\n`;
  for (const [k, v] of Object.entries(headers)) {
    if (v !== undefined && v !== null) {
      frame += `${k}:${v}\n`;
    }
  }
  frame += '\n';
  if (body) {
    frame += body;
  }
  frame += '\x00';
  return frame;
}

/**
 * Lightweight STOMP Frame parser
 */
function parseStompFrames(rawText) {
  const frames = [];
  const rawFrames = rawText.split('\x00');

  for (const chunk of rawFrames) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const lines = chunk.split('\n');
    let idx = 0;
    while (idx < lines.length && !lines[idx].trim()) {
      idx++;
    }
    if (idx >= lines.length) continue;

    const command = lines[idx++].trim();
    const headers = {};

    while (idx < lines.length) {
      const line = lines[idx++];
      if (line === '' || line === '\r') {
        break;
      }
      const sep = line.indexOf(':');
      if (sep !== -1) {
        const key = line.slice(0, sep).trim();
        const value = line.slice(sep + 1).trim();
        headers[key] = value;
      }
    }

    const body = lines.slice(idx).join('\n').replace(/\x00$/, '').trim();
    frames.push({ command, headers, body });
  }

  return frames;
}

/**
 * Custom hook for real-time community chat management
 */
export function useCommunityChat({ communityId, channelId, currentUser, token }) {
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [errorToast, setErrorToast] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const activeChannelRef = useRef(channelId);
  const typingTimeoutsRef = useRef({});

  activeChannelRef.current = channelId;

  // Clear toast after 4s
  const triggerError = useCallback((msg, retryAction = null) => {
    setErrorToast({ message: msg, retryAction, id: Date.now() });
    setTimeout(() => {
      setErrorToast((prev) => (prev?.message === msg ? null : prev));
    }, 5000);
  }, []);

  // Update a single message or merge by ID
  const handleIncomingMessage = useCallback((incomingMsg) => {
    if (!incomingMsg || !incomingMsg.id) return;

    setMessages((prevMessages) => {
      // Check if this incoming message matches a temporary pending message
      const tempMatchIdx = prevMessages.findIndex(
        (m) => m.isPending && m.content === incomingMsg.content && m.sender?.id === incomingMsg.sender?.id
      );

      if (tempMatchIdx !== -1) {
        const copy = [...prevMessages];
        copy[tempMatchIdx] = { ...incomingMsg, isPending: false };
        return copy;
      }

      const existingIdx = prevMessages.findIndex((m) => m.id === incomingMsg.id);
      if (existingIdx !== -1) {
        const copy = [...prevMessages];
        copy[existingIdx] = { ...copy[existingIdx], ...incomingMsg };
        return copy;
      }

      // Append new message (ordered chronologically oldest to newest)
      return [...prevMessages, incomingMsg];
    });

    // Pinned status synchronization
    if (incomingMsg.isPinned) {
      setPinnedMessages((prev) => {
        if (!prev.some((m) => m.id === incomingMsg.id)) {
          return [...prev, incomingMsg];
        }
        return prev.map((m) => (m.id === incomingMsg.id ? incomingMsg : m));
      });
    } else {
      setPinnedMessages((prev) => prev.filter((m) => m.id !== incomingMsg.id));
    }
  }, []);

  // Handle typing indicator update
  const handleIncomingTyping = useCallback(
    (typingPayload) => {
      if (!typingPayload || !typingPayload.userId) return;
      if (currentUser && String(typingPayload.userId) === String(currentUser.id)) {
        return; // Ignore own typing echo
      }

      const { userId, displayName, isTyping } = typingPayload;

      // Clear existing timeout for user
      if (typingTimeoutsRef.current[userId]) {
        clearTimeout(typingTimeoutsRef.current[userId]);
        delete typingTimeoutsRef.current[userId];
      }

      if (isTyping) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === userId)) return prev;
          return [...prev, { userId, displayName: displayName || 'Someone' }];
        });

        // Auto expire after 3.5 seconds of inactivity
        typingTimeoutsRef.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
          delete typingTimeoutsRef.current[userId];
        }, 3500);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
      }
    },
    [currentUser]
  );

  // 1. Initial REST fetch for channel history & pinned messages
  const fetchChannelData = useCallback(async () => {
    if (!communityId || !channelId) return;
    setIsLoading(true);
    setHasMore(true);

    try {
      const [history, pinned] = await Promise.all([
        getChannelMessagesApi(communityId, channelId, null, token),
        getPinnedMessagesApi(communityId, channelId, token),
      ]);

      // Backend returns desc by createdAt; reverse to display chronologically (oldest top, latest bottom)
      const ordered = Array.isArray(history) ? [...history].reverse() : [];
      setMessages(ordered);
      setPinnedMessages(Array.isArray(pinned) ? pinned : []);
      if (Array.isArray(history) && history.length < 50) {
        setHasMore(false);
      }
    } catch (err) {
      triggerError('Failed to load message history.');
    } finally {
      setIsLoading(false);
    }
  }, [communityId, channelId, token, triggerError]);

  useEffect(() => {
    fetchChannelData();
  }, [fetchChannelData]);

  // 2. Load more (older) messages for pagination
  const loadMoreMessages = useCallback(async () => {
    if (!communityId || !channelId || isLoadingMore || !hasMore || messages.length === 0) return;

    const oldestMsg = messages[0];
    if (!oldestMsg || !oldestMsg.createdAt) return;

    setIsLoadingMore(true);
    try {
      const olderData = await getChannelMessagesApi(communityId, channelId, oldestMsg.createdAt, token);
      if (Array.isArray(olderData) && olderData.length > 0) {
        const olderOrdered = [...olderData].reverse();
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueOlder = olderOrdered.filter((m) => !existingIds.has(m.id));
          return [...uniqueOlder, ...prev];
        });
        if (olderData.length < 50) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      triggerError('Failed to load older messages.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [communityId, channelId, isLoadingMore, hasMore, messages, token, triggerError]);

  // 3. Setup WebSocket Connection & STOMP Protocol
  useEffect(() => {
    if (!channelId) return;

    let ws = null;
    let isMounted = true;

    const connectWebSocket = () => {
      if (!isMounted) return;

      try {
        const wsUrl = getWebSocketUrl();
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          // Send STOMP CONNECT frame with JWT Authorization header
          const connectFrame = encodeStompFrame('CONNECT', {
            'accept-version': '1.1,1.2',
            'heart-beat': '10000,10000',
            Authorization: token ? `Bearer ${token}` : '',
            authorization: token ? `Bearer ${token}` : '',
          });
          ws.send(connectFrame);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          const rawData = event.data;
          if (typeof rawData !== 'string') return;

          // Heartbeat newline
          if (rawData === '\n' || rawData === '\r\n') {
            return;
          }

          const frames = parseStompFrames(rawData);
          for (const frame of frames) {
            if (frame.command === 'CONNECTED') {
              setIsConnected(true);
              reconnectAttemptsRef.current = 0;

              // Setup heartbeat ping
              if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
              heartbeatIntervalRef.current = setInterval(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                  ws.send('\n');
                }
              }, 10000);

              // Subscribe to channel topic
              const subChannelFrame = encodeStompFrame('SUBSCRIBE', {
                id: `sub-channel-${channelId}`,
                destination: `/topic/channels/${channelId}`,
              });
              ws.send(subChannelFrame);

              // Subscribe to typing topic
              const subTypingFrame = encodeStompFrame('SUBSCRIBE', {
                id: `sub-typing-${channelId}`,
                destination: `/topic/channels/${channelId}/typing`,
              });
              ws.send(subTypingFrame);
            } else if (frame.command === 'MESSAGE') {
              const dest = frame.headers?.destination || '';
              if (!frame.body) return;

              try {
                const parsedBody = JSON.parse(frame.body);
                if (dest.includes('/typing')) {
                  handleIncomingTyping(parsedBody);
                } else {
                  handleIncomingMessage(parsedBody);
                }
              } catch (e) {
                // Ignore parse errors on ping payloads
              }
            } else if (frame.command === 'ERROR') {
              console.warn('STOMP protocol error:', frame.headers?.message, frame.body);
            }
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setIsConnected(false);
          if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

          // Exponential backoff reconnect (up to max 12s)
          const attempts = reconnectAttemptsRef.current;
          const delay = Math.min(1000 * Math.pow(1.5, attempts), 12000);
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        };

        ws.onerror = () => {
          // Trigger close handling
          try {
            ws.close();
          } catch (e) {}
        };
      } catch (err) {
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (ws) {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            const unsub1 = encodeStompFrame('UNSUBSCRIBE', { id: `sub-channel-${channelId}` });
            const unsub2 = encodeStompFrame('UNSUBSCRIBE', { id: `sub-typing-${channelId}` });
            const disc = encodeStompFrame('DISCONNECT', {});
            ws.send(unsub1);
            ws.send(unsub2);
            ws.send(disc);
          }
          ws.close();
        } catch (e) {}
      }
      socketRef.current = null;
    };
  }, [channelId, token, handleIncomingMessage, handleIncomingTyping]);

  // 4. Graceful Fallback Polling when WebSocket is disconnected
  useEffect(() => {
    if (isConnected || !channelId || !communityId) return;

    const pollInterval = setInterval(async () => {
      try {
        const latestList = await getChannelMessagesApi(communityId, channelId, null, token);
        if (Array.isArray(latestList) && latestList.length > 0) {
          setMessages((prev) => {
            const map = new Map(prev.map((m) => [m.id, m]));
            // Merge newly polled items
            for (const item of latestList) {
              if (item.id) map.set(item.id, item);
            }
            const merged = Array.from(map.values());
            // Sort chronologically ascending
            merged.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            return merged;
          });
        }
      } catch (e) {
        // Polling failure silently ignored to avoid UI spam
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [isConnected, communityId, channelId, token]);

  // 5. Send message with Optimistic UI
  const sendMessage = useCallback(
    async (content, parentMessageId = null, messageType = 'TEXT') => {
      if (!content || !content.trim() || !channelId || !communityId) return;

      const trimmedContent = content.trim();
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const optimisticMessage = {
        id: tempId,
        channelId,
        sender: {
          id: currentUser?.id || 'usr_me',
          email: currentUser?.email || '',
          fullName: currentUser?.name || currentUser?.fullName || 'You',
          profileImage: currentUser?.avatar || '',
        },
        content: trimmedContent,
        messageType,
        isPinned: false,
        isEdited: false,
        isDeleted: false,
        parentMessageId,
        reactions: {},
        createdAt: new Date().toISOString(),
        isPending: true,
        isFailed: false,
      };

      // 1. Optimistic append
      setMessages((prev) => [...prev, optimisticMessage]);

      // 2. Try sending via WebSocket if connected, otherwise via REST API
      const payload = {
        content: trimmedContent,
        messageType,
        parentMessageId: parentMessageId ? Number(parentMessageId) : null,
      };

      try {
        const ws = socketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN && isConnected) {
          const sendFrame = encodeStompFrame(
            'SEND',
            {
              destination: `/app/chat.send/${channelId}`,
              'content-type': 'application/json',
            },
            JSON.stringify(payload)
          );
          ws.send(sendFrame);
        } else {
          // REST Fallback
          const confirmed = await sendChannelMessageApi(communityId, channelId, payload, token);
          if (confirmed && confirmed.id) {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempId ? { ...confirmed, isPending: false } : m))
            );
          }
        }
      } catch (err) {
        // Mark as failed
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, isPending: false, isFailed: true } : m))
        );
        triggerError('Failed to send message.', () => sendMessage(trimmedContent, parentMessageId, messageType));
      }
    },
    [channelId, communityId, currentUser, isConnected, token, triggerError]
  );

  // 6. Broadcast Typing Indicator
  const sendTyping = useCallback(
    (isTyping) => {
      const ws = socketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN && isConnected && channelId) {
        try {
          const typingFrame = encodeStompFrame(
            'SEND',
            {
              destination: `/app/chat.typing/${channelId}`,
              'content-type': 'application/json',
            },
            JSON.stringify({ isTyping: Boolean(isTyping) })
          );
          ws.send(typingFrame);
        } catch (e) {}
      }
    },
    [channelId, isConnected]
  );

  // 7. Toggle Reaction
  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      if (!messageId || !emoji || !communityId) return;

      // Optimistic reaction update
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const rx = { ...(m.reactions || {}) };
          const myName = currentUser?.name || currentUser?.fullName || currentUser?.email || 'You';
          const list = rx[emoji] ? [...rx[emoji]] : [];
          const userIdx = list.indexOf(myName);
          if (userIdx !== -1) {
            list.splice(userIdx, 1);
            if (list.length === 0) delete rx[emoji];
            else rx[emoji] = list;
          } else {
            rx[emoji] = [...list, myName];
          }
          return { ...m, reactions: rx };
        })
      );

      try {
        const updated = await toggleMessageReactionApi(communityId, messageId, emoji, token);
        if (updated && updated.id) {
          handleIncomingMessage(updated);
        }
      } catch (err) {
        triggerError('Failed to update reaction.');
      }
    },
    [communityId, currentUser, token, handleIncomingMessage, triggerError]
  );

  // 8. Toggle Pin
  const togglePin = useCallback(
    async (messageId) => {
      if (!messageId || !communityId) return;
      try {
        const updated = await pinMessageApi(communityId, messageId, token);
        if (updated && updated.id) {
          handleIncomingMessage(updated);
        }
      } catch (err) {
        triggerError(err.message || 'Failed to toggle pin.');
      }
    },
    [communityId, token, handleIncomingMessage, triggerError]
  );

  // 9. Delete Message
  const deleteMessage = useCallback(
    async (messageId) => {
      if (!messageId || !communityId) return;
      try {
        await deleteChatMessageApi(communityId, messageId, token);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, isDeleted: true, content: '[Message deleted]' } : m
          )
        );
        setPinnedMessages((prev) => prev.filter((m) => m.id !== messageId));
      } catch (err) {
        triggerError(err.message || 'Failed to delete message.');
      }
    },
    [communityId, token, triggerError]
  );

  // 10. Edit Message
  const editMessage = useCallback(
    async (messageId, newContent) => {
      if (!messageId || !newContent.trim() || !communityId) return;
      try {
        const updated = await editChatMessageApi(communityId, messageId, { content: newContent.trim() }, token);
        if (updated && updated.id) {
          handleIncomingMessage(updated);
        }
      } catch (err) {
        triggerError(err.message || 'Failed to edit message.');
      }
    },
    [communityId, token, handleIncomingMessage, triggerError]
  );

  // 11. Retry failed pending message
  const retryMessage = useCallback(
    (tempId) => {
      const failed = messages.find((m) => m.id === tempId);
      if (!failed) return;
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      sendMessage(failed.content, failed.parentMessageId, failed.messageType);
    },
    [messages, sendMessage]
  );

  return {
    messages,
    pinnedMessages,
    typingUsers,
    isLoading,
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
  };
}
