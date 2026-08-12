package com.decisionhub.scheduler;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.NotificationType;
import com.decisionhub.entity.Decision;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled cron task monitoring decision deadlines and automatically transitioning expired decisions to CLOSED status.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class DecisionScheduler {

    private final DecisionRepository decisionRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 */5 * * * *") // Runs every 5 minutes
    @Transactional
    public void closeExpiredDecisions() {
        log.info("Running DecisionScheduler: checking for expired active decision boards...");
        List<Decision> expiredDecisions = decisionRepository.findByStatusAndDeadlineBefore(DecisionStatus.ACTIVE, LocalDateTime.now());

        for (Decision decision : expiredDecisions) {
            decision.setStatus(DecisionStatus.CLOSED);
            decisionRepository.save(decision);

            log.info("Decision ID {} deadline reached. Transitioned status to CLOSED.", decision.getDecisionId());

            // Dispatch notification to author
            notificationService.sendNotification(
                    decision.getCreatedBy().getUserId(),
                    "Poll Closed",
                    "Voting for your decision board '" + decision.getTitle() + "' has concluded.",
                    NotificationType.DECISION_CLOSED
            );
        }
    }
}
