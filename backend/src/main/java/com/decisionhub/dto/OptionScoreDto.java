package com.decisionhub.dto;

public class OptionScoreDto {
    private Long id;
    private Long optionId;
    private String optionLabel;
    private Long factorId;
    private String factorName;
    private Integer score;

    public OptionScoreDto() {
    }

    public OptionScoreDto(Long id, Long optionId, String optionLabel, Long factorId, String factorName, Integer score) {
        this.id = id;
        this.optionId = optionId;
        this.optionLabel = optionLabel;
        this.factorId = factorId;
        this.factorName = factorName;
        this.score = score;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getFactorId() {
        return factorId;
    }

    public void setFactorId(Long factorId) {
        this.factorId = factorId;
    }

    public String getFactorName() {
        return factorName;
    }

    public void setFactorName(String factorName) {
        this.factorName = factorName;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }
}
