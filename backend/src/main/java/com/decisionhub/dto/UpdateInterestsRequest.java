package com.decisionhub.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: UpdateInterestsRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for UpdateInterests operations.
 */

public class UpdateInterestsRequest {

    @NotNull(message = "Category IDs list is required")
    private List<Long> categoryIds;

    public UpdateInterestsRequest() {
    }

    public UpdateInterestsRequest(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }

    public List<Long> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }
}
