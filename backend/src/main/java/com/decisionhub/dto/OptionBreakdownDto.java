package com.decisionhub.dto;

public class OptionBreakdownDto {

    private Long optionId;
    private String optionText;
    private long voteCount;
    private double percentage;

    public OptionBreakdownDto() {
    }

    public OptionBreakdownDto(Long optionId, String optionText, long voteCount, double percentage) {
        this.optionId = optionId;
        this.optionText = optionText;
        this.voteCount = voteCount;
        this.percentage = percentage;
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

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
