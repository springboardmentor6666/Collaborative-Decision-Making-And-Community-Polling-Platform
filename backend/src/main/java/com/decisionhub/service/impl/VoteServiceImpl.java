package com.decisionhub.service.impl;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.VoteRequest;
import com.decisionhub.dto.response.OptionResponse;
import com.decisionhub.dto.response.VoteResponse;
import com.decisionhub.dto.response.VoteResultResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.User;
import com.decisionhub.entity.Vote;
import com.decisionhub.entity.VoteSelection;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.exception.DuplicateException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.mapper.OptionMapper;
import com.decisionhub.mapper.UserMapper;
import com.decisionhub.common.enums.NotificationType;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.repository.VoteSelectionRepository;
import com.decisionhub.service.NotificationService;
import com.decisionhub.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoteServiceImpl implements VoteService {

    private final VoteRepository voteRepository;
    private final DecisionRepository decisionRepository;
    private final OptionRepository optionRepository;
    private final UserRepository userRepository;
    private final VoteSelectionRepository voteSelectionRepository;
    private final UserMapper userMapper;
    private final OptionMapper optionMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public VoteResponse castVote(Long userId, VoteRequest request) {
        User voter = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));
        return processVoteExecution(voter, request);
    }

    @Override
    @Transactional
    public VoteResponse castAnonymousVote(VoteRequest request) {
        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", request.getDecisionId()));

        if (!decision.isAllowAnonymousVote()) {
            throw new ForbiddenException("Anonymous voting is disabled for this decision board.");
        }

        return processVoteExecution(null, request);
    }

    private VoteResponse processVoteExecution(User voter, VoteRequest request) {
        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", request.getDecisionId()));

        if (decision.getStatus() != DecisionStatus.ACTIVE) {
            throw new BusinessException("Voting is closed for this decision board.");
        }
        if (decision.getDeadline() != null && decision.getDeadline().isBefore(LocalDateTime.now())) {
            throw new BusinessException("The voting deadline has expired.");
        }

        if (request.getSelections() == null || request.getSelections().isEmpty()) {
            throw new BusinessException("At least one selection is required.");
        }

        long distinctOptionCount = request.getSelections().stream()
                .map(VoteRequest.SelectionDto::getOptionId)
                .distinct()
                .count();
        if (distinctOptionCount != request.getSelections().size()) {
            throw new BusinessException("Duplicate option selections are not allowed.");
        }

        if (decision.getVoteType() == VoteType.SINGLE && request.getSelections().size() > 1) {
            throw new BusinessException("Single-choice decision allows only one option.");
        }

        if (voter != null) {
            if (voteRepository.existsByUserUserIdAndDecisionDecisionId(voter.getUserId(), decision.getDecisionId())) {
                throw new DuplicateException("You have already cast a vote on this decision board.");
            }
        }

        Vote vote = Vote.builder()
                .decision(decision)
                .user(voter)
                .build();

        for (VoteRequest.SelectionDto sel : request.getSelections()) {
            Option option = optionRepository.findById(sel.getOptionId())
                    .orElseThrow(() -> new EntityNotFoundException("Option", "id", sel.getOptionId()));

            if (!option.getDecision().getDecisionId().equals(decision.getDecisionId())) {
                throw new BusinessException("Option does not belong to this decision.");
            }

            Integer rating = sel.getRating();
            if (decision.getVoteType() == VoteType.RATING) {
                if (rating == null || rating < 1 || rating > 10) {
                    throw new BusinessException("Rating vote requires a score between 1 and 10.");
                }
                optionRepository.updateOptionScore(option.getOptionId(), BigDecimal.valueOf(rating));
            } else {
                optionRepository.updateOptionScore(option.getOptionId(), BigDecimal.ONE);
            }

            VoteSelection voteSelection = VoteSelection.builder()
                    .vote(vote)
                    .option(option)
                    .rating(rating)
                    .build();

            vote.getSelections().add(voteSelection);
        }

        vote = voteRepository.save(vote);

        if (decision.getCreatedBy() != null && voter != null && !decision.getCreatedBy().getUserId().equals(voter.getUserId())) {
            notificationService.sendNotification(
                    decision.getCreatedBy().getUserId(),
                    "New Vote on " + decision.getTitle(),
                    voter.getFullName() + " cast a vote on your decision board.",
                    NotificationType.VOTE
            );
        }

        return toEnrichedVoteResponse(vote);
    }

    @Override
    @Transactional
    public VoteResponse changeVote(Long userId, Long voteId, VoteRequest request) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new EntityNotFoundException("Vote", "id", voteId));

        if (vote.getUser() == null || !vote.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You can only modify your own registered vote.");
        }

        Decision decision = vote.getDecision();
        if (decision.getStatus() != DecisionStatus.ACTIVE) {
            throw new BusinessException("Voting is closed for this decision board.");
        }
        if (decision.getDeadline() != null && decision.getDeadline().isBefore(LocalDateTime.now())) {
            throw new BusinessException("The voting deadline has expired.");
        }

        if (request.getSelections() == null || request.getSelections().isEmpty()) {
            throw new BusinessException("At least one selection is required.");
        }

        long distinctOptionCount = request.getSelections().stream()
                .map(VoteRequest.SelectionDto::getOptionId)
                .distinct()
                .count();
        if (distinctOptionCount != request.getSelections().size()) {
            throw new BusinessException("Duplicate option selections are not allowed.");
        }

        if (decision.getVoteType() == VoteType.SINGLE && request.getSelections().size() > 1) {
            throw new BusinessException("Single-choice decision allows only one option.");
        }

        // Subtract old scores
        for (VoteSelection vs : vote.getSelections()) {
            BigDecimal subtractScore = vs.getRating() != null ? BigDecimal.valueOf(vs.getRating()) : BigDecimal.ONE;
            optionRepository.updateOptionScore(vs.getOption().getOptionId(), subtractScore.negate());
        }

        // Explicitly delete old selections to ensure Hibernate removes them from the DB immediately
        voteSelectionRepository.deleteAll(vote.getSelections());
        voteSelectionRepository.flush();
        vote.getSelections().clear();

        for (VoteRequest.SelectionDto sel : request.getSelections()) {
            Option option = optionRepository.findById(sel.getOptionId())
                    .orElseThrow(() -> new EntityNotFoundException("Option", "id", sel.getOptionId()));

            if (!option.getDecision().getDecisionId().equals(decision.getDecisionId())) {
                throw new BusinessException("Option does not belong to this decision.");
            }

            Integer rating = sel.getRating();
            if (decision.getVoteType() == VoteType.RATING) {
                if (rating == null || rating < 1 || rating > 10) {
                    throw new BusinessException("Rating vote requires a score between 1 and 10.");
                }
                optionRepository.updateOptionScore(option.getOptionId(), BigDecimal.valueOf(rating));
            } else {
                optionRepository.updateOptionScore(option.getOptionId(), BigDecimal.ONE);
            }

            VoteSelection voteSelection = VoteSelection.builder()
                    .vote(vote)
                    .option(option)
                    .rating(rating)
                    .build();

            vote.getSelections().add(voteSelection);
        }

        vote = voteRepository.save(vote);

        return toEnrichedVoteResponse(vote);
    }

    @Override
    @Transactional(readOnly = true)
    public VoteResponse getUserVote(Long userId, Long decisionId) {
        List<Vote> votes = voteRepository.findByUserUserIdAndDecisionDecisionId(userId, decisionId);
        if (votes.isEmpty()) {
            return null;
        }

        Vote vote = votes.get(0);
        return toEnrichedVoteResponse(vote);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<VoteResponse> getUserVotesHistory(Long userId, Pageable pageable) {
        Page<Vote> votesPage = voteRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable);
        Page<VoteResponse> responsePage = votesPage.map(this::toEnrichedVoteResponse);
        return PagedResponse.fromPage(responsePage);
    }

    private VoteResponse toEnrichedVoteResponse(Vote vote) {
        Long decisionId = null;
        String decisionTitle = "Unknown Decision";
        String decisionStatus = null;
        String voteType = null;

        try {
            Decision decision = vote.getDecision();
            if (decision != null) {
                decisionId = decision.getDecisionId();
                decisionTitle = decision.getTitle() != null ? decision.getTitle() : "Decision";
                if (decision.getStatus() != null) {
                    decisionStatus = decision.getStatus().name();
                }
                if (decision.getVoteType() != null) {
                    voteType = decision.getVoteType().name();
                }
            }
        } catch (Throwable t) {
            decisionTitle = "Archived Decision";
        }

        List<VoteResponse.SelectionResponseDto> selections = new ArrayList<>();
        if (vote.getSelections() != null) {
            for (VoteSelection vs : vote.getSelections()) {
                Long optionId = null;
                String optionTitle = "Option";
                try {
                    Option option = vs.getOption();
                    if (option != null) {
                        optionId = option.getOptionId();
                        optionTitle = option.getTitle() != null ? option.getTitle() : ("Option" + (optionId != null ? " #" + optionId : ""));
                    }
                } catch (Throwable t) {
                    optionTitle = "Option (Archived)";
                }

                selections.add(VoteResponse.SelectionResponseDto.builder()
                        .optionId(optionId)
                        .optionTitle(optionTitle != null ? optionTitle : "Option")
                        .rating(vs.getRating())
                        .build());
            }
        }

        com.decisionhub.dto.response.UserResponse voterResp = null;
        try {
            if (vote.getUser() != null) {
                voterResp = userMapper.toResponse(vote.getUser());
            }
        } catch (Throwable ignored) {
        }

        return VoteResponse.builder()
                .voteId(vote.getVoteId())
                .decisionId(decisionId)
                .decisionTitle(decisionTitle)
                .decisionStatus(decisionStatus)
                .voteType(voteType)
                .voter(voterResp)
                .selections(selections)
                .createdAt(vote.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public VoteResultResponse getVoteResults(Long decisionId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        List<Option> options = optionRepository.findByDecisionDecisionId(decisionId);
        long totalVotesCount = voteRepository.countByDecisionDecisionId(decisionId);

        Map<Long, Long> countsMap = new HashMap<>();
        Map<Long, BigDecimal> percentagesMap = new HashMap<>();

        Option winningOption = null;
        long maxVotes = -1;

        for (Option opt : options) {
            long count = voteSelectionRepository.countByOptionOptionId(opt.getOptionId());
            countsMap.put(opt.getOptionId(), count);

            if (count > maxVotes) {
                maxVotes = count;
                winningOption = opt;
            }

            BigDecimal pct = totalVotesCount > 0
                    ? BigDecimal.valueOf(count).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(totalVotesCount), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            percentagesMap.put(opt.getOptionId(), pct);
        }

        OptionResponse winResp = winningOption != null ? optionMapper.toResponse(winningOption) : null;

        return VoteResultResponse.builder()
                .decisionId(decisionId)
                .totalVotesCount(totalVotesCount)
                .optionVoteCounts(countsMap)
                .optionPercentages(percentagesMap)
                .winningOption(winResp)
                .build();
    }
}
