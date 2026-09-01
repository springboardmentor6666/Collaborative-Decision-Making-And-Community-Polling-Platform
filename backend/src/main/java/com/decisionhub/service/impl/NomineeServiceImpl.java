package com.decisionhub.service.impl;

import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.common.enums.NominationStatus;
import com.decisionhub.common.enums.VotingEventStatus;
import com.decisionhub.dto.request.NomineeRequest;
import com.decisionhub.dto.response.NomineeResponse;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.Nominee;
import com.decisionhub.entity.User;
import com.decisionhub.entity.VotingCategory;
import com.decisionhub.entity.VotingEvent;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.NomineeRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VotingCategoryRepository;
import com.decisionhub.service.NomineeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NomineeServiceImpl implements NomineeService {

    private final NomineeRepository nomineeRepository;
    private final VotingCategoryRepository votingCategoryRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;
    private final com.decisionhub.repository.CommunityRepository communityRepository;

    private CommunityMember verifyModeratorOrOwner(Long communityId, Long userId) {
        com.decisionhub.entity.Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found"));

        if (community.getOwner().getUserId().equals(userId)) {
            return communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, userId).orElse(null);
        }

        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, userId)
                .orElseThrow(() -> new ForbiddenException("Only the community owner or moderator can perform this action."));
        
        if (member.getMemberRole() != MemberRole.MODERATOR && member.getMemberRole() != MemberRole.OWNER) {
            throw new ForbiddenException("Only the community owner or moderator can perform this action.");
        }
        return member;
    }

    private CommunityMember verifyActiveMember(Long communityId, Long userId) {
        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, userId)
                .orElseThrow(() -> new ForbiddenException("Not a member of this community."));
        
        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw new ForbiddenException("You must be an active member to perform this action.");
        }
        return member;
    }

    private NomineeResponse mapToResponse(Nominee nominee) {
        return NomineeResponse.builder()
                .nomineeId(nominee.getNomineeId())
                .categoryId(nominee.getVotingCategory().getCategoryId())
                .name(nominee.getName())
                .description(nominee.getDescription())
                .imageUrl(nominee.getImageUrl())
                .externalUrl(nominee.getExternalUrl())
                .nominationStatus(nominee.getNominationStatus())
                .createdAt(nominee.getCreatedAt())
                .submittedById(nominee.getSubmittedBy() != null ? nominee.getSubmittedBy().getUserId() : null)
                .submittedByName(nominee.getSubmittedBy() != null ? nominee.getSubmittedBy().getUsername() : null)
                .build();
    }

    @Override
    @Transactional
    public NomineeResponse submitNomination(Long categoryId, Long userId, NomineeRequest request) {
        VotingCategory category = votingCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        VotingEvent event = category.getVotingEvent();

        verifyActiveMember(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() == VotingEventStatus.CLOSED || event.getStatus() == VotingEventStatus.CANCELLED) {
            throw new BusinessException("Cannot submit nominations for a closed or cancelled Voting Arena.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Nominee nominee = new Nominee();
        nominee.setVotingCategory(category);
        nominee.setSubmittedBy(user);
        nominee.setName(request.getName());
        nominee.setDescription(request.getDescription());
        nominee.setImageUrl(request.getImageUrl());
        nominee.setExternalUrl(request.getExternalUrl());
        
        CommunityMember member = verifyActiveMember(event.getCommunity().getCommunityId(), userId);
        if (event.getCommunity().getOwner().getUserId().equals(userId) || member.getMemberRole() == MemberRole.OWNER || member.getMemberRole() == MemberRole.MODERATOR) {
            nominee.setNominationStatus(NominationStatus.APPROVED);
            nominee.setApprovedBy(user);
        } else {
            nominee.setNominationStatus(NominationStatus.PENDING);
        }

        nominee = nomineeRepository.save(nominee);
        return mapToResponse(nominee);
    }

    @Override
    @Transactional
    public NomineeResponse updateNominee(Long nomineeId, Long userId, NomineeRequest request) {
        Nominee nominee = nomineeRepository.findById(nomineeId)
                .orElseThrow(() -> new EntityNotFoundException("Nominee not found"));
        VotingEvent event = nominee.getVotingCategory().getVotingEvent();

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() == VotingEventStatus.CLOSED || event.getStatus() == VotingEventStatus.CANCELLED) {
            throw new BusinessException("Cannot modify nominees in a closed or cancelled Voting Arena.");
        }

        nominee.setName(request.getName());
        nominee.setDescription(request.getDescription());
        nominee.setImageUrl(request.getImageUrl());
        nominee.setExternalUrl(request.getExternalUrl());

        nominee = nomineeRepository.save(nominee);
        return mapToResponse(nominee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NomineeResponse> getNomineesForCategory(Long categoryId, Long userId) {
        if (!votingCategoryRepository.existsById(categoryId)) {
            throw new EntityNotFoundException("Category not found");
        }
        
        // Members typically only see APPROVED nominees unless they are mods, but we'll return all for mods and APPROVED for normal users
        VotingCategory category = votingCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(category.getVotingEvent().getCommunity().getCommunityId(), userId).orElse(null);
        
        List<Nominee> nominees = nomineeRepository.findByVotingCategoryCategoryId(categoryId);
        
        boolean isOwnerOrMod = false;
        if (category.getVotingEvent().getCommunity().getOwner().getUserId().equals(userId)) {
            isOwnerOrMod = true;
        } else if (member != null && (member.getMemberRole() == MemberRole.OWNER || member.getMemberRole() == MemberRole.MODERATOR)) {
            isOwnerOrMod = true;
        }

        if (!isOwnerOrMod) {
            nominees = nominees.stream()
                .filter(n -> n.getNominationStatus() == NominationStatus.APPROVED)
                .collect(Collectors.toList());
        }

        return nominees.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void approveNomination(Long nomineeId, Long userId) {
        Nominee nominee = nomineeRepository.findById(nomineeId)
                .orElseThrow(() -> new EntityNotFoundException("Nominee not found"));
        VotingEvent event = nominee.getVotingCategory().getVotingEvent();

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() == VotingEventStatus.CLOSED || event.getStatus() == VotingEventStatus.CANCELLED) {
            throw new BusinessException("Cannot approve nominees in a closed or cancelled Voting Arena.");
        }

        if (nominee.getNominationStatus() != NominationStatus.PENDING) {
            throw new BusinessException("Only PENDING nominations can be approved.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        nominee.setNominationStatus(NominationStatus.APPROVED);
        nominee.setApprovedBy(user);
        nomineeRepository.save(nominee);
    }

    @Override
    @Transactional
    public void rejectNomination(Long nomineeId, Long userId) {
        Nominee nominee = nomineeRepository.findById(nomineeId)
                .orElseThrow(() -> new EntityNotFoundException("Nominee not found"));
        VotingEvent event = nominee.getVotingCategory().getVotingEvent();

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        nominee.setNominationStatus(NominationStatus.REJECTED);
        nomineeRepository.save(nominee);
    }

    @Override
    @Transactional
    public void deleteNominee(Long nomineeId, Long userId) {
        Nominee nominee = nomineeRepository.findById(nomineeId)
                .orElseThrow(() -> new EntityNotFoundException("Nominee not found"));
        VotingEvent event = nominee.getVotingCategory().getVotingEvent();

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() == VotingEventStatus.ACTIVE || event.getStatus() == VotingEventStatus.CLOSED) {
            throw new BusinessException("This nominee cannot be removed because voting has already started or closed.");
        }

        nomineeRepository.delete(nominee);
    }
}
