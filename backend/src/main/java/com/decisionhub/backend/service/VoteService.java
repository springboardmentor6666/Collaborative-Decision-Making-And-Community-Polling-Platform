package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.VoteRequest;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Vote;
import com.decisionhub.backend.exception.CustomException;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class VoteService {

    @Autowired private VoteRepository voteRepository;
    @Autowired private DecisionRepository decisionRepository;
    @Autowired private OptionRepository optionRepository;
    @Autowired private UserRepository userRepository;

    @Transactional
    public void castVote(Long decisionId, VoteRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new CustomException("Decision not found", HttpStatus.NOT_FOUND));

        Option option = optionRepository.findById(req.getOptionId())
                .orElseThrow(() -> new CustomException("Option not found", HttpStatus.NOT_FOUND));

        if (!option.getDecision().getId().equals(decisionId)) {
            throw new CustomException("Option does not belong to this decision", HttpStatus.BAD_REQUEST);
        }

        // Check if user already voted on this decision
        Optional<Vote> existingVote = voteRepository.findByUserIdAndDecisionId(user.getId(), decisionId);
        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            // Update option
            vote.setOption(option);
            vote.setVoteType(req.getVoteType());
            voteRepository.save(vote);
        } else {
            Vote vote = new Vote(user, decision, option, req.getVoteType());
            voteRepository.save(vote);
        }

        // Optional: Recalculate options scores if desired
        updateOptionScores(decisionId);
    }

    @Transactional
    public void deleteVote(Long decisionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        
        Vote vote = voteRepository.findByUserIdAndDecisionId(user.getId(), decisionId)
                .orElseThrow(() -> new CustomException("Vote not found for this decision", HttpStatus.NOT_FOUND));

        voteRepository.delete(vote);
        updateOptionScores(decisionId);
    }

    public boolean hasUserVoted(Long decisionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        return voteRepository.findByUserIdAndDecisionId(user.getId(), decisionId).isPresent();
    }

    public Long getUserVotedOptionId(Long decisionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        return voteRepository.findByUserIdAndDecisionId(user.getId(), decisionId)
                .map(vote -> vote.getOption().getId())
                .orElse(null);
    }

    private void updateOptionScores(Long decisionId) {
        for (Option o : optionRepository.findByDecisionId(decisionId)) {
            long votes = voteRepository.countByOptionId(o.getId());
            o.setScore((int) votes);
            optionRepository.save(o);
        }
    }
}
