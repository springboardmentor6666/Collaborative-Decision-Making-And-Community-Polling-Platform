package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.dto.OptionResponse;
import com.decisionhub.backend.dto.VoteResponse;

import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Vote;
import com.decisionhub.backend.entity.Activity;

import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.ActivityRepository;

import com.decisionhub.backend.service.DecisionService;
import com.decisionhub.backend.service.CurrentUserService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DecisionServiceImpl implements DecisionService {

    private final DecisionRepository decisionRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final OptionRepository optionRepository;
    private final VoteRepository voteRepository;
    private final CommunityRepository communityRepository;
    private final CurrentUserService currentUser;
    private final com.decisionhub.backend.service.NotificationService notificationService;
    private final com.decisionhub.backend.repository.CommentRepository commentRepository;
    private final com.decisionhub.backend.repository.ReportRepository reportRepository;
    private final com.decisionhub.backend.repository.CommunityMembershipRepository membershipRepository;

    public DecisionServiceImpl(
            DecisionRepository decisionRepository,
            ActivityRepository activityRepository,
            UserRepository userRepository,
            OptionRepository optionRepository,
            VoteRepository voteRepository, CommunityRepository communityRepository, CurrentUserService currentUser,
            com.decisionhub.backend.service.NotificationService notificationService,
            com.decisionhub.backend.repository.CommentRepository commentRepository,
            com.decisionhub.backend.repository.ReportRepository reportRepository,
            com.decisionhub.backend.repository.CommunityMembershipRepository membershipRepository) {

        this.decisionRepository = decisionRepository;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.optionRepository = optionRepository;
        this.voteRepository = voteRepository;
        this.communityRepository = communityRepository;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
        this.membershipRepository = membershipRepository;
    }

    // =========================================================
    // CREATE DECISION
    // =========================================================

    @Override
    @Transactional
    public DecisionResponse createDecision(
            DecisionRequest request) {

        User user = getCurrentUser();

        Community community = null;
        if (request.getCommunityId() != null) {
            community = communityRepository.findById(request.getCommunityId()).orElseThrow(() -> new java.util.NoSuchElementException("Community not found"));
            if (!membershipRepository.existsActiveByUserIdAndCommunityId(user.getId(), community.getId())) {
                throw new AccessDeniedException("Join the community before creating a decision there");
            }
        }
        Decision decision = Decision.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .visibility(request.getVisibility())
                .deadline(request.getDeadline())
                .anonymous(request.isAnonymous())
                .createdBy(user)
                .community(community)
                .build();

        Decision savedDecision =
                decisionRepository.save(decision);

        // Save options in batch
        if (request.getOptions() != null) {
            List<Option> optionsToSave = new java.util.ArrayList<>();
            for (String optionText : request.getOptions()) {
                if (optionText == null || optionText.trim().isEmpty()) {
                    continue;
                }
                optionsToSave.add(Option.builder()
                        .optionText(optionText.trim())
                        .decision(savedDecision)
                        .build());
            }
            if (!optionsToSave.isEmpty()) {
                optionRepository.saveAll(optionsToSave);
            }
        }

        return buildDecisionResponse(savedDecision);
    }

    // =========================================================
    // MY DECISIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<DecisionResponse> getMyDecisions() {
        User user = getCurrentUser();
        return decisionRepository
                .findByCreatedByIdWithAssociations(user.getId())
                .stream()
                .map(this::buildDecisionResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ACTIVE PUBLIC DECISIONS - ALL USERS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<DecisionResponse> getActivePublicDecisions() {
        return decisionRepository
                .findActivePublicDecisions(LocalDateTime.now())
                .stream()
                .map(this::buildDecisionResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET SINGLE DECISION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public DecisionResponse getDecisionById(Long id) {

        Decision decision =
                decisionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Decision not found"
                                ));

        if (!canView(decision)) throw new AccessDeniedException("You do not have access to this decision");
        return buildDecisionResponse(decision);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public DecisionResponse updateDecision(
            Long id,
            DecisionRequest request) {

        User currentUser = getCurrentUser();

        Decision decision =
                decisionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Decision not found"
                                ));

        if (!decision.getCreatedBy()
                .getId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "You can only update your own decision"
            );
        }

        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        decision.setCategory(request.getCategory());
        decision.setVisibility(request.getVisibility());
        decision.setDeadline(request.getDeadline());
        decision.setAnonymous(request.isAnonymous());

        Decision updated =
                decisionRepository.save(decision);

        return buildDecisionResponse(updated);
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    @Transactional
    public void deleteDecision(Long id) {

        User currentUser = getCurrentUser();

        Decision decision =
                decisionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Decision not found"
                                ));

        if (!decision.getCreatedBy()
                .getId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "You can only delete your own decision"
            );
        }

        voteRepository.deleteByDecisionId(id);
        commentRepository.deleteByDecisionId(id);
        reportRepository.deleteByDecisionId(id);

        activityRepository.save(
                Activity.builder()
                        .user(decision.getCreatedBy())
                        .type("Decision deleted")
                        .subject(decision.getTitle())
                        .at(LocalDateTime.now())
                        .build()
        );

        decisionRepository.delete(decision);
    }

    // =========================================================
    // VOTE
    // =========================================================

    @Override
    public VoteResponse vote(
            Long decisionId,
            Long optionId) {

        User user = getCurrentUser();

        Decision decision =
                decisionRepository.findById(decisionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Decision not found"
                                ));

        // Check active
        if (decision.getDeadline() != null &&
                decision.getDeadline()
                        .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "This poll has already ended"
            );
        }

        if (!canView(decision)) throw new AccessDeniedException("You do not have access to this poll");

        Option option =
                optionRepository.findById(optionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Option not found"
                                ));

        // Make sure option belongs to this decision
        if (!option.getDecision()
                .getId()
                .equals(decisionId)) {

            throw new RuntimeException(
                    "Option does not belong to this decision"
            );
        }

        // Check if user already voted
        if (voteRepository
                .findByUserIdAndDecisionId(
                        user.getId(),
                        decisionId
                )
                .isPresent()) {

            throw new RuntimeException(
                    "You have already voted on this poll"
            );
        }

        Vote vote = Vote.builder()
                .user(user)
                .decision(decision)
                .option(option)
                .build();

        try { voteRepository.saveAndFlush(vote); } catch (org.springframework.dao.DataIntegrityViolationException ex) { throw new IllegalStateException("You have already voted on this poll"); }

        if (decision.getCreatedBy() != null && !decision.getCreatedBy().getId().equals(user.getId())) {
            notificationService.notifyUser(
                    decision.getCreatedBy(),
                    user.getName() + " voted on your decision \"" + decision.getTitle() + "\""
            );
        }

        return VoteResponse.builder()
                .id(vote.getId())
                .message("Vote recorded successfully")
                .build();
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    private User getCurrentUser() { return currentUser.get(); }

    // =========================================================
    // RESPONSE BUILDER
    // =========================================================

    @Override public DecisionResponse toResponse(Decision decision) { return buildDecisionResponse(decision); }

    private DecisionResponse buildDecisionResponse(Decision decision) {
        User currentUser = null;
        try {
            currentUser = getCurrentUser();
        } catch (Exception ignored) {
            // Allows response creation even if no user exists
        }
        final User loggedInUser = currentUser;

        // Fetch options once
        List<Option> decisionOptions = optionRepository.findByDecisionId(decision.getId());

        // Batch fetch vote counts for all options in one single GROUP BY query
        java.util.Map<Long, Long> optionVoteCounts = new java.util.HashMap<>();
        List<Object[]> countResults = voteRepository.countVotesByOptionIdForDecision(decision.getId());
        long totalDecisionVotes = 0;
        for (Object[] row : countResults) {
            Long optId = (Long) row[0];
            Long cnt = (Long) row[1];
            optionVoteCounts.put(optId, cnt);
            totalDecisionVotes += cnt;
        }

        // Single query to check which option current user voted on
        final Long votedOptionId = (loggedInUser != null)
                ? voteRepository.findVotedOptionIdByUserIdAndDecisionId(loggedInUser.getId(), decision.getId()).orElse(null)
                : null;

        List<OptionResponse> options = decisionOptions.stream().map(option -> {
            boolean selected = votedOptionId != null && votedOptionId.equals(option.getId());
            long count = optionVoteCounts.getOrDefault(option.getId(), 0L);
            return OptionResponse.builder()
                    .id(option.getId())
                    .optionText(option.getOptionText())
                    .voteCount(count)
                    .selected(selected)
                    .build();
        }).collect(Collectors.toList());

        String createdByName = "Anonymous";
        if (!decision.isAnonymous() && decision.getCreatedBy() != null) {
            createdByName = decision.getCreatedBy().getName();
        }

        Long communityId = (decision.getCommunity() == null) ? null : decision.getCommunity().getId();
        String communityName = (decision.getCommunity() == null) ? null : decision.getCommunity().getCommunityName();

        return DecisionResponse.builder()
                .id(decision.getId())
                .title(decision.getTitle())
                .description(decision.getDescription())
                .category(decision.getCategory())
                .visibility(decision.getVisibility())
                .deadline(decision.getDeadline())
                .anonymous(decision.isAnonymous())
                .createdAt(decision.getCreatedAt())
                .createdByName(createdByName)
                .communityId(communityId)
                .communityName(communityName)
                .totalVotes(totalDecisionVotes)
                .alreadyVoted(votedOptionId != null)
                .status(decision.getDeadline() != null && decision.getDeadline().isBefore(LocalDateTime.now()) ? "COMPLETED" : "ACTIVE")
                .options(options)
                .build();
    }

    private boolean canView(Decision decision) {
        User user = null;
        try {
            user = getCurrentUser();
        } catch (Exception ignored) {}

        if (decision.getCommunity() != null) {
            if (user == null) return false;
            return membershipRepository.existsActiveByUserIdAndCommunityId(user.getId(), decision.getCommunity().getId());
        }
        if ("PUBLIC".equalsIgnoreCase(decision.getVisibility())) return true;
        return user != null && decision.getCreatedBy() != null && decision.getCreatedBy().getId().equals(user.getId());
    }
}
