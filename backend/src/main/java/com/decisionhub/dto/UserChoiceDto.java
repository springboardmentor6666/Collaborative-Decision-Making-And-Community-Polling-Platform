package com.decisionhub.dto;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: UserChoiceDto
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Data transfer object transferring UserChoiceDto state across architectural boundaries.
 */

public class UserChoiceDto {

    private Long optionId;
    private String optionText;

    public UserChoiceDto() {
    }

    public UserChoiceDto(Long optionId, String optionText) {
        this.optionId = optionId;
        this.optionText = optionText;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }
}
