package com.decisionhub.service.impl;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.common.enums.NotificationType;
import com.decisionhub.dto.request.DecisionRequest;
import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.entity.UserPreference;
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
    @Mock
    private com.decisionhub.repository.AttachmentRepository attachmentRepository;
    @Mock
    private com.decisionhub.mapper.AttachmentMapper attachmentMapper;
    @Mock
    private com.decisionhub.service.AuditLogService auditLogService;
    @Mock
    private com.decisionhub.service.NotificationService notificationService;
    @Mock
    private com.decisionhub.repository.UserPreferenceRepository userPreferenceRepository;
    @Mock
    private com.decisionhub.repository.DecisionHikeRepository decisionHikeRepository;
    @Mock
    private com.decisionhub.repository.DecisionViewRepository decisionViewRepository;

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
        when(userRepository.getReferenceById(2L)).thenReturn(testUser);

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

    @Test
    @DisplayName("createDecision - In community notifies active members except creator")
    void createDecision_InCommunity_NotifiesActiveMembers() {
        validRequest.setCommunityId(10L);
        Community community = Community.builder().communityId(10L).name("Tech Club").build();
        User memberUser = User.builder().userId(2L).username("member2").fullName("Member Two").build();
        CommunityMember member = CommunityMember.builder().memberId(1L).community(community).user(memberUser).status(MemberStatus.ACTIVE).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(communityRepository.findById(10L)).thenReturn(Optional.of(community));
        when(communityMemberRepository.existsByCommunityCommunityIdAndUserUserIdAndStatus(10L, 1L, MemberStatus.ACTIVE)).thenReturn(true);
        when(decisionMapper.toEntity(validRequest)).thenReturn(testDecision);
        when(decisionRepository.save(any(Decision.class))).thenReturn(testDecision);
        when(communityMemberRepository.findByCommunityCommunityIdAndStatus(10L, MemberStatus.ACTIVE)).thenReturn(List.of(member));
        when(userPreferenceRepository.findByUserUserId(2L)).thenReturn(Optional.empty());

        DecisionResponse mappedResponse = DecisionResponse.builder()
                .decisionId(100L)
                .title(testDecision.getTitle())
                .build();
        when(decisionMapper.toResponse(testDecision)).thenReturn(mappedResponse);
        when(voteRepository.countByDecisionDecisionId(100L)).thenReturn(0L);

        DecisionResponse response = decisionService.createDecision(1L, validRequest);

        assertThat(response).isNotNull();
        verify(notificationService, times(1)).sendNotification(
                eq(2L),
                eq("New Decision in Tech Club"),
                contains("posted a new decision"),
                eq(NotificationType.COMMUNITY_DECISION)
        );
    }

    @Test
    @DisplayName("toggleHike should hike decision when not currently hiked")
    void toggleHike_whenNotHiked_shouldHike() {
        testDecision.setLikeCount(5);
        when(decisionRepository.findById(100L)).thenReturn(Optional.of(testDecision));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(decisionHikeRepository.existsByUserUserIdAndDecisionDecisionId(1L, 100L)).thenReturn(false);
        when(decisionHikeRepository.countByDecisionDecisionId(100L)).thenReturn(6L);

        com.decisionhub.dto.response.HikeResponse response = decisionService.toggleHike(100L, 1L);

        assertThat(response.isHiked()).isTrue();
        assertThat(response.getHikeCount()).isEqualTo(6);
        verify(decisionHikeRepository).saveAndFlush(any(com.decisionhub.entity.DecisionHike.class));
        verify(decisionRepository).incrementLikeCount(100L);
        // Author hiking their own decision does not send notification
        verify(notificationService, never()).sendNotification(any(), any(), any(), any());
    }

    @Test
    @DisplayName("toggleHike should send notification when hiked by another user")
    void toggleHike_whenHikedByDifferentUser_shouldSendNotification() {
        testDecision.setLikeCount(5);
        User differentUser = User.builder()
                .userId(2L)
                .username("hikergirl")
                .fullName("Hiker Girl")
                .build();

        when(decisionRepository.findById(100L)).thenReturn(Optional.of(testDecision));
        when(userRepository.findById(2L)).thenReturn(Optional.of(differentUser));
        when(decisionHikeRepository.existsByUserUserIdAndDecisionDecisionId(2L, 100L)).thenReturn(false);
        when(decisionHikeRepository.countByDecisionDecisionId(100L)).thenReturn(6L);

        com.decisionhub.dto.response.HikeResponse response = decisionService.toggleHike(100L, 2L);

        assertThat(response.isHiked()).isTrue();
        assertThat(response.getHikeCount()).isEqualTo(6);
        verify(decisionHikeRepository).saveAndFlush(any(com.decisionhub.entity.DecisionHike.class));
        verify(decisionRepository).incrementLikeCount(100L);
        verify(notificationService, times(1)).sendNotification(
                eq(1L),
                eq("New Hike on " + testDecision.getTitle()),
                eq("Hiker Girl hiked your decision."),
                eq(NotificationType.HIKE)
        );
    }

    @Test
    @DisplayName("toggleHike should NOT send notification if author disabled hike notifications")
    void toggleHike_whenAuthorDisabledHikeNotifications_shouldNotSendNotification() {
        testDecision.setLikeCount(5);
        User differentUser = User.builder()
                .userId(2L)
                .username("hikergirl")
                .fullName("Hiker Girl")
                .build();

        UserPreference preference = UserPreference.builder()
                .notifyHikes(false)
                .build();

        when(decisionRepository.findById(100L)).thenReturn(Optional.of(testDecision));
        when(userRepository.findById(2L)).thenReturn(Optional.of(differentUser));
        when(decisionHikeRepository.existsByUserUserIdAndDecisionDecisionId(2L, 100L)).thenReturn(false);
        when(decisionHikeRepository.countByDecisionDecisionId(100L)).thenReturn(6L);
        when(userPreferenceRepository.findByUserUserId(1L)).thenReturn(Optional.of(preference));

        com.decisionhub.dto.response.HikeResponse response = decisionService.toggleHike(100L, 2L);

        assertThat(response.isHiked()).isTrue();
        verify(notificationService, never()).sendNotification(any(), any(), any(), any());
    }

    @Test
    @DisplayName("toggleHike should unhike decision when already hiked")
    void toggleHike_whenAlreadyHiked_shouldUnhike() {
        testDecision.setLikeCount(5);
        when(decisionRepository.findById(100L)).thenReturn(Optional.of(testDecision));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(decisionHikeRepository.existsByUserUserIdAndDecisionDecisionId(1L, 100L)).thenReturn(true);
        when(decisionHikeRepository.countByDecisionDecisionId(100L)).thenReturn(4L);

        com.decisionhub.dto.response.HikeResponse response = decisionService.toggleHike(100L, 1L);

        assertThat(response.isHiked()).isFalse();
        assertThat(response.getHikeCount()).isEqualTo(4);
        verify(decisionHikeRepository, atLeastOnce()).deleteByUserUserIdAndDecisionDecisionId(1L, 100L);
        verify(decisionRepository).decrementLikeCount(100L);
    }

    @Test
    @DisplayName("getDecisionById should increment view count on first visit by user")
    void getDecisionById_firstTimeVisit_incrementsViewCount() {
        testDecision.setViewCount(5);
        when(decisionRepository.findById(100L)).thenReturn(Optional.of(testDecision));
        when(decisionViewRepository.existsByUserUserIdAndDecisionDecisionId(1L, 100L)).thenReturn(false);
        when(userRepository.getReferenceById(1L)).thenReturn(testUser);
        when(decisionMapper.toResponse(testDecision)).thenReturn(DecisionResponse.builder().decisionId(100L).viewCount(5).build());

        DecisionResponse response = decisionService.getDecisionById(100L, 1L);

        assertThat(response.getViewCount()).isEqualTo(6);
        verify(decisionViewRepository).save(any(com.decisionhub.entity.DecisionView.class));
        verify(decisionRepository).incrementViewCount(100L);
    }

    @Test
    @DisplayName("getDecisionById should NOT increment view count on revisit by same user")
    void getDecisionById_revisit_doesNotIncrementViewCount() {
        testDecision.setViewCount(5);
        when(decisionRepository.findById(100L)).thenReturn(Optional.of(testDecision));
        when(decisionViewRepository.existsByUserUserIdAndDecisionDecisionId(1L, 100L)).thenReturn(true);
        when(decisionMapper.toResponse(testDecision)).thenReturn(DecisionResponse.builder().decisionId(100L).viewCount(5).build());

        DecisionResponse response = decisionService.getDecisionById(100L, 1L);

        assertThat(response.getViewCount()).isEqualTo(5);
        verify(decisionViewRepository, never()).save(any());
        verify(decisionRepository, never()).incrementViewCount(any());
    }

    @Test
    @DisplayName("getMostHikedDecisions should return paged most hiked decisions")
    void getMostHikedDecisions_shouldReturnPagedDecisions() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        org.springframework.data.domain.Page<Decision> page = new org.springframework.data.domain.PageImpl<>(List.of(testDecision), pageable, 1);
        when(decisionRepository.findMostHikedDecisions(1L, pageable)).thenReturn(page);
        when(decisionMapper.toResponse(testDecision)).thenReturn(DecisionResponse.builder().decisionId(100L).build());

        com.decisionhub.common.response.PagedResponse<DecisionResponse> response = decisionService.getMostHikedDecisions(1L, pageable);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getDecisionId()).isEqualTo(100L);
        verify(decisionRepository).findMostHikedDecisions(1L, pageable);
    }
}
