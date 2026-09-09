package com.decisionhub.dto;

import jakarta.validation.constraints.NotNull;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: TransferOwnershipRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for TransferOwnership operations.
 */

public class TransferOwnershipRequest {

    @NotNull(message = "New owner user ID is required")
    private Long newOwnerUserId;

    public TransferOwnershipRequest() {
    }

    public TransferOwnershipRequest(Long newOwnerUserId) {
        this.newOwnerUserId = newOwnerUserId;
    }

    public Long getNewOwnerUserId() {
        return newOwnerUserId;
    }

    public void setNewOwnerUserId(Long newOwnerUserId) {
        this.newOwnerUserId = newOwnerUserId;
    }
}
