package com.decisionhub.websocket;

import com.decisionhub.dto.response.CommentResponse;
import com.decisionhub.dto.response.ElectionResultsResponse;
import com.decisionhub.dto.response.NotificationResponse;
import com.decisionhub.dto.response.VoteResultResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Service component responsible for publishing real-time STOMP events to connected WebSocket clients.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcasts updated decision vote tally and percentage statistics.
     */
    public void broadcastDecisionVoteResults(Long decisionId, VoteResultResponse results) {
        if (decisionId == null || results == null) return;
        String destination = "/topic/decisions/" + decisionId + "/votes";
        try {
            messagingTemplate.convertAndSend(destination, results);
            log.debug("Broadcasted live vote update to {}", destination);
        } catch (Exception e) {
            log.error("Failed to broadcast vote update to {}: {}", destination, e.getMessage());
        }
    }

    /**
     * Broadcasts a new or updated comment in a decision discussion thread.
     */
    public void broadcastComment(Long decisionId, CommentResponse comment) {
        if (decisionId == null || comment == null) return;
        String destination = "/topic/decisions/" + decisionId + "/comments";
        try {
            messagingTemplate.convertAndSend(destination, comment);
            log.debug("Broadcasted live comment to {}", destination);
        } catch (Exception e) {
            log.error("Failed to broadcast comment to {}: {}", destination, e.getMessage());
        }
    }

    /**
     * Pushes a private real-time notification to a specific user.
     */
    public void sendLiveNotification(String username, NotificationResponse notification) {
        if (username == null || notification == null) return;
        try {
            messagingTemplate.convertAndSendToUser(username, "/queue/notifications", notification);
            log.debug("Sent live notification to user '{}'", username);
        } catch (Exception e) {
            log.error("Failed to send live notification to user '{}': {}", username, e.getMessage());
        }
    }

    /**
     * Broadcasts live election results to all viewers of an election event.
     */
    public void broadcastElectionResults(Long eventId, ElectionResultsResponse results) {
        if (eventId == null || results == null) return;
        String destination = "/topic/elections/" + eventId + "/results";
        try {
            messagingTemplate.convertAndSend(destination, results);
            log.debug("Broadcasted live election results to {}", destination);
        } catch (Exception e) {
            log.error("Failed to broadcast election results to {}: {}", destination, e.getMessage());
        }
    }
}
