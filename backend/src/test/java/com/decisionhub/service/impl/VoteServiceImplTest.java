package com.decisionhub.service.impl;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.dto.request.VoteRequest;
import com.decisionhub.dto.response.VoteResponse;
import com.decisionhub.dto.response.VoteResultResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.entity.Vote;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.exception.DuplicateException;
import com.decisionhub.mapper.OptionMapper;
import com.decisionhub.mapper.UserMapper;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.repository.VoteSelectionRepository;
import com.decisionhub.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoteServiceImplTest {

    @Mock
    private VoteRepository voteRepository;
    @Mock
    private DecisionRepository decisionRepository;
    @Mock
    private OptionRepository optionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private VoteSelectionRepository voteSelectionRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private OptionMapper optionMapper;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private VoteServiceImpl voteService;

    private User voter;
    private Decision decision;
    private Option option1;
    private Option option2;

    @BeforeEach
    void setUp() {
        voter = User.builder()
                .userId(10L)
                .username("voter1")
                .fullName("Voter One")
                .role(Role.builder().roleName(com.decisionhub.common.enums.RoleType.ROLE_USER).build())
                .build();

        option1 = Option.builder().optionId(101L).title("Option 1").totalScore(BigDecimal.ZERO).build();
        option2 = Option.builder().optionId(102L).title("Option 2").totalScore(BigDecimal.ZERO).build();

        decision = Decision.builder()
                .decisionId(50L)
                .title("Test Poll")
                .status(DecisionStatus.ACTIVE)
                .voteType(VoteType.SINGLE)
                .visibility(DecisionVisibility.PUBLIC)
                .createdBy(User.builder().userId(1L).fullName("Creator").build())
                .options(List.of(option1, option2))
                .build();

        option1.setDecision(decision);
        option2.setDecision(decision);
    }

    @Test
    @DisplayName("castVote - Success for single choice")
    void castVote_SingleChoice_Success() {
        VoteRequest.SelectionDto selection = new VoteRequest.SelectionDto();
        selection.setOptionId(101L);

        VoteRequest request = new VoteRequest();
        request.setDecisionId(50L);
        request.setSelections(List.of(selection));

        when(userRepository.findById(10L)).thenReturn(Optional.of(voter));
        when(decisionRepository.findById(50L)).thenReturn(Optional.of(decision));
        when(voteRepository.existsByUserUserIdAndDecisionDecisionId(10L, 50L)).thenReturn(false);
        when(optionRepository.findById(101L)).thenReturn(Optional.of(option1));
        when(voteRepository.save(any(Vote.class))).thenAnswer(invocation -> {
            Vote v = invocation.getArgument(0);
            v.setVoteId(500L);
            return v;
        });

        VoteResponse response = voteService.castVote(10L, request);

        assertThat(response).isNotNull();
        assertThat(response.getVoteId()).isEqualTo(500L);
        verify(optionRepository, times(1)).updateOptionScore(101L, BigDecimal.ONE);
        verify(notificationService, times(1)).sendNotification(eq(1L), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("castVote - Prevents duplicate vote by the same user")
    void castVote_DuplicateVote_ThrowsDuplicateException() {
        VoteRequest.SelectionDto selection = new VoteRequest.SelectionDto();
        selection.setOptionId(101L);

        VoteRequest request = new VoteRequest();
        request.setDecisionId(50L);
        request.setSelections(List.of(selection));

        when(userRepository.findById(10L)).thenReturn(Optional.of(voter));
        when(decisionRepository.findById(50L)).thenReturn(Optional.of(decision));
        when(voteRepository.existsByUserUserIdAndDecisionDecisionId(10L, 50L)).thenReturn(true);

        assertThatThrownBy(() -> voteService.castVote(10L, request))
                .isInstanceOf(DuplicateException.class)
                .hasMessageContaining("already cast a vote");
    }

    @Test
    @DisplayName("getVoteResults - Computes vote counts and percentages")
    void getVoteResults_Success() {
        when(decisionRepository.findById(50L)).thenReturn(Optional.of(decision));
        when(optionRepository.findByDecisionDecisionId(50L)).thenReturn(List.of(option1, option2));
        when(voteRepository.countByDecisionDecisionId(50L)).thenReturn(10L);
        when(voteSelectionRepository.countByOptionOptionId(101L)).thenReturn(7L);
        when(voteSelectionRepository.countByOptionOptionId(102L)).thenReturn(3L);

        VoteResultResponse results = voteService.getVoteResults(50L);

        assertThat(results).isNotNull();
        assertThat(results.getTotalVotesCount()).isEqualTo(10L);
        assertThat(results.getOptionVoteCounts().get(101L)).isEqualTo(7L);
        assertThat(results.getOptionVoteCounts().get(102L)).isEqualTo(3L);
        assertThat(results.getOptionPercentages().get(101L)).isEqualTo(new BigDecimal("70.00"));
        assertThat(results.getOptionPercentages().get(102L)).isEqualTo(new BigDecimal("30.00"));
    }
}
