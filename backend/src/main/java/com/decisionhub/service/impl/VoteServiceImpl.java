package com.decisionhub.service.impl;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.dto.request.VoteRequest;
import com.decisionhub.dto.response.OptionResponse;
import com.decisionhub.dto.response.VoteResponse;
import com.decisionhub.dto.response.VoteResultResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.User;
import com.decisionhub.entity.Vote;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.exception.DuplicateException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.mapper.OptionMapper;
import com.decisionhub.mapper.UserMapper;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VoteServiceImpl implements VoteService {

    private final VoteRepository voteRepository;
    private final DecisionRepository decisionRepository;
    private final OptionRepository optionRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final OptionMapper optionMapper;

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
        Option option = optionRepository.findById(request.getOptionId())
                .orElseThrow(() -> new EntityNotFoundException("Option", "id", request.getOptionId()));

        if (decision.getStatus() != DecisionStatus.ACTIVE) {
            throw new BusinessException("Voting is closed for this decision board.");
        }
        if (decision.getDeadline() != null && decision.getDeadline().isBefore(LocalDateTime.now())) {
            throw new BusinessException("The voting deadline has expired.");
        }

        // Single Choice Check
        if (voter != null && decision.getVoteType() == VoteType.SINGLE) {
            if (voteRepository.existsByUserUserIdAndDecisionDecisionId(voter.getUserId(), decision.getDecisionId())) {
                throw new DuplicateException("You have already cast a vote on this single-choice decision board.");
            }
        }

        // Rating Scale Validation
        if (decision.getVoteType() == VoteType.RATING) {
            if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 10) {
                throw new BusinessException("Rating vote requires a score between 1 and 10.");
            }
            optionRepository.updateOptionScore(option.getOptionId(), BigDecimal.valueOf(request.getRating()));
        } else {
            optionRepository.updateOptionScore(option.getOptionId(), BigDecimal.ONE);
        }

        Vote vote = voteRepository.save(Vote.builder()
                .decision(decision)
                .option(option)
                .user(voter)
                .rating(request.getRating())
                .build());

        return VoteResponse.builder()
                .voteId(vote.getVoteId())
                .decisionId(decision.getDecisionId())
                .optionId(option.getOptionId())
                .voter(voter != null ? userMapper.toResponse(voter) : null)
                .rating(vote.getRating())
                .createdAt(vote.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public VoteResponse changeVote(Long userId, Long voteId, VoteRequest request) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new EntityNotFoundException("Vote", "id", voteId));

        if (vote.getUser() == null || !vote.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You can only modify your own registered vote.");
        }

        voteRepository.delete(vote);
        return castVote(userId, request);
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
            long count = voteRepository.countByOptionOptionId(opt.getOptionId());
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
