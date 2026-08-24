package com.decisionhub.dto;

import java.util.List;

public class PollRatingSummaryResponse {

    private Long pollId;
    private Double overallAverage;
    private Long totalVotes;
    private List<OptionRatingSummaryDto> optionRatings;

    public PollRatingSummaryResponse() {
    }

    public PollRatingSummaryResponse(Long pollId, Double overallAverage, Long totalVotes, List<OptionRatingSummaryDto> optionRatings) {
        this.pollId = pollId;
        this.overallAverage = overallAverage;
        this.totalVotes = totalVotes;
        this.optionRatings = optionRatings;
    }

    public Long getPollId() {
        return pollId;
    }

    public void setPollId(Long pollId) {
        this.pollId = pollId;
    }

    public Double getOverallAverage() {
        return overallAverage;
    }

    public void setOverallAverage(Double overallAverage) {
        this.overallAverage = overallAverage;
    }

    public Long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(Long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public List<OptionRatingSummaryDto> getOptionRatings() {
        return optionRatings;
    }

    public void setOptionRatings(List<OptionRatingSummaryDto> optionRatings) {
        this.optionRatings = optionRatings;
    }
}
