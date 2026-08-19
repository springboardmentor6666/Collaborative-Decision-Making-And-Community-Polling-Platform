package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.VoteRequest;
import com.decisionhub.backend.service.NotificationService;
import com.decisionhub.backend.dto.VoteResponse;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Vote;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import com.decisionhub.backend.service.VoteService;
import com.decisionhub.backend.service.CurrentUserService;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class VoteServiceImpl implements VoteService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final OptionRepository optionRepository;
    private final CurrentUserService currentUser;
    private final NotificationService notificationService;

    public VoteServiceImpl(VoteRepository voteRepository,
                           UserRepository userRepository,
                           DecisionRepository decisionRepository,
                           OptionRepository optionRepository, CurrentUserService currentUser,
                           NotificationService notificationService) {
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.decisionRepository = decisionRepository;
        this.optionRepository = optionRepository;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
    }

    @Override
    public VoteResponse castVote(VoteRequest request) {

        User user = currentUser.get();
        if (voteRepository.findByUserIdAndDecisionId(
                user.getId(),
                request.getDecisionId()).isPresent()) {

            throw new RuntimeException("You have already voted.");
        }

        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new RuntimeException("Decision not found"));

        Option option = optionRepository.findById(request.getOptionId())
                .orElseThrow(() -> new RuntimeException("Option not found"));
        if (!option.getDecision().getId().equals(decision.getId())) throw new IllegalArgumentException("Option does not belong to this decision");
        if (decision.getDeadline() != null && decision.getDeadline().isBefore(java.time.LocalDate.now())) throw new IllegalStateException("This poll has already ended");

        Vote vote = Vote.builder()
                .user(user)
                .decision(decision)
                .option(option)
                .build();

        Vote savedVote;
        try { savedVote = voteRepository.saveAndFlush(vote); } catch (org.springframework.dao.DataIntegrityViolationException e) { throw new IllegalStateException("You have already voted on this poll"); }

        if (decision.getCreatedBy() != null && !decision.getCreatedBy().getId().equals(user.getId())) {
            notificationService.notifyUser(
                    decision.getCreatedBy(),
                    user.getName() + " voted on your decision \"" + decision.getTitle() + "\""
            );
        }

        return VoteResponse.builder()
                .id(savedVote.getId())
                .message("Vote Cast Successfully")
                .build();
    }

    @Override
    public Map<String, Long> getVoteResults(Long decisionId) {

        Map<String, Long> result = new LinkedHashMap<>();

        for (Option option : optionRepository.findByDecisionId(decisionId)) {

            long count = voteRepository.countByOptionId(option.getId());

            result.put(option.getOptionText(), count);
        }

        return result;
    }
}
