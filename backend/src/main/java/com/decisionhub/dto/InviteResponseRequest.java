package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: InviteResponseRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for InviteResponse operations.
 */

public class InviteResponseRequest {

    @NotBlank(message = "Response is required")
    @Pattern(regexp = "^(?i)(ACCEPT|REJECT)$", message = "Response must be ACCEPT or REJECT")
    private String response;

    public InviteResponseRequest() {
    }

    public InviteResponseRequest(String response) {
        this.response = response;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}
