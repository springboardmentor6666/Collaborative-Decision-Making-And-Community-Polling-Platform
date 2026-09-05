package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.exception.DuplicateVoteException;
import com.decisionhub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class RankedChoiceVotingTest {

    @Autowired
    private VoteService voteService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private DecisionOptionRepository decisionOptionRepository;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private PollOptionRepository pollOptionRepository;

    @Autowired
    private VoteRepository voteRepository;

    private User user1;
    private User user2;
    private User user3;
    private User user4;
    private User user5;

    private Decision decision;
    private DecisionOption optionA;
    private DecisionOption optionB;
    private DecisionOption optionC;

    private Poll rankedPoll;
    private PollOption poA;
    private PollOption poB;
    private PollOption poC;

    @BeforeEach
    void setUp() {
        voteService.resetRateLimit(null);
        voteRepository.deleteAll();
        pollOptionRepository.deleteAll();
        pollRepository.deleteAll();
        decisionOptionRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();

        user1 = createUser("u1@test.com", "User 1");
        user2 = createUser("u2@test.com", "User 2");
        user3 = createUser("u3@test.com", "User 3");
        user4 = createUser("u4@test.com", "User 4");
        user5 = createUser("u5@test.com", "User 5");

        decision = new Decision();
        decision.setTitle("Framework Selection");
        decision.setOwner(user1);
        decision.setStatus("OPEN");
        decisionRepository.save(decision);

        optionA = new DecisionOption();
        optionA.setDecision(decision);
        optionA.setLabel("React");
        decisionOptionRepository.save(optionA);

        optionB = new DecisionOption();
        optionB.setDecision(decision);
        optionB.setLabel("Vue");
        decisionOptionRepository.save(optionB);

        optionC = new DecisionOption();
        optionC.setDecision(decision);
        optionC.setLabel("Svelte");
        decisionOptionRepository.save(optionC);

        rankedPoll = new Poll();
        rankedPoll.setDecision(decision);
        rankedPoll.setPollType("RANKED_CHOICE");
        rankedPoll.setVotingMethod("RANKED_CHOICE");
        rankedPoll.setAllowRevoting(false);
        pollRepository.save(rankedPoll);

        poA = createPollOption(rankedPoll, optionA);
        poB = createPollOption(rankedPoll, optionB);
        poC = createPollOption(rankedPoll, optionC);
    }

    private User createUser(String email, String name) {
        User u = new User();
        u.setEmail(email);
        u.setFullName(name);
        u.setPasswordHash("hash");
        return userRepository.save(u);
    }

    private PollOption createPollOption(Poll poll, DecisionOption opt) {
        PollOption po = new PollOption();
        po.setPoll(poll);
        po.setOption(opt);
        return pollOptionRepository.save(po);
    }

    @Test
    void rankedChoice_SingleRoundMajorityWinner() {
        // User 1 votes: A -> B -> C
        VoteRequest req1 = new VoteRequest();
        req1.setPollId(rankedPoll.getId());
        req1.setRankedOptionIds(Arrays.asList(poA.getId(), poB.getId(), poC.getId()));
        voteService.castVote(req1, user1.getEmail());

        // User 2 votes: A -> C -> B
        VoteRequest req2 = new VoteRequest();
        req2.setPollId(rankedPoll.getId());
        req2.setRankedOptionIds(Arrays.asList(poA.getId(), poC.getId(), poB.getId()));
        voteService.castVote(req2, user2.getEmail());

        // User 3 votes: B -> A -> C
        VoteRequest req3 = new VoteRequest();
        req3.setPollId(rankedPoll.getId());
        req3.setRankedOptionIds(Arrays.asList(poB.getId(), poA.getId(), poC.getId()));
        voteService.castVote(req3, user3.getEmail());

        VoteResultResponse results = voteService.getVoteResults(rankedPoll.getId());
        assertEquals("React", results.getWinningOption());
        assertEquals(optionA.getId(), results.getWinningOptionId());
        assertEquals(1, results.getRoundsBreakdown().size());
        assertTrue(results.getRoundsBreakdown().get(0).isWinnerFound());
    }

    @Test
    void rankedChoice_MultiRoundInstantRunoffVoting_WithEliminationAndRedistribution() {
        // 5 voters:
        // u1: A -> B -> C
        // u2: A -> C -> B
        // u3: B -> C -> A
        // u4: B -> A -> C
        // u5: C -> A -> B
        // Round 1: A=2 (40%), B=2 (40%), C=1 (20%) -> C eliminated. C's 2nd choice is A.
        // Round 2: A=3 (60%), B=2 (40%) -> A reaches > 50% majority and wins!

        VoteRequest req1 = new VoteRequest();
        req1.setPollId(rankedPoll.getId());
        req1.setRankedOptionIds(Arrays.asList(poA.getId(), poB.getId(), poC.getId()));
        voteService.castVote(req1, user1.getEmail());

        VoteRequest req2 = new VoteRequest();
        req2.setPollId(rankedPoll.getId());
        req2.setRankedOptionIds(Arrays.asList(poA.getId(), poC.getId(), poB.getId()));
        voteService.castVote(req2, user2.getEmail());

        VoteRequest req3 = new VoteRequest();
        req3.setPollId(rankedPoll.getId());
        req3.setRankedOptionIds(Arrays.asList(poB.getId(), poC.getId(), poA.getId()));
        voteService.castVote(req3, user3.getEmail());

        VoteRequest req4 = new VoteRequest();
        req4.setPollId(rankedPoll.getId());
        req4.setRankedOptionIds(Arrays.asList(poB.getId(), poA.getId(), poC.getId()));
        voteService.castVote(req4, user4.getEmail());

        VoteRequest req5 = new VoteRequest();
        req5.setPollId(rankedPoll.getId());
        req5.setRankedOptionIds(Arrays.asList(poC.getId(), poA.getId(), poB.getId()));
        voteService.castVote(req5, user5.getEmail());

        VoteResultResponse results = voteService.getVoteResults(rankedPoll.getId());
        assertEquals("React", results.getWinningOption());
        assertEquals(optionA.getId(), results.getWinningOptionId());

        List<RankingRoundDto> rounds = results.getRoundsBreakdown();
        assertEquals(2, rounds.size());

        // Round 1: C eliminated
        assertEquals(1, rounds.get(0).getRoundNumber());
        assertFalse(rounds.get(0).isWinnerFound());
        assertEquals(optionC.getId(), rounds.get(0).getEliminatedOptionId());
        assertEquals("Svelte", rounds.get(0).getEliminatedOptionLabel());

        // Round 2: A wins
        assertEquals(2, rounds.get(1).getRoundNumber());
        assertTrue(rounds.get(1).isWinnerFound());
        assertEquals(optionA.getId(), rounds.get(1).getWinnerOptionId());
    }

    @Test
    void approvalVoting_AllowsMultipleChoicesUpToMax() {
        Poll approvalPoll = new Poll();
        approvalPoll.setDecision(decision);
        approvalPoll.setPollType("APPROVAL");
        approvalPoll.setVotingMethod("APPROVAL");
        approvalPoll.setMaxChoices(2);
        approvalPoll.setAllowRevoting(false);
        pollRepository.save(approvalPoll);

        PollOption appPoA = createPollOption(approvalPoll, optionA);
        PollOption appPoB = createPollOption(approvalPoll, optionB);
        PollOption appPoC = createPollOption(approvalPoll, optionC);

        // Valid: 2 choices
        VoteRequest reqValid = new VoteRequest();
        reqValid.setPollId(approvalPoll.getId());
        reqValid.setOptionIds(Arrays.asList(appPoA.getId(), appPoB.getId()));
        assertNotNull(voteService.castVote(reqValid, user1.getEmail()));

        // Invalid: 3 choices exceeding maxChoices (2)
        VoteRequest reqInvalid = new VoteRequest();
        reqInvalid.setPollId(approvalPoll.getId());
        reqInvalid.setOptionIds(Arrays.asList(appPoA.getId(), appPoB.getId(), appPoC.getId()));
        assertThrows(IllegalArgumentException.class, () ->
                voteService.castVote(reqInvalid, user2.getEmail()));
    }

    @Test
    void revoting_PurgesPreviousVotesWhenAllowed() {
        rankedPoll.setAllowRevoting(true);
        pollRepository.save(rankedPoll);

        // User 1 votes A -> B
        VoteRequest req1 = new VoteRequest();
        req1.setPollId(rankedPoll.getId());
        req1.setRankedOptionIds(Arrays.asList(poA.getId(), poB.getId()));
        voteService.castVote(req1, user1.getEmail());

        assertEquals(2, voteRepository.findByPollIdAndVoterId(rankedPoll.getId(), user1.getId()).size());

        // User 1 revotes: B -> C -> A
        VoteRequest req2 = new VoteRequest();
        req2.setPollId(rankedPoll.getId());
        req2.setRankedOptionIds(Arrays.asList(poB.getId(), poC.getId(), poA.getId()));
        voteService.castVote(req2, user1.getEmail());

        List<Vote> updatedVotes = voteRepository.findByPollIdAndVoterId(rankedPoll.getId(), user1.getId());
        assertEquals(3, updatedVotes.size());
        assertEquals(poB.getId(), updatedVotes.get(0).getPollOption().getId());
    }

    @Test
    void rateLimiting_ThrowsExceptionAfterFiveVotesPerMinute() {
        voteService.resetRateLimit(user1.getEmail());

        Poll singlePoll = new Poll();
        singlePoll.setDecision(decision);
        singlePoll.setPollType("SINGLE");
        singlePoll.setVotingMethod("SINGLE_CHOICE");
        singlePoll.setAllowRevoting(true);
        pollRepository.save(singlePoll);
        PollOption sPo = createPollOption(singlePoll, optionA);

        VoteRequest req = new VoteRequest(singlePoll.getId(), sPo.getId(), null);

        // First 5 votes succeed
        for (int i = 0; i < 5; i++) {
            assertNotNull(voteService.castVote(req, user1.getEmail()));
        }

        // 6th vote within 1 minute fails due to rate limiter
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                voteService.castVote(req, user1.getEmail()));
        assertTrue(ex.getMessage().contains("Rate limit exceeded"));
    }
}
