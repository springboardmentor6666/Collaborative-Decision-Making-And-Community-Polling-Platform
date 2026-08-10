package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.dto.DecisionResponse;

import java.util.List;

public interface DecisionService {

    DecisionResponse createDecision(DecisionRequest request);

    List<DecisionResponse> getAllDecisions();

    DecisionResponse getDecisionById(Long id);

    DecisionResponse updateDecision(Long id, DecisionRequest request);

    void deleteDecision(Long id);
}