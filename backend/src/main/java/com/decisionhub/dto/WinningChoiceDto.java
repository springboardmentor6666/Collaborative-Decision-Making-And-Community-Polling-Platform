package com.decisionhub.dto;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: WinningChoiceDto
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Data transfer object transferring WinningChoiceDto state across architectural boundaries.
 */

public class WinningChoiceDto {

    private Long optionId;
    private String optionText;
    private long voteCount;

    public WinningChoiceDto() {
    }

    public WinningChoiceDto(Long optionId, String optionText, long voteCount) {
        this.optionId = optionId;
        this.optionText = optionText;
        this.voteCount = voteCount;
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

    public long getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(long voteCount) {
        this.voteCount = voteCount;
    }
}
