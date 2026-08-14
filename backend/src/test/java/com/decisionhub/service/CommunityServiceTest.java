package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.User;
import com.decisionhub.exception.CommunityNotFoundException;
import com.decisionhub.repository.CategoryRepository;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommunityServiceTest {

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private DecisionRepository decisionRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private CommunityService communityService;

    private User owner;
    private User memberUser;
    private Community community;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@example.com");
        owner.setFullName("Owner User");

        memberUser = new User();
        memberUser.setId(2L);
        memberUser.setEmail("member@example.com");
        memberUser.setFullName("Member User");

        community = new Community();
        community.setId(10L);
        community.setName("Tech Group");
        community.setDescription("Technology discussion");
        community.setVisibility("PUBLIC");
        community.setCreatedBy(owner);
    }

    @Test
    void createCommunity_success() {
        CommunityRequest request = new CommunityRequest("Tech Group", "Description", "PUBLIC", null);

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(communityRepository.existsByName("Tech Group")).thenReturn(false);
        when(communityRepository.save(any(Community.class))).thenReturn(community);

        CommunityResponse response = communityService.createCommunity(request, "owner@example.com");

        assertNotNull(response);
        assertEquals("Tech Group", response.getName());
        verify(communityMemberRepository, times(1)).save(any(CommunityMember.class));
    }

    @Test
    void createCommunity_duplicateName_throwsException() {
        CommunityRequest request = new CommunityRequest("Tech Group", "Description", "PUBLIC", null);

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(communityRepository.existsByName("Tech Group")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () ->
                communityService.createCommunity(request, "owner@example.com"));
    }

    @Test
    void joinCommunity_public_success() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(community));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(memberUser));
        when(communityMemberRepository.existsByCommunityIdAndUserId(10L, 2L)).thenReturn(false);

        CommunityResponse response = communityService.joinCommunity(10L, "member@example.com");

        assertNotNull(response);
        verify(communityMemberRepository, times(1)).save(any(CommunityMember.class));
    }

    @Test
    void joinCommunity_duplicateMember_throwsException() {
        when(communityRepository.findById(10L)).thenReturn(Optional.of(community));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(memberUser));
        when(communityMemberRepository.existsByCommunityIdAndUserId(10L, 2L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () ->
                communityService.joinCommunity(10L, "member@example.com"));
    }

    @Test
    void joinCommunity_privateGroup_throwsAccessDenied() {
        community.setVisibility("PRIVATE");
        when(communityRepository.findById(10L)).thenReturn(Optional.of(community));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(memberUser));

        assertThrows(AccessDeniedException.class, () ->
                communityService.joinCommunity(10L, "member@example.com"));
    }

    @Test
    void leaveCommunity_ownerWithOtherMembers_throwsException() {
        CommunityMember ownerMember = new CommunityMember();
        ownerMember.setCommunity(community);
        ownerMember.setUser(owner);
        ownerMember.setRole("OWNER");

        when(communityRepository.findById(10L)).thenReturn(Optional.of(community));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(communityMemberRepository.findByCommunityIdAndUserId(10L, 1L)).thenReturn(Optional.of(ownerMember));
        when(communityMemberRepository.countByCommunityId(10L)).thenReturn(2L);
        when(communityMemberRepository.countByCommunityIdAndRole(10L, "OWNER")).thenReturn(1L);

        assertThrows(IllegalArgumentException.class, () ->
                communityService.leaveCommunity(10L, "owner@example.com"));
    }

    @Test
    void transferOwnership_success() {
        CommunityMember ownerMember = new CommunityMember();
        ownerMember.setCommunity(community);
        ownerMember.setUser(owner);
        ownerMember.setRole("OWNER");

        CommunityMember targetMember = new CommunityMember();
        targetMember.setCommunity(community);
        targetMember.setUser(memberUser);
        targetMember.setRole("MEMBER");

        TransferOwnershipRequest request = new TransferOwnershipRequest(2L);

        when(communityRepository.findById(10L)).thenReturn(Optional.of(community));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(communityMemberRepository.findByCommunityIdAndUserId(10L, 1L)).thenReturn(Optional.of(ownerMember));
        when(communityMemberRepository.findByCommunityIdAndUserId(10L, 2L)).thenReturn(Optional.of(targetMember));
        when(communityRepository.save(any(Community.class))).thenReturn(community);

        CommunityResponse response = communityService.transferOwnership(10L, request, "owner@example.com");

        assertNotNull(response);
        assertEquals("ADMIN", ownerMember.getRole());
        assertEquals("OWNER", targetMember.getRole());
    }

    @Test
    void getCommunityById_notFound_throwsException() {
        when(communityRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CommunityNotFoundException.class, () ->
                communityService.getCommunityById(99L, "owner@example.com"));
    }
}
