package com.decisionhub.service.impl;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.DecisionRequest;
import com.decisionhub.dto.response.DecisionResponse;

import com.decisionhub.entity.Community;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.exception.ValidationException;
import com.decisionhub.mapper.DecisionMapper;

import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.service.DecisionService;
import com.decisionhub.specification.DecisionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DecisionServiceImpl implements DecisionService {

    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final VoteRepository voteRepository;
    private final com.decisionhub.repository.CommentRepository commentRepository;
    private final DecisionMapper decisionMapper;

    @Override
    @Transactional
    public DecisionResponse createDecision(Long userId, DecisionRequest request) {
        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new ValidationException("At least two comparison options are required to publish a decision board.");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));


        Community community = null;
        if (request.getCommunityId() != null) {
            community = communityRepository.findById(request.getCommunityId())
                    .orElseThrow(() -> new EntityNotFoundException("Community", "id", request.getCommunityId()));
            
            boolean isMember = communityMemberRepository.existsByCommunityCommunityIdAndUserUserIdAndStatus(
                    request.getCommunityId(), userId, com.decisionhub.common.enums.MemberStatus.ACTIVE);
            
            if (!isMember) {
                throw new ForbiddenException("You must be an active member of this community to post in it.");
            }
        }

        Decision decision = decisionMapper.toEntity(request);
        decision.setCreatedBy(author);
        decision.setCommunity(community);
        decision.setStatus(DecisionStatus.ACTIVE);
        if (decision.getVisibility() == null) {
            decision.setVisibility(DecisionVisibility.PUBLIC);
        }

        // Map options & pros/cons
        if (request.getOptions() != null) {
            for (var optReq : request.getOptions()) {
                Option option = Option.builder()
                        .title(optReq.getTitle())
                        .description(optReq.getDescription())
                        .totalScore(BigDecimal.ZERO)
                        .build();


                decision.addOption(option);
            }
        }

        Decision savedDecision = decisionRepository.save(decision);
        return enrichDecisionResponse(savedDecision);
    }

    @Override
    @Transactional
    public DecisionResponse updateDecision(Long decisionId, Long userId, DecisionRequest request) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        if (!decision.getCreatedBy().getUserId().equals(userId)) {
            throw new ForbiddenException("Only the decision author can modify this board.");
        }

        if (request.getTitle() != null) decision.setTitle(request.getTitle());
        if (request.getDescription() != null) decision.setDescription(request.getDescription());
        if (request.getDeadline() != null) decision.setDeadline(request.getDeadline());
        if (request.getVisibility() != null) decision.setVisibility(request.getVisibility());
        if (request.getAllowAnonymousVote() != null) decision.setAllowAnonymousVote(request.getAllowAnonymousVote());

        return enrichDecisionResponse(decisionRepository.save(decision));
    }

    @Override
    @Transactional
    public DecisionResponse getDecisionById(Long decisionId, Long requestingUserId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        if (decision.getVisibility() == DecisionVisibility.PRIVATE || 
            (decision.getCommunity() != null && decision.getCommunity().getVisibility() == com.decisionhub.common.enums.CommunityVisibility.PRIVATE)) {
            
            if (requestingUserId == null) {
                throw new ForbiddenException("You must be logged in to view this private decision.");
            }
            
            boolean isAuthor = decision.getCreatedBy().getUserId().equals(requestingUserId);
            boolean isMember = false;
            if (decision.getCommunity() != null) {
                isMember = communityMemberRepository.existsByCommunityCommunityIdAndUserUserIdAndStatus(
                        decision.getCommunity().getCommunityId(), requestingUserId, com.decisionhub.common.enums.MemberStatus.ACTIVE);
            }
            
            if (!isAuthor && !isMember) {
                throw new ForbiddenException("This decision is private and you do not have access.");
            }
        }

        // Increment view count asynchronously/atomically
        decisionRepository.incrementViewCount(decisionId);

        return enrichDecisionResponse(decision);
    }

    @Override
    @Transactional
    public void deleteDecision(Long decisionId, Long userId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));
        
        com.decisionhub.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));
        boolean isAdmin = user.getRole().getRoleName() == com.decisionhub.common.enums.RoleType.ROLE_ADMIN;

        boolean isAuthor = decision.getCreatedBy() != null && decision.getCreatedBy().getUserId().equals(userId);
        boolean isCommunityOwnerOrMod = false;
        if (decision.getCommunity() != null) {
            isCommunityOwnerOrMod = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(
                    decision.getCommunity().getCommunityId(), userId)
                    .map(m -> m.getMemberRole() == com.decisionhub.common.enums.MemberRole.OWNER || m.getMemberRole() == com.decisionhub.common.enums.MemberRole.MODERATOR)
                    .orElse(false);
        }

        if (!isAuthor && !isAdmin && !isCommunityOwnerOrMod) {
            throw new ForbiddenException("Only the decision author, community moderator/owner, or an admin can delete this board.");
        }
        decisionRepository.delete(decision);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> searchDecisions(
            String searchQuery, Long communityId,
            DecisionVisibility visibility, DecisionStatus status, VoteType voteType,
            Long createdById, Long requestingUserId, Pageable pageable) {

        Page<DecisionResponse> page = decisionRepository.findAll(
                DecisionSpecification.filterDecisions(searchQuery, communityId, visibility, status, voteType, createdById, requestingUserId),
                pageable
        ).map(this::enrichDecisionResponse);

        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getTrendingDecisions(Long requestingUserId, Pageable pageable) {
        Page<DecisionResponse> page = decisionRepository.findTrendingDecisions(requestingUserId, pageable)
                .map(this::enrichDecisionResponse);
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getPopularDecisions(Long requestingUserId, Pageable pageable) {
        Page<DecisionResponse> page = decisionRepository.findPopularDecisions(requestingUserId, pageable)
                .map(this::enrichDecisionResponse);
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getLatestDecisions(Long requestingUserId, Pageable pageable) {
        Page<DecisionResponse> page = decisionRepository.findLatestDecisions(requestingUserId, pageable)
                .map(this::enrichDecisionResponse);
        return PagedResponse.fromPage(page);
    }

    private DecisionResponse enrichDecisionResponse(Decision decision) {
        DecisionResponse response = decisionMapper.toResponse(decision);
        long totalVotes = voteRepository.countByDecisionDecisionId(decision.getDecisionId());
        response.setTotalVotes(totalVotes);

        long commentCount = commentRepository.countByDecisionDecisionId(decision.getDecisionId());
        response.setCommentCount(commentCount);

        if (response.getOptions() != null) {
            for (var optRes : response.getOptions()) {
                long optVotes = voteRepository.countByOptionOptionId(optRes.getOptionId());
                optRes.setVoteCount(optVotes);
            }
        }
        return response;
    }
}
