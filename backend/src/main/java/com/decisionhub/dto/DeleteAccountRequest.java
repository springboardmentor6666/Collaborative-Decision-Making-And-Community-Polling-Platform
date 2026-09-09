package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: DeleteAccountRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for DeleteAccount operations.
 */

public class DeleteAccountRequest {

    @NotBlank(message = "Confirmation phrase is required")
    private String confirmation;

    public DeleteAccountRequest() {
    }

    public DeleteAccountRequest(String confirmation) {
        this.confirmation = confirmation;
    }

    public String getConfirmation() {
        return confirmation;
    }

    public void setConfirmation(String confirmation) {
        this.confirmation = confirmation;
    }
}
