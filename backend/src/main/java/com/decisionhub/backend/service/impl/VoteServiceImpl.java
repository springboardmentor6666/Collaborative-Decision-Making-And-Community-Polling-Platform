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
import com.decisionhub.backend.service.DecisionService;
import org.springframework.stereotype.Service;
import java.util.List;
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
    private final DecisionService decisionService;

    public VoteServiceImpl(VoteRepository voteRepository,
                           UserRepository userRepository,
                           DecisionRepository decisionRepository,
                           OptionRepository optionRepository, CurrentUserService currentUser,
                           NotificationService notificationService, DecisionService decisionService) {
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.decisionRepository = decisionRepository;
        this.optionRepository = optionRepository;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
        this.decisionService = decisionService;
    }

    @Override
    public VoteResponse castVote(VoteRequest request) {
        return decisionService.vote(request.getDecisionId(), request.getOptionId());
    }

    @Override
    public Map<String, Long> getVoteResults(Long decisionId) {
        decisionService.getDecisionById(decisionId);

        Map<String, Long> result = new LinkedHashMap<>();
        List<Option> options = optionRepository.findByDecisionId(decisionId);

        Map<Long, Long> countsByOption = new java.util.HashMap<>();
        for (Object[] row : voteRepository.countVotesByOptionIdForDecision(decisionId)) {
            countsByOption.put((Long) row[0], (Long) row[1]);
        }

        for (Option option : options) {
            result.put(option.getOptionText(), countsByOption.getOrDefault(option.getId(), 0L));
        }

        return result;
    }
}
