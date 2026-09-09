/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: ChatReactionPicker.jsx
 * Architecture Tier: Real-Time Chat Component (UI Layer)
 * Path: frontend/src/components/chat/ChatReactionPicker.jsx
 *
 * Purpose:
 *   Floating emoji reaction palette allowing users to quickly react to chat messages with popular emojis.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const EMOJI_OPTIONS = ['👍', '❤️', '🚀', '💡', '🔥', '😂', '🎉', '👀'];

export default function ChatReactionPicker({ onSelectReaction, onClose, position = 'top' }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, scale: 0.85, y: position === 'top' ? 8 : -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: position === 'top' ? 8 : -8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 350 }}
      className={`absolute z-30 flex items-center gap-1 rounded-2xl border border-border-default bg-surface/95 p-1.5 shadow-xl backdrop-blur-md ${
        position === 'top' ? 'bottom-full mb-2 left-0' : 'top-full mt-2 left-0'
      }`}
    >
      {EMOJI_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectReaction(emoji);
            onClose?.();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-lg transition-transform hover:scale-125 hover:bg-surface-alt active:scale-95"
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
}
