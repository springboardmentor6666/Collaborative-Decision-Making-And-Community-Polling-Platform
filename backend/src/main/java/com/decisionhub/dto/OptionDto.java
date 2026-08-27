package com.decisionhub.dto;

public class OptionDto {

    private Long id;
    private String label;
    private String description;
    private Long voteCount;
    private Double percentage;

    public OptionDto() {
    }

    public OptionDto(Long id, String label, String description) {
        this.id = id;
        this.label = label;
        this.description = description;
    }

    public OptionDto(Long id, String label, String description, Long voteCount) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.voteCount = voteCount;
    }

    public OptionDto(Long id, String label, String description, Long voteCount, Double percentage) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.voteCount = voteCount;
        this.percentage = percentage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getOptionText() {
        return label;
    }

    public void setOptionText(String optionText) {
        this.label = optionText;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(Long voteCount) {
        this.voteCount = voteCount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}
