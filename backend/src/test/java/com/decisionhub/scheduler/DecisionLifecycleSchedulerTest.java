package com.decisionhub.scheduler;

import com.decisionhub.entity.Decision;
import com.decisionhub.entity.DecisionOption;
import com.decisionhub.entity.Poll;
import com.decisionhub.entity.PollOption;
import com.decisionhub.entity.User;
import com.decisionhub.entity.Vote;
import com.decisionhub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class DecisionLifecycleSchedulerTest {

    @Autowired
    private DecisionLifecycleScheduler scheduler;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private DecisionOptionRepository decisionOptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private PollOptionRepository pollOptionRepository;

    @Autowired
    private VoteRepository voteRepository;

    private User owner;
    private User voter;

    @BeforeEach
    void setUp() {
        voteRepository.deleteAll();
        pollOptionRepository.deleteAll();
        pollRepository.deleteAll();
        decisionOptionRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();

        owner = new User();
        owner.setEmail("scheduler_owner@test.com");
        owner.setFullName("Scheduler Owner");
        owner.setPasswordHash("pass");
        userRepository.save(owner);

        voter = new User();
        voter.setEmail("scheduler_voter@test.com");
        voter.setFullName("Scheduler Voter");
        voter.setPasswordHash("pass");
        userRepository.save(voter);
    }

    @Test
    void autoCloseExpiredDecisions_ClosesExpiredDecisionAndSetsWinner() {
        // Create expired decision with autoClose = true
        Decision expiredDecision = new Decision();
        expiredDecision.setTitle("Expired Proposal");
        expiredDecision.setOwner(owner);
        expiredDecision.setStatus("OPEN");
        expiredDecision.setAutoClose(true);
        expiredDecision.setEndsAt(LocalDateTime.now().minusMinutes(10));
        decisionRepository.save(expiredDecision);

        DecisionOption optA = new DecisionOption();
        optA.setDecision(expiredDecision);
        optA.setLabel("Option Alpha");
        decisionOptionRepository.save(optA);

        DecisionOption optB = new DecisionOption();
        optB.setDecision(expiredDecision);
        optB.setLabel("Option Beta");
        decisionOptionRepository.save(optB);

        Poll poll = new Poll();
        poll.setDecision(expiredDecision);
        poll.setPollType("SINGLE");
        poll.setVotingMethod("SINGLE_CHOICE");
        pollRepository.save(poll);

        PollOption poA = new PollOption();
        poA.setPoll(poll);
        poA.setOption(optA);
        pollOptionRepository.save(poA);

        PollOption poB = new PollOption();
        poB.setPoll(poll);
        poB.setOption(optB);
        pollOptionRepository.save(poB);

        // Cast vote for Option Alpha
        Vote vote = new Vote();
        vote.setPoll(poll);
        vote.setPollOption(poA);
        vote.setVoter(voter);
        voteRepository.save(vote);

        // Run scheduler
        scheduler.autoCloseExpiredDecisions();

        Decision updated = decisionRepository.findById(expiredDecision.getId()).orElseThrow();
        assertEquals("CLOSED", updated.getStatus());
        assertNotNull(updated.getWinningOption());
        assertEquals("Option Alpha", updated.getWinningOption().getLabel());
    }

    @Test
    void autoCloseExpiredDecisions_DoesNotCloseFutureOrDisabledDecisions() {
        // Future decision with autoClose = true
        Decision futureDecision = new Decision();
        futureDecision.setTitle("Future Decision");
        futureDecision.setOwner(owner);
        futureDecision.setStatus("OPEN");
        futureDecision.setAutoClose(true);
        futureDecision.setEndsAt(LocalDateTime.now().plusDays(2));
        decisionRepository.save(futureDecision);

        // Expired decision with autoClose = false
        Decision manualDecision = new Decision();
        manualDecision.setTitle("Manual Decision");
        manualDecision.setOwner(owner);
        manualDecision.setStatus("OPEN");
        manualDecision.setAutoClose(false);
        manualDecision.setEndsAt(LocalDateTime.now().minusHours(1));
        decisionRepository.save(manualDecision);

        scheduler.autoCloseExpiredDecisions();

        Decision updatedFuture = decisionRepository.findById(futureDecision.getId()).orElseThrow();
        assertEquals("OPEN", updatedFuture.getStatus());

        Decision updatedManual = decisionRepository.findById(manualDecision.getId()).orElseThrow();
        assertEquals("OPEN", updatedManual.getStatus());
    }
}
