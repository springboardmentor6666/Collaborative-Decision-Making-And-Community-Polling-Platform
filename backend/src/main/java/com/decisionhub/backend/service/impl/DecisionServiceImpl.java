package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.dto.OptionResponse;
import com.decisionhub.backend.dto.VoteResponse;

import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Vote;

import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;

import com.decisionhub.backend.service.DecisionService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DecisionServiceImpl implements DecisionService {

    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final OptionRepository optionRepository;
    private final VoteRepository voteRepository;

    public DecisionServiceImpl(
            DecisionRepository decisionRepository,
            UserRepository userRepository,
            OptionRepository optionRepository,
            VoteRepository voteRepository) {

        this.decisionRepository = decisionRepository;
        this.userRepository = userRepository;
        this.optionRepository = optionRepository;
        this.voteRepository = voteRepository;
    }

    // =========================================================
    // CREATE DECISION
    // =========================================================

    @Override
    public DecisionResponse createDecision(
            DecisionRequest request) {

        User user = getCurrentUser();

        Decision decision = Decision.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .visibility(request.getVisibility())
                .deadline(request.getDeadline())
                .anonymous(request.isAnonymous())
                .createdBy(user)
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

        LocalDate today = LocalDate.now();

        return decisionRepository
                .findAll()
                .stream()
                .filter(decision ->
                        "PUBLIC".equalsIgnoreCase(
                                decision.getVisibility()
                        )
                )
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
                        .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "This poll has already ended"
            );
        }

        // Check public
        if (!"PUBLIC".equalsIgnoreCase(
                decision.getVisibility())) {

            throw new RuntimeException(
                    "This poll is not public"
            );
        }

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

        voteRepository.save(vote);

        return VoteResponse.builder()
                .id(vote.getId())
                .message("Vote recorded successfully")
                .build();
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));
    }

    // =========================================================
    // RESPONSE BUILDER
    // =========================================================

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
                .options(options)
                .build();
    }
}