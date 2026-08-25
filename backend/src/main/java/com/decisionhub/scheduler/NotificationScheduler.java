package com.decisionhub.scheduler;

import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Poll;
import com.decisionhub.entity.Vote;
import com.decisionhub.event.NotificationEvent;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.PollRepository;
import com.decisionhub.repository.VoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@EnableScheduling
public class NotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(NotificationScheduler.class);

    private final PollRepository pollRepository;
    private final DecisionRepository decisionRepository;
    private final VoteRepository voteRepository;
    private final ApplicationEventPublisher eventPublisher;

    public NotificationScheduler(PollRepository pollRepository,
                                 DecisionRepository decisionRepository,
                                 VoteRepository voteRepository,
                                 ApplicationEventPublisher eventPublisher) {
        this.pollRepository = pollRepository;
        this.decisionRepository = decisionRepository;
        this.voteRepository = voteRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Checks polls every 60 seconds for completion or expiration.
     */
    @Scheduled(fixedRate = 60000)
    public void checkExpiredPollsAndReminders() {
        logger.info("Running NotificationScheduler poll-completion and voting-reminder check...");

        List<Poll> allPolls = pollRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (Poll poll : allPolls) {
            if (poll.getEndsAt() != null && now.isAfter(poll.getEndsAt())) {
                Decision decision = poll.getDecision();
                if (decision != null && "OPEN".equalsIgnoreCase(decision.getStatus())) {
                    decision.setStatus("EXPIRED");
                    decisionRepository.save(decision);

                    logger.info("Poll ID {} expired. Transitioned decision ID {} to EXPIRED status.", poll.getId(), decision.getId());

                    // Publish notification event to decision owner
                    if (decision.getOwner() != null) {
                        String msg = "Voting closed for your decision: " + decision.getTitle();
                        eventPublisher.publishEvent(new NotificationEvent(this, decision.getOwner(), "POLL_ENDED", msg, "Poll Voting Completed"));
                    }

                    // Notify voters
                    List<Vote> votes = voteRepository.findByPollId(poll.getId());
                    for (Vote vote : votes) {
                        if (vote.getVoter() != null && decision.getOwner() != null && !vote.getVoter().getId().equals(decision.getOwner().getId())) {
                            String msg = "The poll for decision '" + decision.getTitle() + "' has concluded. Check out final results!";
                            eventPublisher.publishEvent(new NotificationEvent(this, vote.getVoter(), "POLL_RESULTS_AVAILABLE", msg, "Poll Results Finalized"));
                        }
                    }
                }
            }
        }
    }
}
