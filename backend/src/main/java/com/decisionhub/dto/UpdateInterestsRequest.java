package com.decisionhub.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

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
