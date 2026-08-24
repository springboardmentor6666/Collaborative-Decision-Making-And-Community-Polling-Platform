package com.decisionhub.service;

import com.decisionhub.dto.CommunityInviteRequest;
import com.decisionhub.dto.CommunityInviteResponse;
import com.decisionhub.dto.InviteResponseRequest;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.User;
import com.decisionhub.repository.CommunityInviteRepository;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class CommunityInviteServiceTest {

    @Autowired
    private CommunityService communityService;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private CommunityMemberRepository communityMemberRepository;

    @Autowired
    private CommunityInviteRepository communityInviteRepository;

    @Autowired
    private UserRepository userRepository;

    private User owner;
    private User invitee;
    private User stranger;
    private Community community;

    @BeforeEach
    void setUp() {
        communityInviteRepository.deleteAll();
        communityMemberRepository.deleteAll();
        communityRepository.deleteAll();
        userRepository.deleteAll();

        owner = new User();
        owner.setEmail("owner@example.com");
        owner.setPasswordHash("pass");
        owner.setFullName("Owner");
        owner.setRole("USER");
        userRepository.save(owner);

        invitee = new User();
        invitee.setEmail("invitee@example.com");
        invitee.setPasswordHash("pass");
        invitee.setFullName("Invitee");
        invitee.setRole("USER");
        userRepository.save(invitee);

        stranger = new User();
        stranger.setEmail("stranger@example.com");
        stranger.setPasswordHash("pass");
        stranger.setFullName("Stranger");
        stranger.setRole("USER");
        userRepository.save(stranger);

        community = new Community();
        community.setName("Private Group");
        community.setVisibility("PRIVATE");
        community.setCreatedBy(owner);
        communityRepository.save(community);

        CommunityMember ownerMember = new CommunityMember();
        ownerMember.setCommunity(community);
        ownerMember.setUser(owner);
        ownerMember.setRole("OWNER");
        communityMemberRepository.save(ownerMember);
    }

    @Test
    void inviteUser_ByOwner_Success() {
        CommunityInviteRequest request = new CommunityInviteRequest(invitee.getEmail());
        CommunityInviteResponse response = communityService.inviteUserToCommunity(community.getId(), request, owner.getEmail());

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        assertEquals(invitee.getEmail(), response.getInvitee().getEmail());
    }

    @Test
    void inviteUser_ByStranger_ThrowsAccessDenied() {
        CommunityInviteRequest request = new CommunityInviteRequest(invitee.getEmail());
        assertThrows(AccessDeniedException.class, () ->
                communityService.inviteUserToCommunity(community.getId(), request, stranger.getEmail()));
    }

    @Test
    void respondToInvite_Accept_Success() {
        CommunityInviteRequest request = new CommunityInviteRequest(invitee.getEmail());
        CommunityInviteResponse inviteResp = communityService.inviteUserToCommunity(community.getId(), request, owner.getEmail());

        InviteResponseRequest respondReq = new InviteResponseRequest("ACCEPT");
        communityService.respondToInvite(inviteResp.getId(), respondReq, invitee.getEmail());

        // Verify member was added
        assertTrue(communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), invitee.getId()));
    }

    @Test
    void getPendingInvites_Success() {
        CommunityInviteRequest request = new CommunityInviteRequest(invitee.getEmail());
        communityService.inviteUserToCommunity(community.getId(), request, owner.getEmail());

        List<CommunityInviteResponse> list = communityService.getPendingInvites(invitee.getEmail());
        assertEquals(1, list.size());
    }
}
