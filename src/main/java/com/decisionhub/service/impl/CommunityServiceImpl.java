package com.decisionhub.service.impl;

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
    public PagedResponse<CommunityResponse> searchCommunities(String query, Pageable pageable) {
        Page<CommunityResponse> page = communityRepository.findAll(
                CommunitySpecification.filterCommunities(query, null, null), pageable
        ).map(community -> {
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

        CommunityMember member = communityMemberRepository.save(CommunityMember.builder()
                .community(community)
                .user(user)
                .memberRole(MemberRole.MEMBER)
                .status(MemberStatus.ACTIVE)
                .build());

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
        Community Member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, memberUserId)
                .map(m -> m.getCommunity())
                .orElseThrow(() -> new EntityNotFoundException("Member not found in community."));

        if (!Member.getOwner().getUserId().equals(requestingUserId)) {
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
}
