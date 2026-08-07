package com.decisionhub.dto;

import java.util.List;

public class CreatorAnalyticsResponse {

    private long totalDecisionsPublished;
    private long totalReach;
    private long totalViews;
    private long totalVotes;
    private double overallConversionRate;
    private List<CreatorDecisionItemDto> decisions;

    public CreatorAnalyticsResponse() {
    }

    public CreatorAnalyticsResponse(long totalDecisionsPublished, long totalReach, long totalViews,
                                    long totalVotes, double overallConversionRate,
                                    List<CreatorDecisionItemDto> decisions) {
        this.totalDecisionsPublished = totalDecisionsPublished;
        this.totalReach = totalReach;
        this.totalViews = totalViews;
        this.totalVotes = totalVotes;
        this.overallConversionRate = overallConversionRate;
        this.decisions = decisions;
    }

    public long getTotalDecisionsPublished() {
        return totalDecisionsPublished;
    }

    public void setTotalDecisionsPublished(long totalDecisionsPublished) {
        this.totalDecisionsPublished = totalDecisionsPublished;
    }

    public long getTotalReach() {
        return totalReach;
    }

    public void setTotalReach(long totalReach) {
        this.totalReach = totalReach;
    }

    public long getTotalViews() {
        return totalViews;
    }

    public void setTotalViews(long totalViews) {
        this.totalViews = totalViews;
    }

    public long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public double getOverallConversionRate() {
        return overallConversionRate;
    }

    public void setOverallConversionRate(double overallConversionRate) {
        this.overallConversionRate = overallConversionRate;
    }

    public List<CreatorDecisionItemDto> getDecisions() {
        return decisions;
    }

    public void setDecisions(List<CreatorDecisionItemDto> decisions) {
        this.decisions = decisions;
    }
}
