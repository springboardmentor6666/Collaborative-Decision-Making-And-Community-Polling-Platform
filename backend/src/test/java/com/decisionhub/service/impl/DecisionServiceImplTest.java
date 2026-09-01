package com.decisionhub.service.impl;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.dto.request.DecisionRequest;
import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.exception.ValidationException;
import com.decisionhub.mapper.DecisionMapper;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DecisionServiceImplTest {

    @Mock
    private DecisionRepository decisionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommunityRepository communityRepository;
    @Mock
    private CommunityMemberRepository communityMemberRepository;
    @Mock
    private VoteRepository voteRepository;
    @Mock
    private com.decisionhub.repository.CommentRepository commentRepository;
    @Mock
    private DecisionMapper decisionMapper;

    @InjectMocks
    private DecisionServiceImpl decisionService;

    private User testUser;
    private Decision testDecision;
    private DecisionRequest validRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .userId(1L)
                .username("testuser")
                .fullName("Test User")
                .role(Role.builder().roleName(com.decisionhub.common.enums.RoleType.ROLE_USER).build())
                .build();

        Option opt1 = Option.builder().optionId(10L).title("Option A").totalScore(BigDecimal.ZERO).build();
        Option opt2 = Option.builder().optionId(20L).title("Option B").totalScore(BigDecimal.ZERO).build();

        testDecision = Decision.builder()
                .decisionId(100L)
                .title("Should we adopt Microservices?")
                .description("Discussion on architecture")
                .voteType(VoteType.SINGLE)
                .visibility(DecisionVisibility.PUBLIC)
                .status(DecisionStatus.ACTIVE)
                .createdBy(testUser)
                .options(new ArrayList<>(List.of(opt1, opt2)))
                .build();

        opt1.setDecision(testDecision);
        opt2.setDecision(testDecision);

        com.decisionhub.dto.request.OptionRequest optDto1 = new com.decisionhub.dto.request.OptionRequest();
        optDto1.setTitle("Option A");
        com.decisionhub.dto.request.OptionRequest optDto2 = new com.decisionhub.dto.request.OptionRequest();
        optDto2.setTitle("Option B");

        validRequest = new DecisionRequest();
        validRequest.setTitle("Should we adopt Microservices?");
        validRequest.setDescription("Discussion on architecture");
        validRequest.setVoteType(VoteType.SINGLE);
        validRequest.setVisibility(DecisionVisibility.PUBLIC);
        validRequest.setOptions(List.of(optDto1, optDto2));
    }

    @Test
    @DisplayName("createDecision - Success with valid 2+ options")
    void createDecision_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(decisionMapper.toEntity(validRequest)).thenReturn(testDecision);
        when(decisionRepository.save(any(Decision.class))).thenReturn(testDecision);

        DecisionResponse mappedResponse = DecisionResponse.builder()
                .decisionId(100L)
                .title(testDecision.getTitle())
                .build();
        when(decisionMapper.toResponse(testDecision)).thenReturn(mappedResponse);
        when(voteRepository.countByDecisionDecisionId(100L)).thenReturn(5L);

        DecisionResponse response = decisionService.createDecision(1L, validRequest);

        assertThat(response).isNotNull();
        assertThat(response.getDecisionId()).isEqualTo(100L);
        assertThat(response.getTotalVotes()).isEqualTo(5L);
        verify(decisionRepository, times(1)).save(any(Decision.class));
    }

    @Test
    @DisplayName("createDecision - Fails when fewer than 2 options provided")
    void createDecision_FewerThanTwoOptions_ThrowsValidationException() {
        DecisionRequest invalidReq = new DecisionRequest();
        invalidReq.setTitle("Single option poll");
        invalidReq.setOptions(List.of(new com.decisionhub.dto.request.OptionRequest()));

        assertThatThrownBy(() -> decisionService.createDecision(1L, invalidReq))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("At least two comparison options are required");
    }

    @Test
    @DisplayName("getDecisionById - Increments view count and returns enriched response")
    void getDecisionById_Public_Success() {
        when(decisionRepository.findById(100L)).thenReturn(Optional.of(testDecision));
        DecisionResponse mappedResponse = DecisionResponse.builder()
                .decisionId(100L)
                .title(testDecision.getTitle())
                .build();
        when(decisionMapper.toResponse(testDecision)).thenReturn(mappedResponse);
        when(voteRepository.countByDecisionDecisionId(100L)).thenReturn(10L);

        DecisionResponse response = decisionService.getDecisionById(100L, 2L);

        assertThat(response).isNotNull();
        assertThat(response.getTotalVotes()).isEqualTo(10L);
        verify(decisionRepository, times(1)).incrementViewCount(100L);
    }

    @Test
    @DisplayName("getDecisionById - Non-existent ID throws EntityNotFoundException")
    void getDecisionById_NotFound_ThrowsException() {
        when(decisionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> decisionService.getDecisionById(999L, 1L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("deleteDecision - Author can delete successfully")
    void deleteDecision_Author_Success() {
        when(decisionRepository.findById(100L)).thenReturn(Optional.of(testDecision));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        decisionService.deleteDecision(100L, 1L);

        verify(decisionRepository, times(1)).delete(testDecision);
    }

    @Test
    @DisplayName("deleteDecision - Non-author non-admin throws ForbiddenException")
    void deleteDecision_UnauthorizedUser_ThrowsForbidden() {
        User otherUser = User.builder()
                .userId(99L)
                .role(Role.builder().roleName(com.decisionhub.common.enums.RoleType.ROLE_USER).build())
                .build();

        when(decisionRepository.findById(100L)).thenReturn(Optional.of(testDecision));
        when(userRepository.findById(99L)).thenReturn(Optional.of(otherUser));

        assertThatThrownBy(() -> decisionService.deleteDecision(100L, 99L))
                .isInstanceOf(ForbiddenException.class);
    }
}
