package com.decisionhub.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class VoteRequest {

    @NotNull(message = "Poll ID is required")
    private Long pollId;

    private Long pollOptionId;

    private Integer rating;

    private Integer rankPosition;

    private List<Long> optionIds;

    private List<Long> rankedOptionIds;

    public VoteRequest() {
    }

    public VoteRequest(Long pollId, Long pollOptionId, Integer rating) {
        this.pollId = pollId;
        this.pollOptionId = pollOptionId;
        this.rating = rating;
    }

    public VoteRequest(Long pollId, Long pollOptionId, Integer rating, Integer rankPosition) {
        this.pollId = pollId;
        this.pollOptionId = pollOptionId;
        this.rating = rating;
        this.rankPosition = rankPosition;
    }

    public Long getPollId() {
        return pollId;
    }

    public void setPollId(Long pollId) {
        this.pollId = pollId;
    }

    public Long getPollOptionId() {
        return pollOptionId;
    }

    public void setPollOptionId(Long pollOptionId) {
        this.pollOptionId = pollOptionId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Integer getRankPosition() {
        return rankPosition;
    }

    public void setRankPosition(Integer rankPosition) {
        this.rankPosition = rankPosition;
    }

    public List<Long> getOptionIds() {
        return optionIds;
    }

    public void setOptionIds(List<Long> optionIds) {
        this.optionIds = optionIds;
    }

    public List<Long> getRankedOptionIds() {
        return rankedOptionIds;
    }

    public void setRankedOptionIds(List<Long> rankedOptionIds) {
        this.rankedOptionIds = rankedOptionIds;
    }
}
