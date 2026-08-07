package com.decisionhub.dto;

import java.util.List;

public class CreatorDecisionItemDto {

    private Long decisionId;
    private String title;
    private long reach;
    private long views;
    private long votesCount;
    private double conversionRate;
    private List<OptionBreakdownDto> optionsDistribution;

    public CreatorDecisionItemDto() {
    }

    public CreatorDecisionItemDto(Long decisionId, String title, long reach, long views,
                                  long votesCount, double conversionRate,
                                  List<OptionBreakdownDto> optionsDistribution) {
        this.decisionId = decisionId;
        this.title = title;
        this.reach = reach;
        this.views = views;
        this.votesCount = votesCount;
        this.conversionRate = conversionRate;
        this.optionsDistribution = optionsDistribution;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public long getReach() {
        return reach;
    }

    public void setReach(long reach) {
        this.reach = reach;
    }

    public long getViews() {
        return views;
    }

    public void setViews(long views) {
        this.views = views;
    }

    public long getVotesCount() {
        return votesCount;
    }

    public void setVotesCount(long votesCount) {
        this.votesCount = votesCount;
    }

    public double getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(double conversionRate) {
        this.conversionRate = conversionRate;
    }

    public List<OptionBreakdownDto> getOptionsDistribution() {
        return optionsDistribution;
    }

    public void setOptionsDistribution(List<OptionBreakdownDto> optionsDistribution) {
        this.optionsDistribution = optionsDistribution;
    }
}
