import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketTopic } from '@/hooks/useWebSocketTopic';
import { VoteResultResponse } from '../types/vote';

/**
 * Hook that subscribes to real-time vote count and percentage updates for a decision.
 * Automatically updates TanStack Query cache without manual polling.
 */
export function useLiveDecisionVotes(decisionId: number | undefined | null) {
  const queryClient = useQueryClient();

  useWebSocketTopic<VoteResultResponse>(
    decisionId ? `/topic/decisions/${decisionId}/votes` : null,
    (updatedResults) => {
      if (!updatedResults || !decisionId) return;

      // Update the voteResults cache directly for instant UI responsiveness
      queryClient.setQueryData<VoteResultResponse>(
        ['voteResults', decisionId],
        updatedResults
      );

      // Invalidate the parent decision query to update total voteCount if present
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] });
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    }
  );
}
