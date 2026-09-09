package com.decisionhub.dto;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: OptionRatingSummaryDto
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Data transfer object transferring OptionRatingSummaryDto state across architectural boundaries.
 */

public class OptionRatingSummaryDto {

    private Long optionId;
    private String optionLabel;
    private Double averageRating;
    private Long voteCount;

    public OptionRatingSummaryDto() {
    }

    public OptionRatingSummaryDto(Long optionId, String optionLabel, Double averageRating, Long voteCount) {
        this.optionId = optionId;
        this.optionLabel = optionLabel;
        this.averageRating = averageRating;
        this.voteCount = voteCount;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

    public String getOptionLabel() {
        return optionLabel;
    }

    public void setOptionLabel(String optionLabel) {
        this.optionLabel = optionLabel;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(Long voteCount) {
        this.voteCount = voteCount;
    }
}
