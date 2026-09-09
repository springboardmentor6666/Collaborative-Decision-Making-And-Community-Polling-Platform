package com.decisionhub.dto;

import jakarta.validation.constraints.NotNull;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: SaveDecisionRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for SaveDecision operations.
 */

public class SaveDecisionRequest {

    @NotNull(message = "Decision ID is required")
    private Long decisionId;

    public SaveDecisionRequest() {
    }

    public SaveDecisionRequest(Long decisionId) {
        this.decisionId = decisionId;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }
}
