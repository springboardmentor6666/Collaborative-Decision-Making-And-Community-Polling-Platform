import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SelectionDto } from '../types/vote';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { voteApi } from '../api/voteApi';

interface SavedVoteData {
  voteId: number;
  selections: SelectionDto[];
}

export function useHasVoted(decisionId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const storageKey = `decision_vote_${decisionId}_user_guest`;
  
  const [guestVote, setGuestVote] = useState<SavedVoteData | null>(null);

  // Fallback to local storage for anonymous (guest) users
  useEffect(() => {
    if (!user) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && parsed.voteId !== undefined && Array.isArray(parsed.selections)) {
            setGuestVote(parsed as SavedVoteData);
          }
        }
      } catch (e) {
        // ignore parsing error
      }
    }
  }, [user, storageKey]);

  // Fetch from backend for authenticated users
  const { data: userVote, isLoading } = useQuery({
    queryKey: ['userVote', decisionId, user?.userId],
    queryFn: () => voteApi.getUserVote(decisionId),
    enabled: !!user,
    retry: false
  });

  const savedVote = user ? (userVote || null) : guestVote;
  const hasVoted = !!savedVote;

  const setVoteData = (voteData: SavedVoteData) => {
    if (user) {
      // Update the react-query cache immediately
      queryClient.setQueryData(['userVote', decisionId, user.userId], voteData);
    } else {
      // Update local storage and state for guest
      localStorage.setItem(storageKey, JSON.stringify(voteData));
      setGuestVote(voteData);
    }
  };

  return { hasVoted, savedVote, setVoteData, isLoading };
}
