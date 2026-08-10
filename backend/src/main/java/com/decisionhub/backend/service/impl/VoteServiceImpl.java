package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.VoteRequest;
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
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class VoteServiceImpl implements VoteService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final OptionRepository optionRepository;

    public VoteServiceImpl(VoteRepository voteRepository,
                           UserRepository userRepository,
                           DecisionRepository decisionRepository,
                           OptionRepository optionRepository) {
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.decisionRepository = decisionRepository;
        this.optionRepository = optionRepository;
    }

    @Override
    public VoteResponse castVote(VoteRequest request) {

        if (voteRepository.findByUserIdAndDecisionId(
                request.getUserId(),
                request.getDecisionId()).isPresent()) {

            throw new RuntimeException("You have already voted.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new RuntimeException("Decision not found"));

        Option option = optionRepository.findById(request.getOptionId())
                .orElseThrow(() -> new RuntimeException("Option not found"));

        Vote vote = Vote.builder()
                .user(user)
                .decision(decision)
                .option(option)
                .build();

        Vote savedVote = voteRepository.save(vote);

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