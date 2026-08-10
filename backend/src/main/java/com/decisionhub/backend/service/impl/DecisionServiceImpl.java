package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.service.DecisionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DecisionServiceImpl implements DecisionService {

    private final DecisionRepository decisionRepository;

    public DecisionServiceImpl(DecisionRepository decisionRepository) {
        this.decisionRepository = decisionRepository;
    }

    @Override
    public DecisionResponse createDecision(DecisionRequest request) {

        Decision decision = Decision.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .visibility(request.getVisibility())
                .build();

        Decision savedDecision = decisionRepository.save(decision);

        return DecisionResponse.builder()
                .id(savedDecision.getId())
                .title(savedDecision.getTitle())
                .description(savedDecision.getDescription())
                .visibility(savedDecision.getVisibility())
                .build();
    }

    @Override
    public List<DecisionResponse> getAllDecisions() {

        return decisionRepository.findAll()
                .stream()
                .map(decision -> DecisionResponse.builder()
                        .id(decision.getId())
                        .title(decision.getTitle())
                        .description(decision.getDescription())
                        .visibility(decision.getVisibility())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public DecisionResponse getDecisionById(Long id) {

        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Decision not found"));

        return DecisionResponse.builder()
                .id(decision.getId())
                .title(decision.getTitle())
                .description(decision.getDescription())
                .visibility(decision.getVisibility())
                .build();
    }

    @Override
    public DecisionResponse updateDecision(Long id, DecisionRequest request) {

        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Decision not found"));

        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        decision.setVisibility(request.getVisibility());

        Decision updatedDecision = decisionRepository.save(decision);

        return DecisionResponse.builder()
                .id(updatedDecision.getId())
                .title(updatedDecision.getTitle())
                .description(updatedDecision.getDescription())
                .visibility(updatedDecision.getVisibility())
                .build();
    }

    @Override
    public void deleteDecision(Long id) {

        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Decision not found"));

        decisionRepository.delete(decision);
    }
}