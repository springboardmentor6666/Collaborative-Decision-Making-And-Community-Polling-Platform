package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.entity.Decision;
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
public class DecisionService {

    @Autowired private DecisionRepository decisionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private OptionRepository optionRepository;
    @Autowired private VoteRepository voteRepository;

    @Transactional
    public DecisionResponse createDecision(DecisionRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        Decision decision = new Decision(req.getTitle(), req.getDescription(), req.getCategory(), user);
        if (req.getStatus() != null) decision.setStatus(req.getStatus());
        if (req.getVisibility() != null) decision.setVisibility(req.getVisibility());
        Decision saved = decisionRepository.save(decision);
        return toResponse(saved);
    }

    public List<DecisionResponse> getAllPublicDecisions() {
        return decisionRepository.findByVisibility("PUBLIC").stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<DecisionResponse> getMyDecisions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        return decisionRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public DecisionResponse getDecisionById(Long id) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new CustomException("Decision not found", HttpStatus.NOT_FOUND));
        return toResponse(decision);
    }

    @Transactional
    public DecisionResponse updateDecision(Long id, DecisionRequest req, String userEmail) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new CustomException("Decision not found", HttpStatus.NOT_FOUND));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        if (!decision.getUser().getId().equals(user.getId()))
            throw new CustomException("You are not authorized to update this decision", HttpStatus.FORBIDDEN);
        decision.setTitle(req.getTitle());
        decision.setDescription(req.getDescription());
        decision.setCategory(req.getCategory());
        if (req.getStatus() != null) decision.setStatus(req.getStatus());
        if (req.getVisibility() != null) decision.setVisibility(req.getVisibility());
        return toResponse(decisionRepository.save(decision));
    }

    @Transactional
    public void deleteDecision(Long id, String userEmail) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new CustomException("Decision not found", HttpStatus.NOT_FOUND));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        if (!decision.getUser().getId().equals(user.getId()))
            throw new CustomException("You are not authorized to delete this decision", HttpStatus.FORBIDDEN);
        decisionRepository.delete(decision);
    }

    private DecisionResponse toResponse(Decision d) {
        DecisionResponse r = new DecisionResponse();
        r.setId(d.getId());
        r.setTitle(d.getTitle());
        r.setDescription(d.getDescription());
        r.setCategory(d.getCategory());
        r.setStatus(d.getStatus());
        r.setVisibility(d.getVisibility());
        r.setUserId(d.getUser().getId());
        r.setUsername(d.getUser().getUsername());
        r.setUserFullName(d.getUser().getFullName());
        r.setOptionCount(optionRepository.findByDecisionId(d.getId()).size());
        r.setCreatedAt(d.getCreatedAt());
        r.setUpdatedAt(d.getUpdatedAt());
        return r;
    }
}
