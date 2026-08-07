package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DecisionRepository decisionRepository;

    @Mock
    private PollRepository pollRepository;

    @Mock
    private PollOptionRepository pollOptionRepository;

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private DecisionImpressionRepository decisionImpressionRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User testUser;
    private Decision testDecision;
    private Poll testPoll;
    private DecisionOption testDecisionOption1;
    private DecisionOption testDecisionOption2;
    private PollOption testPollOption1;
    private PollOption testPollOption2;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testDecision = new Decision();
        testDecision.setId(10L);
        testDecision.setTitle("Which Laptop to Buy?");
        testDecision.setStatus("OPEN");
        testDecision.setOwner(testUser);

        testPoll = new Poll();
        testPoll.setId(100L);
        testPoll.setDecision(testDecision);

        testDecisionOption1 = new DecisionOption(1L, "MacBook Pro", "M3 Max");
        testDecisionOption2 = new DecisionOption(2L, "Dell XPS 15", "i9");

        testPollOption1 = new PollOption();
        testPollOption1.setId(1001L);
        testPollOption1.setPoll(testPoll);
        testPollOption1.setOption(testDecisionOption1);

        testPollOption2 = new PollOption();
        testPollOption2.setId(1002L);
        testPollOption2.setPoll(testPoll);
        testPollOption2.setOption(testDecisionOption2);
    }

    @Test
    void testGetMyVotesAnalysis_Success() {
        Vote vote = new Vote();
        vote.setId(500L);
        vote.setPoll(testPoll);
        vote.setPollOption(testPollOption1);
        vote.setVoter(testUser);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(voteRepository.findByVoterId(1L)).thenReturn(List.of(vote));
        when(voteRepository.findByPollId(100L)).thenReturn(List.of(vote));
        when(pollOptionRepository.findByPollId(100L)).thenReturn(List.of(testPollOption1, testPollOption2));

        List<MyVoteAnalysisDto> result = analyticsService.getMyVotesAnalysis("test@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        MyVoteAnalysisDto dto = result.get(0);
        assertEquals(10L, dto.getDecisionId());
        assertEquals("Which Laptop to Buy?", dto.getDecisionTitle());
        assertEquals(1L, dto.getTotalVotes());
        assertEquals("MacBook Pro", dto.getUserChoice().getOptionText());
        assertTrue(dto.getIsWinning());
        assertEquals(2, dto.getOptionsBreakdown().size());
    }

    @Test
    void testGetMyVotesAnalysis_UserNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> analyticsService.getMyVotesAnalysis("unknown@example.com"));
    }

    @Test
    void testGetCreatorAnalytics_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(decisionRepository.findByOwnerIdAndIsDeletedFalse(1L)).thenReturn(List.of(testDecision));
        when(decisionImpressionRepository.countByDecision_Owner_IdAndType(1L, "REACH")).thenReturn(100L);
        when(decisionImpressionRepository.countByDecision_Owner_IdAndType(1L, "VIEW")).thenReturn(50L);

        when(decisionImpressionRepository.countByDecisionIdAndType(10L, "REACH")).thenReturn(100L);
        when(decisionImpressionRepository.countByDecisionIdAndType(10L, "VIEW")).thenReturn(50L);

        when(pollRepository.findByDecisionId(10L)).thenReturn(List.of(testPoll));

        Vote vote1 = new Vote();
        vote1.setPollOption(testPollOption1);
        Vote vote2 = new Vote();
        vote2.setPollOption(testPollOption1);

        when(voteRepository.findByPollId(100L)).thenReturn(List.of(vote1, vote2));
        when(pollOptionRepository.findByPollId(100L)).thenReturn(List.of(testPollOption1, testPollOption2));

        CreatorAnalyticsResponse response = analyticsService.getCreatorAnalytics("test@example.com");

        assertNotNull(response);
        assertEquals(1, response.getTotalDecisionsPublished());
        assertEquals(100L, response.getTotalReach());
        assertEquals(50L, response.getTotalViews());
        assertEquals(2L, response.getTotalVotes());
        assertEquals(4.0, response.getOverallConversionRate()); // 2 votes / 50 views * 100 = 4.0%
    }

    @Test
    void testGetCreatorAnalytics_ZeroViewsEdgeCase() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(decisionRepository.findByOwnerIdAndIsDeletedFalse(1L)).thenReturn(List.of(testDecision));
        when(decisionImpressionRepository.countByDecision_Owner_IdAndType(1L, "REACH")).thenReturn(0L);
        when(decisionImpressionRepository.countByDecision_Owner_IdAndType(1L, "VIEW")).thenReturn(0L);

        when(decisionImpressionRepository.countByDecisionIdAndType(10L, "REACH")).thenReturn(0L);
        when(decisionImpressionRepository.countByDecisionIdAndType(10L, "VIEW")).thenReturn(0L);

        when(pollRepository.findByDecisionId(10L)).thenReturn(Collections.emptyList());

        CreatorAnalyticsResponse response = analyticsService.getCreatorAnalytics("test@example.com");

        assertNotNull(response);
        assertEquals(0.0, response.getOverallConversionRate());
        assertEquals(0.0, response.getDecisions().get(0).getConversionRate());
    }

    @Test
    void testRecordImpression_Success() {
        when(decisionRepository.findById(10L)).thenReturn(Optional.of(testDecision));
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        analyticsService.recordImpression(10L, "VIEW", "test@example.com", "127.0.0.1");

        verify(decisionImpressionRepository, times(1)).save(any(DecisionImpression.class));
    }

    @Test
    void testRecordImpression_InvalidType() {
        when(decisionRepository.findById(10L)).thenReturn(Optional.of(testDecision));

        assertThrows(IllegalArgumentException.class, () ->
                analyticsService.recordImpression(10L, "INVALID_TYPE", "test@example.com", "127.0.0.1"));
    }

    @Test
    void testRecordImpression_DecisionNotFound() {
        when(decisionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(DecisionNotFoundException.class, () ->
                analyticsService.recordImpression(999L, "VIEW", "test@example.com", "127.0.0.1"));
    }
}
