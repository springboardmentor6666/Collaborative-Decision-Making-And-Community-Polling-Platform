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

import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import com.decisionhub.backend.repository.CommunityRepository;

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
    private final UserRepository userRepository;
    private final OptionRepository optionRepository;
    private final VoteRepository voteRepository;
    private final CommunityRepository communityRepository;
    private final CurrentUserService currentUser;
    private final com.decisionhub.backend.service.NotificationService notificationService;
    private final com.decisionhub.backend.repository.CommentRepository commentRepository;
    private final com.decisionhub.backend.repository.ReportRepository reportRepository;

    public DecisionServiceImpl(
            DecisionRepository decisionRepository,
            UserRepository userRepository,
            OptionRepository optionRepository,
            VoteRepository voteRepository, CommunityRepository communityRepository, CurrentUserService currentUser,
            com.decisionhub.backend.service.NotificationService notificationService,
            com.decisionhub.backend.repository.CommentRepository commentRepository,
            com.decisionhub.backend.repository.ReportRepository reportRepository) {

        this.decisionRepository = decisionRepository;
        this.userRepository = userRepository;
        this.optionRepository = optionRepository;
        this.voteRepository = voteRepository;
        this.communityRepository = communityRepository;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
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
            if (community.getMembers().stream().noneMatch(member -> member.getId().equals(user.getId()))) throw new AccessDeniedException("Join the community before creating a decision there");
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

        // Save options
        if (request.getOptions() != null) {

            for (String optionText : request.getOptions()) {

                if (optionText == null ||
                        optionText.trim().isEmpty()) {
                    continue;
                }

                Option option = Option.builder()
                        .optionText(optionText.trim())
                        .decision(savedDecision)
                        .build();

                optionRepository.save(option);
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
                .findByCreatedBy(user)
                .stream()
                .map(this::buildDecisionResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ACTIVE PUBLIC DECISIONS - ALL USERS
    // =========================================================

    @Override
    public List<DecisionResponse> getActivePublicDecisions() {

        LocalDateTime today = LocalDateTime.now();

        return decisionRepository
                .findAll()
                .stream()
                .filter(this::canView)
                .filter(decision ->
                        decision.getDeadline() == null ||
                                !decision.getDeadline().isBefore(today)
                )
                .map(this::buildDecisionResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET SINGLE DECISION
    // =========================================================

    @Override
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
    private DecisionResponse buildDecisionResponse(
            Decision decision) {

        User currentUser = null;

        try {
            currentUser = getCurrentUser();
        } catch (Exception ignored) {
            // Allows response creation even if no user exists
        }

        final User loggedInUser = currentUser;

        List<OptionResponse> options =
                optionRepository
                        .findByDecisionId(decision.getId())
                        .stream()
                        .map(option -> {

                            boolean selected = false;

                            if (loggedInUser != null) {

                                selected =
                                        voteRepository
                                                .findByUserIdAndDecisionId(
                                                        loggedInUser.getId(),
                                                        decision.getId()
                                                )
                                                .map(vote ->
                                                        vote.getOption()
                                                                .getId()
                                                                .equals(
                                                                        option.getId()
                                                                )
                                                )
                                                .orElse(false);
                            }

                            return OptionResponse.builder()
                                    .id(option.getId())
                                    .optionText(
                                            option.getOptionText()
                                    )
                                    .voteCount(
                                            voteRepository
                                                    .countByOptionId(
                                                            option.getId()
                                                    )
                                    )
                                    .selected(selected)
                                    .build();
                        })
                        .collect(Collectors.toList());

        return DecisionResponse.builder()
                .id(decision.getId())
                .title(decision.getTitle())
                .description(decision.getDescription())
                .category(decision.getCategory())
                .visibility(decision.getVisibility())
                .deadline(decision.getDeadline())
                .anonymous(decision.isAnonymous())
                .createdAt(decision.getCreatedAt())
                .createdByName(decision.isAnonymous() ? "Anonymous" : decision.getCreatedBy().getName())
                .communityId(decision.getCommunity() == null ? null : decision.getCommunity().getId())
                .communityName(decision.getCommunity() == null ? null : decision.getCommunity().getCommunityName())
                .totalVotes(voteRepository.countByDecisionId(decision.getId()))
                .alreadyVoted(options.stream().anyMatch(OptionResponse::isSelected))
                .status(decision.getDeadline() != null && decision.getDeadline().isBefore(LocalDateTime.now()) ? "COMPLETED" : "ACTIVE")
                .options(options)
                .build();
    }

    private boolean canView(Decision decision) {
        if (decision.getCommunity() != null) {
            User user = getCurrentUser();
            return decision.getCommunity().getMembers().stream().anyMatch(member -> member.getId().equals(user.getId()));
        }
        return "PUBLIC".equalsIgnoreCase(decision.getVisibility()) || decision.getCreatedBy().getId().equals(getCurrentUser().getId());
    }
}
