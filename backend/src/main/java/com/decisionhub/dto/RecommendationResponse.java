package com.decisionhub.dto;

import java.time.LocalDateTime;

public class RecommendationResponse {

    private Long id;
    private Long decisionId;
    private Long recommendedOptionId;
    private String recommendedOptionLabel;
    private UserResponse expert;
    private String justification;
    private LocalDateTime createdAt;

    public RecommendationResponse() {
    }

    public RecommendationResponse(Long id, Long decisionId, Long recommendedOptionId, 
                                  String recommendedOptionLabel, UserResponse expert, 
                                  String justification, LocalDateTime createdAt) {
        this.id = id;
        this.decisionId = decisionId;
        this.recommendedOptionId = recommendedOptionId;
        this.recommendedOptionLabel = recommendedOptionLabel;
        this.expert = expert;
        this.justification = justification;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getRecommendedOptionLabel() {
        return recommendedOptionLabel;
    }

    public void setRecommendedOptionLabel(String recommendedOptionLabel) {
        this.recommendedOptionLabel = recommendedOptionLabel;
    }

    public UserResponse getExpert() {
        return expert;
    }

    public void setExpert(UserResponse expert) {
        this.expert = expert;
    }

    public String getJustification() {
        return justification;
    }

    public void setJustification(String justification) {
        this.justification = justification;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
