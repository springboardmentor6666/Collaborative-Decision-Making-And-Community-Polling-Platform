package com.decisionhub.service.impl;

import com.decisionhub.common.enums.CommunityVisibility;
import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.common.enums.RoleType;
import com.decisionhub.dto.request.CommunityRequest;
import com.decisionhub.dto.response.CommunityMemberResponse;
import com.decisionhub.dto.response.CommunityResponse;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.exception.DuplicateException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.mapper.CommunityMapper;
import com.decisionhub.mapper.UserMapper;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommunityServiceImplTest {

    @Mock
    private CommunityRepository communityRepository;
    @Mock
    private CommunityMemberRepository communityMemberRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommunityMapper communityMapper;
    @Mock
    private UserMapper userMapper;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommunityServiceImpl communityService;

    private User owner;
    private User regularUser;
    private Community community;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .userId(1L)
                .username("owner")
                .fullName("Owner User")
                .role(Role.builder().roleName(RoleType.ROLE_USER).build())
                .build();

        regularUser = User.builder()
                .userId(2L)
                .username("member")
                .fullName("Member User")
                .role(Role.builder().roleName(RoleType.ROLE_USER).build())
                .build();

        community = Community.builder()
                .communityId(10L)
                .name("Tech Enthusiasts")
                .description("A community for engineers")
                .visibility(CommunityVisibility.PUBLIC)
                .owner(owner)
                .build();
    }

    @Test
    @DisplayName("createCommunity - Creates community and auto-joins owner")
    void createCommunity_Success() {
        CommunityRequest request = new CommunityRequest();
        request.setName("Tech Enthusiasts");
        request.setDescription("A community for engineers");
        request.setVisibility(CommunityVisibility.PUBLIC);

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(communityMapper.toEntity(request)).thenReturn(community);
        when(communityRepository.save(any(Community.class))).thenReturn(community);
        when(communityMapper.toResponse(community)).thenReturn(CommunityResponse.builder().communityId(10L).name("Tech Enthusiasts").build());

        CommunityResponse response = communityService.createCommunity(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getMemberCount()).isEqualTo(1);
        verify(communityMemberRepository, times(1)).save(any(CommunityMember.class));
    }

    @Test
    @DisplayName("joinCommunity - Public community sets ACTIVE status")
    void joinCommunity_Public_Success() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(community));
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));
        when(communityMemberRepository.existsByCommunityCommunityIdAndUserUserId(10L, 2L)).thenReturn(false);
        when(communityMemberRepository.countAllByCommunityIdAndUserId(10L, 2L)).thenReturn(0L);

        CommunityMember newMember = CommunityMember.builder()
                .memberId(100L)
                .community(community)
                .user(regularUser)
                .memberRole(MemberRole.MEMBER)
                .status(MemberStatus.ACTIVE)
                .build();
        when(communityMemberRepository.save(any(CommunityMember.class))).thenReturn(newMember);

        CommunityMemberResponse response = communityService.joinCommunity(10L, 2L);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(MemberStatus.ACTIVE);
    }

    @Test
    @DisplayName("joinCommunity - Throws DuplicateException if already a member")
    void joinCommunity_Duplicate_ThrowsException() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(community));
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));
        when(communityMemberRepository.existsByCommunityCommunityIdAndUserUserId(10L, 2L)).thenReturn(true);

        assertThatThrownBy(() -> communityService.joinCommunity(10L, 2L))
                .isInstanceOf(DuplicateException.class)
                .hasMessageContaining("already a member");
    }

    @Test
    @DisplayName("deleteCommunity - Non-owner non-admin throws ForbiddenException")
    void deleteCommunity_Unauthorized_ThrowsForbidden() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(community));
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> communityService.deleteCommunity(10L, 2L))
                .isInstanceOf(ForbiddenException.class);
    }
}
