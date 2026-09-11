import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketTopic } from '@/hooks/useWebSocketTopic';
import { ElectionResultsResponse } from '../types';

/**
 * Hook that listens to real-time election tally updates for a given voting event.
 */
export function useLiveElectionResults(eventId: number | undefined | null) {
  const queryClient = useQueryClient();

  useWebSocketTopic<ElectionResultsResponse>(
    eventId ? `/topic/elections/${eventId}/results` : null,
    (updatedResults) => {
      if (!updatedResults || !eventId) return;

      queryClient.setQueryData<ElectionResultsResponse>(
        ['elections', 'results', eventId],
        updatedResults
      );
    }
  );
}
