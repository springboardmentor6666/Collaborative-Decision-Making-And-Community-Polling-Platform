package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RecommendationRequest {

    @NotNull(message = "Decision ID is required")
    private Long decisionId;

    @NotNull(message = "Recommended Option ID is required")
    private Long recommendedOptionId;

    @NotBlank(message = "Justification cannot be blank")
    @Size(max = 2000, message = "Justification content must not exceed 2000 characters")
    private String justification;

    public RecommendationRequest() {
    }

    public RecommendationRequest(Long decisionId, Long recommendedOptionId, String justification) {
        this.decisionId = decisionId;
        this.recommendedOptionId = recommendedOptionId;
        this.justification = justification;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }

    public Long getRecommendedOptionId() {
        return recommendedOptionId;
    }

    public void setRecommendedOptionId(Long recommendedOptionId) {
        this.recommendedOptionId = recommendedOptionId;
    }

    public String getJustification() {
        return justification;
    }

    public void setJustification(String justification) {
        this.justification = justification;
    }
}
