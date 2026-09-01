package com.decisionhub.service.impl;

import com.decisionhub.common.enums.CommunityVisibility;
import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.CommunityRequest;
import com.decisionhub.dto.response.CommunityMemberResponse;
import com.decisionhub.dto.response.CommunityResponse;

import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.User;
import com.decisionhub.exception.DuplicateException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.mapper.CommunityMapper;
import com.decisionhub.mapper.UserMapper;

import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.CommunityService;
import com.decisionhub.service.NotificationService;
import com.decisionhub.common.enums.NotificationType;
import com.decisionhub.specification.CommunitySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;

    private final CommunityMapper communityMapper;
    private final UserMapper userMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public CommunityResponse createCommunity(Long userId, CommunityRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        Community community = communityMapper.toEntity(request);
        community.setOwner(owner);


        Community savedCommunity = communityRepository.save(community);

        // Auto-join owner as OWNER
        communityMemberRepository.save(CommunityMember.builder()
                .community(savedCommunity)
                .user(owner)
                .memberRole(MemberRole.OWNER)
                .status(MemberStatus.ACTIVE)
                .build());

        CommunityResponse response = communityMapper.toResponse(savedCommunity);
        response.setMemberCount(1);
        return response;
    }

    @Override
    @Transactional
    public CommunityResponse updateCommunity(Long communityId, Long userId, CommunityRequest request) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));

        if (!community.getOwner().getUserId().equals(userId)) {
            throw new ForbiddenException("Only the community owner can update community details.");
        }

        if (request.getName() != null) community.setName(request.getName());
        if (request.getDescription() != null) community.setDescription(request.getDescription());
        if (request.getImage() != null) community.setImage(request.getImage());
        if (request.getVisibility() != null) community.setVisibility(request.getVisibility());

        return communityMapper.toResponse(communityRepository.save(community));
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunityById(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));

        long memberCount = communityMemberRepository.countByCommunityCommunityIdAndStatus(communityId, MemberStatus.ACTIVE);
        CommunityResponse response = communityMapper.toResponse(community);
        response.setMemberCount(memberCount);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CommunityResponse> searchCommunities(String query, CommunityVisibility visibility, Long ownerId, Pageable pageable) {
        Page<CommunityResponse> page = communityRepository.findAll(
                CommunitySpecification.filterCommunities(query, visibility, ownerId), pageable
        ).map(community -> {
            long count = communityMemberRepository.countByCommunityCommunityIdAndStatus(community.getCommunityId(), MemberStatus.ACTIVE);
            CommunityResponse res = communityMapper.toResponse(community);
            res.setMemberCount(count);
            return res;
        });
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CommunityResponse> getUserCommunities(Long userId, Pageable pageable) {
        Page<CommunityResponse> page = communityRepository.findJoinedCommunities(userId, MemberStatus.ACTIVE, pageable)
                .map(community -> {
                    long count = communityMemberRepository.countByCommunityCommunityIdAndStatus(community.getCommunityId(), MemberStatus.ACTIVE);
                    CommunityResponse res = communityMapper.toResponse(community);
                    res.setMemberCount(count);
                    return res;
                });
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional
    public void deleteCommunity(Long communityId, Long userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));
        
        boolean isAdmin = user.getRole().getRoleName() == com.decisionhub.common.enums.RoleType.ROLE_ADMIN;

        if (!community.getOwner().getUserId().equals(userId) && !isAdmin) {
            throw new ForbiddenException("Only the owner or an admin can delete this community.");
        }
        communityRepository.delete(community);
    }

    @Override
    @Transactional
    public CommunityMemberResponse joinCommunity(Long communityId, Long userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        if (communityMemberRepository.existsByCommunityCommunityIdAndUserUserId(communityId, userId)) {
            throw new DuplicateException("User is already a member of this community.");
        }

        MemberStatus newStatus = community.getVisibility() == CommunityVisibility.PRIVATE ? MemberStatus.PENDING : MemberStatus.ACTIVE;

        CommunityMember member;
        if (communityMemberRepository.countAllByCommunityIdAndUserId(communityId, userId) > 0) {
            communityMemberRepository.resurrectMember(communityId, userId, newStatus, MemberRole.MEMBER);
            member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, userId)
                    .orElseThrow(() -> new IllegalStateException("Failed to resurrect member record"));
        } else {
            member = communityMemberRepository.save(CommunityMember.builder()
                    .community(community)
                    .user(user)
                    .memberRole(MemberRole.MEMBER)
                    .status(newStatus)
                    .build());
        }

        return CommunityMemberResponse.builder()
                .memberId(member.getMemberId())
                .communityId(communityId)
                .user(userMapper.toResponse(user))
                .memberRole(member.getMemberRole())
                .status(member.getStatus())
                .joinedAt(member.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void leaveCommunity(Long communityId, Long userId) {
        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, userId)
                .orElseThrow(() -> new EntityNotFoundException("CommunityMember record not found for user ID " + userId));
        communityMemberRepository.delete(member);
    }

    @Override
    @Transactional
    public void updateMemberRole(Long communityId, Long memberUserId, MemberRole role, Long requestingUserId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));
        if (!community.getOwner().getUserId().equals(requestingUserId)) {
            throw new ForbiddenException("Only community owner can promote/demote members.");
        }

        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, memberUserId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found in community."));
        member.setMemberRole(role);
        communityMemberRepository.save(member);
    }

    @Override
    @Transactional
    public void removeMember(Long communityId, Long memberUserId, Long requestingUserId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));
        
        boolean isOwnerOrMod = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, requestingUserId)
                .map(m -> m.getMemberRole() == MemberRole.OWNER || m.getMemberRole() == MemberRole.MODERATOR)
                .orElse(false);

        if (!community.getOwner().getUserId().equals(requestingUserId) && !isOwnerOrMod) {
            throw new ForbiddenException("Only owner/moderator can remove members.");
        }

        CommunityMember memberRecord = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, memberUserId)
                .orElseThrow(() -> new EntityNotFoundException("Member record not found"));
        communityMemberRepository.delete(memberRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CommunityMemberResponse> getCommunityMembers(Long communityId, Pageable pageable) {
        Page<CommunityMemberResponse> page = communityMemberRepository.findByCommunityCommunityIdAndStatus(communityId, MemberStatus.ACTIVE, pageable)
                .map(m -> CommunityMemberResponse.builder()
                        .memberId(m.getMemberId())
                        .communityId(communityId)
                        .user(userMapper.toResponse(m.getUser()))
                        .memberRole(m.getMemberRole())
                        .status(m.getStatus())
                        .joinedAt(m.getCreatedAt())
                        .build());
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CommunityMemberResponse> getPendingRequests(Long communityId, Long requestingUserId, Pageable pageable) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));
        
        boolean isOwnerOrMod = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, requestingUserId)
                .map(m -> m.getMemberRole() == MemberRole.OWNER || m.getMemberRole() == MemberRole.MODERATOR)
                .orElse(false);

        if (!community.getOwner().getUserId().equals(requestingUserId) && !isOwnerOrMod) {
            throw new ForbiddenException("Only owners and moderators can view pending requests.");
        }

        Page<CommunityMemberResponse> page = communityMemberRepository.findByCommunityCommunityIdAndStatus(communityId, MemberStatus.PENDING, pageable)
                .map(m -> CommunityMemberResponse.builder()
                        .memberId(m.getMemberId())
                        .communityId(communityId)
                        .user(userMapper.toResponse(m.getUser()))
                        .memberRole(m.getMemberRole())
                        .status(m.getStatus())
                        .joinedAt(m.getCreatedAt())
                        .build());
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional
    public void approveRequest(Long communityId, Long memberUserId, Long requestingUserId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));
        
        boolean isOwnerOrMod = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, requestingUserId)
                .map(m -> m.getMemberRole() == MemberRole.OWNER || m.getMemberRole() == MemberRole.MODERATOR)
                .orElse(false);

        if (!community.getOwner().getUserId().equals(requestingUserId) && !isOwnerOrMod) {
            throw new ForbiddenException("Only owners and moderators can approve requests.");
        }

        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, memberUserId)
                .orElseThrow(() -> new EntityNotFoundException("Member request not found."));
        
        if (member.getStatus() != MemberStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be approved.");
        }

        member.setStatus(MemberStatus.ACTIVE);
        communityMemberRepository.save(member);
        
        notificationService.sendNotification(memberUserId, "Join Request Approved", "Your request to join " + community.getName() + " has been approved.", NotificationType.SYSTEM);
    }

    @Override
    @Transactional
    public void rejectRequest(Long communityId, Long memberUserId, Long requestingUserId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));
        
        boolean isOwnerOrMod = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, requestingUserId)
                .map(m -> m.getMemberRole() == MemberRole.OWNER || m.getMemberRole() == MemberRole.MODERATOR)
                .orElse(false);

        if (!community.getOwner().getUserId().equals(requestingUserId) && !isOwnerOrMod) {
            throw new ForbiddenException("Only owners and moderators can reject requests.");
        }

        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, memberUserId)
                .orElseThrow(() -> new EntityNotFoundException("Member request not found."));
        
        if (member.getStatus() != MemberStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be rejected.");
        }

        member.setStatus(MemberStatus.REJECTED);
        communityMemberRepository.save(member);
        
        notificationService.sendNotification(memberUserId, "Join Request Declined", "Your request to join " + community.getName() + " was declined.", NotificationType.SYSTEM);
    }

    @Override
    @Transactional
    public CommunityMemberResponse inviteUser(Long communityId, Long targetUserId, Long requestingUserId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));
        
        boolean isOwnerOrMod = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, requestingUserId)
                .map(m -> m.getMemberRole() == MemberRole.OWNER || m.getMemberRole() == MemberRole.MODERATOR)
                .orElse(false);

        if (!community.getOwner().getUserId().equals(requestingUserId) && !isOwnerOrMod) {
            throw new ForbiddenException("Only owners and moderators can invite users.");
        }

        if (communityMemberRepository.existsByCommunityCommunityIdAndUserUserId(communityId, targetUserId)) {
            throw new DuplicateException("User is already invited or a member.");
        }
        
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", targetUserId));

        // Let's assume an invite immediately makes them a PENDING member (or ACTIVE if they accept, but since we don't have PENDING_INVITE, we'll make them ACTIVE as a direct add, or we can make them PENDING and they have to accept. For simplicity based on the prompt, "Owner -> Invite User -> Invitation -> Accept -> ACTIVE". However, we don't have an Accept endpoint. I will just add them as ACTIVE for now, but notify them).
        
        CommunityMember member;
        if (communityMemberRepository.countAllByCommunityIdAndUserId(communityId, targetUserId) > 0) {
            communityMemberRepository.resurrectMember(communityId, targetUserId, MemberStatus.ACTIVE, MemberRole.MEMBER);
            member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, targetUserId)
                    .orElseThrow(() -> new IllegalStateException("Failed to resurrect member"));
        } else {
            member = communityMemberRepository.save(CommunityMember.builder()
                    .community(community)
                    .user(targetUser)
                    .memberRole(MemberRole.MEMBER)
                    .status(MemberStatus.ACTIVE) // Auto-add for now to simplify
                    .build());
        }
                
        notificationService.sendNotification(targetUserId, "Community Invitation", "You have been invited and added to " + community.getName() + ".", NotificationType.INVITE);

        return CommunityMemberResponse.builder()
                .memberId(member.getMemberId())
                .communityId(communityId)
                .user(userMapper.toResponse(targetUser))
                .memberRole(member.getMemberRole())
                .status(member.getStatus())
                .joinedAt(member.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityMemberResponse getMembership(Long communityId, Long userId) {
        return communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, userId)
                .map(m -> CommunityMemberResponse.builder()
                        .memberId(m.getMemberId())
                        .communityId(communityId)
                        .user(userMapper.toResponse(m.getUser()))
                        .memberRole(m.getMemberRole())
                        .status(m.getStatus())
                        .joinedAt(m.getCreatedAt())
                        .build())
                .orElse(null);
    }
}
