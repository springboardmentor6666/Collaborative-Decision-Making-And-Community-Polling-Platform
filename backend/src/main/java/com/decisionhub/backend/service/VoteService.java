package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.VoteDTO;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Vote;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class VoteService {

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private OptionRepository optionRepository;

    public VoteDTO castVote(Long decisionId, Long optionId, String username, String voteType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new RuntimeException("Decision not found: " + decisionId));

        Option option = optionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Option not found: " + optionId));

        // Check if user already voted on this decision; if so, update their vote to the new option
        Optional<Vote> existingVote = voteRepository.findByUserIdAndDecisionId(user.getId(), decisionId);
        Vote vote;
        if (existingVote.isPresent()) {
            vote = existingVote.get();
            vote.setOption(option);
            vote.setVoteType(voteType != null ? voteType : "SINGLE");
        } else {
            vote = new Vote(user, decision, option, voteType != null ? voteType : "SINGLE");
        }

        Vote saved = voteRepository.save(vote);

        // Update score of the option
        option.setScore((int) voteRepository.countByOptionId(option.getId()));
        optionRepository.save(option);

        return new VoteDTO(saved.getId(), user.getId(), decision.getId(), option.getId(), saved.getVoteType(), saved.getCreatedAt());
    }

    public VoteDTO getUserVoteForDecision(Long decisionId, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return null;

        return voteRepository.findByUserIdAndDecisionId(user.getId(), decisionId)
                .map(v -> new VoteDTO(v.getId(), v.getUser().getId(), v.getDecision().getId(), v.getOption().getId(), v.getVoteType(), v.getCreatedAt()))
                .orElse(null);
    }
}
