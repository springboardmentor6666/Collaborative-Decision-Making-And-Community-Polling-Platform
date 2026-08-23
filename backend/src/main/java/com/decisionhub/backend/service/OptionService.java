package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.OptionRequest;
import com.decisionhub.backend.dto.OptionResponse;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.exception.CustomException;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OptionService {

    @Autowired private OptionRepository optionRepository;
    @Autowired private DecisionRepository decisionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private VoteRepository voteRepository;

    @Transactional
    public OptionResponse addOption(Long decisionId, OptionRequest req, String userEmail) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new CustomException("Decision not found", HttpStatus.NOT_FOUND));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        if (!decision.getUser().getId().equals(user.getId())) {
            throw new CustomException("You are not authorized to add options to this decision", HttpStatus.FORBIDDEN);
        }

        Option option = new Option(decision, req.getOptionTitle(), req.getDescription(), req.getPros(), req.getCons());
        Option saved = optionRepository.save(option);
        return toResponse(saved);
    }

    public List<OptionResponse> getOptionsByDecision(Long decisionId) {
        return optionRepository.findByDecisionId(decisionId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OptionResponse updateOption(Long optionId, OptionRequest req, String userEmail) {
        Option option = optionRepository.findById(optionId)
                .orElseThrow(() -> new CustomException("Option not found", HttpStatus.NOT_FOUND));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        if (!option.getDecision().getUser().getId().equals(user.getId())) {
            throw new CustomException("You are not authorized to update options for this decision", HttpStatus.FORBIDDEN);
        }

        option.setOptionTitle(req.getOptionTitle());
        option.setDescription(req.getDescription());
        option.setPros(req.getPros());
        option.setCons(req.getCons());
        
        Option saved = optionRepository.save(option);
        return toResponse(saved);
    }

    @Transactional
    public void deleteOption(Long optionId, String userEmail) {
        Option option = optionRepository.findById(optionId)
                .orElseThrow(() -> new CustomException("Option not found", HttpStatus.NOT_FOUND));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        if (!option.getDecision().getUser().getId().equals(user.getId())) {
            throw new CustomException("You are not authorized to delete options from this decision", HttpStatus.FORBIDDEN);
        }

        optionRepository.delete(option);
    }

    private OptionResponse toResponse(Option o) {
        OptionResponse r = new OptionResponse();
        r.setId(o.getId());
        r.setDecisionId(o.getDecision().getId());
        r.setOptionTitle(o.getOptionTitle());
        r.setDescription(o.getDescription());
        r.setPros(o.getPros());
        r.setCons(o.getCons());
        r.setScore(o.getScore());
        r.setRanking(o.getRanking());
        r.setVoteCount(voteRepository.countByOptionId(o.getId()));
        r.setCreatedAt(o.getCreatedAt());
        return r;
    }
}
