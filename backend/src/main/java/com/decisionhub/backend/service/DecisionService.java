package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.dto.VoteResponse;

import java.util.List;

public interface DecisionService {

    DecisionResponse createDecision(DecisionRequest request);

    List<DecisionResponse> getMyDecisions();

    List<DecisionResponse> getActivePublicDecisions();

    DecisionResponse getDecisionById(Long id);

    DecisionResponse updateDecision(
            Long id,
            DecisionRequest request
    );

    void deleteDecision(Long id);

    VoteResponse vote(
            Long decisionId,
            Long optionId
    );
    DecisionResponse toResponse(com.decisionhub.backend.entity.Decision decision);
}
