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

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class VoteServiceMultiTest {

    @Autowired
    private VoteService voteService;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private PollOptionRepository pollOptionRepository;

    @Autowired
    private DecisionOptionRepository decisionOptionRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User voter1;
    private User voter2;
    private Category categoryTech;
    private Decision decision;
    
    private Poll multiPoll;
    private PollOption po1;
    private PollOption po2;

    private Poll singlePoll;
    private PollOption singlePo1;
    private PollOption singlePo2;

    private Poll ratingPoll;
    private PollOption ratingPo1;

    @BeforeEach
    void setUp() {
        voteService.resetRateLimit(null);
        voteRepository.deleteAll();
        pollOptionRepository.deleteAll();
        pollRepository.deleteAll();
        decisionOptionRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();
        categoryRepository.flush();

        categoryTech = new Category();
        categoryTech.setName("Technology");
        categoryRepository.save(categoryTech);

        voter1 = new User();
        voter1.setEmail("v1@example.com");
        voter1.setPasswordHash("pass");
        voter1.setFullName("Voter One");
        userRepository.save(voter1);

        voter2 = new User();
        voter2.setEmail("v2@example.com");
        voter2.setPasswordHash("pass");
        voter2.setFullName("Voter Two");
        userRepository.save(voter2);

        decision = new Decision();
        decision.setTitle("Evaluation");
        decision.setOwner(voter1);
        decision.setCategory(categoryTech);
        decision.setStatus("OPEN");
        decisionRepository.save(decision);

        DecisionOption optionA = new DecisionOption();
        optionA.setDecision(decision);
        optionA.setLabel("Option A");
        decisionOptionRepository.save(optionA);

        DecisionOption optionB = new DecisionOption();
        optionB.setDecision(decision);
        optionB.setLabel("Option B");
        decisionOptionRepository.save(optionB);

        // Setup MULTI Poll
        multiPoll = new Poll();
        multiPoll.setDecision(decision);
        multiPoll.setPollType("MULTI");
        pollRepository.save(multiPoll);

        po1 = new PollOption();
        po1.setPoll(multiPoll);
        po1.setOption(optionA);
        pollOptionRepository.save(po1);

        po2 = new PollOption();
        po2.setPoll(multiPoll);
        po2.setOption(optionB);
        pollOptionRepository.save(po2);

        // Setup SINGLE Poll
        singlePoll = new Poll();
        singlePoll.setDecision(decision);
        singlePoll.setPollType("SINGLE");
        pollRepository.save(singlePoll);

        singlePo1 = new PollOption();
        singlePo1.setPoll(singlePoll);
        singlePo1.setOption(optionA);
        pollOptionRepository.save(singlePo1);

        singlePo2 = new PollOption();
        singlePo2.setPoll(singlePoll);
        singlePo2.setOption(optionB);
        pollOptionRepository.save(singlePo2);

        // Setup RATING Poll
        ratingPoll = new Poll();
        ratingPoll.setDecision(decision);
        ratingPoll.setPollType("RATING");
        pollRepository.save(ratingPoll);

        ratingPo1 = new PollOption();
        ratingPo1.setPoll(ratingPoll);
        ratingPo1.setOption(optionA);
        pollOptionRepository.save(ratingPo1);
    }

    @Test
    void multiChoicePoll_AllowsMultipleOptionSelectionsPerUser_EnforcesOncePerOption() {
        // voter1 votes for po1
        VoteRequest req1 = new VoteRequest(multiPoll.getId(), po1.getId(), null);
        assertNotNull(voteService.castVote(req1, voter1.getEmail()));

        // voter1 votes for po2 (succeeds because MULTI poll allows multiple option selections per user)
        VoteRequest req2 = new VoteRequest(multiPoll.getId(), po2.getId(), null);
        assertNotNull(voteService.castVote(req2, voter1.getEmail()));

        // voter1 votes for po1 again (fails because they cannot vote for the same option twice)
        assertThrows(DuplicateVoteException.class, () ->
                voteService.castVote(req1, voter1.getEmail()));
    }

    @Test
    void singleChoicePoll_EnforcesOnlyOneVotePerUser() {
        VoteRequest req1 = new VoteRequest(singlePoll.getId(), singlePo1.getId(), null);
        assertNotNull(voteService.castVote(req1, voter1.getEmail()));

        // voter1 tries to vote on another option singlePo2 (fails)
        VoteRequest req2 = new VoteRequest(singlePoll.getId(), singlePo2.getId(), null);
        assertThrows(DuplicateVoteException.class, () ->
                voteService.castVote(req2, voter1.getEmail()));
    }

    @Test
    void ratingPoll_ValidatesRatingBounds() {
        // Vote rating 6 (fails)
        VoteRequest reqInvalid1 = new VoteRequest(ratingPoll.getId(), ratingPo1.getId(), 6);
        assertThrows(IllegalArgumentException.class, () ->
                voteService.castVote(reqInvalid1, voter1.getEmail()));

        // Vote rating 0 (fails)
        VoteRequest reqInvalid2 = new VoteRequest(ratingPoll.getId(), ratingPo1.getId(), 0);
        assertThrows(IllegalArgumentException.class, () ->
                voteService.castVote(reqInvalid2, voter1.getEmail()));

        // Vote rating 4 (succeeds)
        VoteRequest reqValid = new VoteRequest(ratingPoll.getId(), ratingPo1.getId(), 4);
        assertNotNull(voteService.castVote(reqValid, voter1.getEmail()));
    }

    @Test
    void getVoteResults_HandlesTiesAndPercentageBreakdown() {
        // voter1 votes for Option A
        voteService.castVote(new VoteRequest(multiPoll.getId(), po1.getId(), null), voter1.getEmail());
        // voter2 votes for Option B (creates a tie: 1 vote each)
        voteService.castVote(new VoteRequest(multiPoll.getId(), po2.getId(), null), voter2.getEmail());

        VoteResultResponse result = voteService.getVoteResults(multiPoll.getId());
        assertEquals(2, result.getTotalVotes());
        // Check tie handling: winningOption should list both winners joined by comma
        assertTrue(result.getWinningOption().contains("Option A"));
        assertTrue(result.getWinningOption().contains("Option B"));
        assertEquals(1, result.getWinningVoteCount());

        // Check percentage breakdown (1 vote out of 2 = 50.0%)
        for (OptionDto dto : result.getOptions()) {
            assertEquals(50.0, dto.getPercentage());
        }
    }

    @Test
    void getRatingSummary_ComputesAveragesAndCounts() {
        // voter1 rates 4
        voteService.castVote(new VoteRequest(ratingPoll.getId(), ratingPo1.getId(), 4), voter1.getEmail());
        // voter2 rates 5
        voteService.castVote(new VoteRequest(ratingPoll.getId(), ratingPo1.getId(), 5), voter2.getEmail());

        PollRatingSummaryResponse summary = voteService.getRatingSummary(ratingPoll.getId());
        assertEquals(2, summary.getTotalVotes());
        assertEquals(4.5, summary.getOverallAverage());
        assertEquals(1, summary.getOptionRatings().size());
        assertEquals(4.5, summary.getOptionRatings().get(0).getAverageRating());
        assertEquals(2, summary.getOptionRatings().get(0).getVoteCount());
    }
}
