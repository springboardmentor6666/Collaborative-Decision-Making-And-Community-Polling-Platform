package com.decisionhub.service.impl;

import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.VotingEventStatus;
import com.decisionhub.dto.request.VotingCategoryRequest;
import com.decisionhub.dto.response.VotingCategoryResponse;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.VotingCategory;
import com.decisionhub.entity.VotingEvent;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.VotingCategoryRepository;
import com.decisionhub.repository.VotingEventRepository;
import com.decisionhub.service.VotingCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VotingCategoryServiceImpl implements VotingCategoryService {

    private final VotingCategoryRepository votingCategoryRepository;
    private final VotingEventRepository votingEventRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final com.decisionhub.repository.CommunityRepository communityRepository;

    private void verifyModeratorOrOwner(Long communityId, Long userId) {
        com.decisionhub.entity.Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found"));

        if (community.getOwner().getUserId().equals(userId)) {
            return; // Owner is always allowed
        }

        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, userId)
                .orElseThrow(() -> new ForbiddenException("Only the community owner or moderator can manage categories."));

        if (member.getMemberRole() != MemberRole.MODERATOR && member.getMemberRole() != MemberRole.OWNER) {
            throw new ForbiddenException("Only the community owner or moderator can manage categories.");
        }
    }

    private void verifyEventModifiable(VotingEvent event) {
        if (event.getStatus() == VotingEventStatus.CLOSED || event.getStatus() == VotingEventStatus.CANCELLED) {
            throw new BusinessException("Cannot modify categories of a closed or cancelled Voting Arena.");
        }
    }

    private VotingCategoryResponse mapToResponse(VotingCategory category) {
        return VotingCategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .eventId(category.getVotingEvent().getEventId())
                .name(category.getName())
                .description(category.getDescription())
                .displayOrder(category.getDisplayOrder())
                .maxSelections(category.getMaxSelections())
                .createdAt(category.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public VotingCategoryResponse createCategory(Long eventId, Long userId, VotingCategoryRequest request) {
        VotingEvent event = votingEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Voting Arena not found"));

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);
        verifyEventModifiable(event);

        VotingCategory category = new VotingCategory();
        category.setVotingEvent(event);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setMaxSelections(request.getMaxSelections());

        category = votingCategoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    @Transactional
    public VotingCategoryResponse updateCategory(Long categoryId, Long userId, VotingCategoryRequest request) {
        VotingCategory category = votingCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        VotingEvent event = category.getVotingEvent();

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);
        verifyEventModifiable(event);

        if (event.getStatus() == VotingEventStatus.ACTIVE) {
            // Can't reduce max selections if people already voted, but simpler to just block critical updates.
            if (!Objects.equals(category.getMaxSelections(), request.getMaxSelections())) {
                throw new BusinessException("Cannot change max selections while voting is ACTIVE.");
            }
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setMaxSelections(request.getMaxSelections());

        category = votingCategoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VotingCategoryResponse> getCategoriesForEvent(Long eventId) {
        if (!votingEventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Voting Arena not found");
        }
        return votingCategoryRepository.findByVotingEventEventId(eventId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId, Long userId) {
        VotingCategory category = votingCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        VotingEvent event = category.getVotingEvent();

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() == VotingEventStatus.ACTIVE || event.getStatus() == VotingEventStatus.CLOSED) {
            throw new BusinessException("This category cannot be deleted because voting has already started or closed.");
        }

        votingCategoryRepository.delete(category);
    }
}
