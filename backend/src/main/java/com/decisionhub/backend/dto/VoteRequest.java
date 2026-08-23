package com.decisionhub.backend.dto;

import jakarta.validation.constraints.NotNull;

public class VoteRequest {

    @NotNull(message = "Option ID is required")
    private Long optionId;

    private String voteType = "VOTE";

    public VoteRequest() {}

    public Long getOptionId() { return optionId; }
    public void setOptionId(Long optionId) { this.optionId = optionId; }
    public String getVoteType() { return voteType; }
    public void setVoteType(String voteType) { this.voteType = voteType; }
}
