package com.decisionhub.service.impl;

import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.VotingEventStatus;
import com.decisionhub.dto.request.VotingEventRequest;
import com.decisionhub.dto.response.VotingEventResponse;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.User;
import com.decisionhub.entity.VotingEvent;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VotingEventRepository;
import com.decisionhub.repository.VotingCategoryRepository;
import com.decisionhub.repository.NomineeRepository;
import com.decisionhub.service.VotingEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VotingEventServiceImpl implements VotingEventService {

    private final VotingEventRepository votingEventRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final VotingCategoryRepository votingCategoryRepository;
    private final NomineeRepository nomineeRepository;

    private void verifyModeratorOrOwner(Long communityId, Long userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found"));
        
        if (community.getOwner().getUserId().equals(userId)) {
            return; // Owner is always allowed
        }

        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(communityId, userId)
                .orElseThrow(() -> new ForbiddenException("Only the community owner or moderator can conduct a Voting Arena."));
        
        if (member.getMemberRole() != MemberRole.MODERATOR && member.getMemberRole() != MemberRole.OWNER) {
            throw new ForbiddenException("Only the community owner or moderator can conduct a Voting Arena.");
        }
    }

    private VotingEventResponse mapToResponse(VotingEvent event) {
        return VotingEventResponse.builder()
                .eventId(event.getEventId())
                .communityId(event.getCommunity().getCommunityId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .status(event.getStatus())
                .votingType(event.getVotingType())
                .anonymousVoting(event.isAnonymousVoting())
                .resultsVisible(event.getResultsVisible())
                .resultsPublished(event.isResultsPublished())
                .createdAt(event.getCreatedAt())
                .createdByUser(event.getCreatedBy() != null ? event.getCreatedBy().getUsername() : null)
                .build();
    }

    @Override
    @Transactional
    public VotingEventResponse createVotingEvent(Long communityId, Long userId, VotingEventRequest request) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        verifyModeratorOrOwner(communityId, userId);

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BusinessException("Start date cannot be after end date.");
        }

        VotingEvent event = new VotingEvent();
        event.setCommunity(community);
        event.setCreatedBy(user);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setResultsVisible(request.getResultsVisible());
        event.setStatus(VotingEventStatus.DRAFT);

        event = votingEventRepository.save(event);
        return mapToResponse(event);
    }

    @Override
    @Transactional
    public VotingEventResponse updateVotingEvent(Long eventId, Long userId, VotingEventRequest request) {
        VotingEvent event = votingEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Voting Arena not found"));

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() == VotingEventStatus.CLOSED || event.getStatus() == VotingEventStatus.CANCELLED) {
            throw new BusinessException("Cannot modify a closed or cancelled Voting Arena.");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BusinessException("Start date cannot be after end date.");
        }

        if (event.getStatus() == VotingEventStatus.ACTIVE) {
            // Safe configuration changes only
            if (request.getEndDate().isBefore(event.getEndDate())) {
                throw new BusinessException("Cannot bring end date backwards while ACTIVE.");
            }
        } else {
            event.setStartDate(request.getStartDate());
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEndDate(request.getEndDate());
        event.setResultsVisible(request.getResultsVisible());

        event = votingEventRepository.save(event);
        return mapToResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public VotingEventResponse getVotingEvent(Long eventId, Long userId) {
        VotingEvent event = votingEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Voting Arena not found"));
        // Everyone can view, but could add community membership check here if private
        return mapToResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VotingEventResponse> getCommunityEvents(Long communityId) {
        if (!communityRepository.existsById(communityId)) {
            throw new EntityNotFoundException("Community not found");
        }
        return votingEventRepository.findByCommunityCommunityId(communityId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void publishEvent(Long eventId, Long userId) {
        VotingEvent event = votingEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Voting Arena not found"));
        
        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() != VotingEventStatus.DRAFT) {
            throw new BusinessException("Only DRAFT Voting Arenas can be published.");
        }

        event.setStatus(VotingEventStatus.UPCOMING);
        votingEventRepository.save(event);
    }

    @Override
    @Transactional
    public void startEvent(Long eventId, Long userId) {
        VotingEvent event = votingEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Voting Arena not found"));

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() != VotingEventStatus.UPCOMING && event.getStatus() != VotingEventStatus.DRAFT) {
            throw new BusinessException("Cannot start event from current state.");
        }

        if (votingCategoryRepository.findByVotingEventEventId(eventId).isEmpty()) {
            throw new BusinessException("Cannot start Voting Arena without any categories.");
        }

        event.setStatus(VotingEventStatus.ACTIVE);
        votingEventRepository.save(event);
    }

    @Override
    @Transactional
    public void closeEvent(Long eventId, Long userId) {
        VotingEvent event = votingEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Voting Arena not found"));

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() != VotingEventStatus.ACTIVE) {
            throw new BusinessException("Only ACTIVE Voting Arenas can be closed.");
        }

        event.setStatus(VotingEventStatus.CLOSED);
        votingEventRepository.save(event);
    }

    @Override
    @Transactional
    public void publishResults(Long eventId, Long userId) {
        VotingEvent event = votingEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Voting Arena not found"));

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() != VotingEventStatus.CLOSED) {
            throw new BusinessException("Only CLOSED Voting Arenas can have their results published.");
        }

        if (event.isResultsPublished()) {
            throw new BusinessException("Results are already published.");
        }

        event.setResultsPublished(true);
        votingEventRepository.save(event);
    }

    @Override
    @Transactional
    public void deleteVotingEvent(Long eventId, Long userId) {
        VotingEvent event = votingEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Voting Arena not found"));

        verifyModeratorOrOwner(event.getCommunity().getCommunityId(), userId);

        if (event.getStatus() == VotingEventStatus.ACTIVE || event.getStatus() == VotingEventStatus.UPCOMING) {
            throw new BusinessException("Cannot delete an active or upcoming Voting Arena. Please close or cancel it first.");
        }

        votingEventRepository.delete(event);
    }
}
