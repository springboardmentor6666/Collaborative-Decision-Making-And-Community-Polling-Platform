package com.decisionhub.dto;

import jakarta.validation.constraints.NotNull;

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
