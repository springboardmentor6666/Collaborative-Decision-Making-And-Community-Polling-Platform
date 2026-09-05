package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

public class DecisionRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String visibility = "PUBLIC";

    private Long categoryId;

    private Long communityId;

    // Embedded poll creation fields (optional)
    private String pollType;
    private String votingMethod;
    private Integer maxChoices;
    private Boolean allowRevoting;
    private String pollQuestion;
    private Boolean isAnonymous;
    private List<String> optionLabels;

    // Status field (optional, e.g., OPEN, CLOSED, EXPIRED)
    private String status;

    // Auto-close & expiration fields (optional)
    private Boolean autoClose = false;
    private LocalDateTime endsAt;

    // Multi-criteria comparison factors and option scores (optional)
    private List<String> comparisonFactorNames;
    private List<OptionScoreDto> optionScores;

    public DecisionRequest() {
    }

    public DecisionRequest(String title, String description, String visibility, Long categoryId,
                           String pollType, Boolean isAnonymous, List<String> optionLabels) {
        this.title = title;
        this.description = description;
        this.visibility = visibility;
        this.categoryId = categoryId;
        this.pollType = pollType;
        this.isAnonymous = isAnonymous;
        this.optionLabels = optionLabels;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getCommunityId() {
        return communityId;
    }

    public void setCommunityId(Long communityId) {
        this.communityId = communityId;
    }

    public String getPollType() {
        return pollType;
    }

    public void setPollType(String pollType) {
        this.pollType = pollType;
    }

    public String getVotingMethod() {
        return votingMethod;
    }

    public void setVotingMethod(String votingMethod) {
        this.votingMethod = votingMethod;
    }

    public Integer getMaxChoices() {
        return maxChoices;
    }

    public void setMaxChoices(Integer maxChoices) {
        this.maxChoices = maxChoices;
    }

    public Boolean getAllowRevoting() {
        return allowRevoting;
    }

    public void setAllowRevoting(Boolean allowRevoting) {
        this.allowRevoting = allowRevoting;
    }

    public String getPollQuestion() {
        return pollQuestion;
    }

    public void setPollQuestion(String pollQuestion) {
        this.pollQuestion = pollQuestion;
    }

    public Boolean getIsAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }

    public List<String> getOptionLabels() {
        return optionLabels;
    }

    public void setOptionLabels(List<String> optionLabels) {
        this.optionLabels = optionLabels;
    }

    public List<String> getComparisonFactorNames() {
        return comparisonFactorNames;
    }

    public void setComparisonFactorNames(List<String> comparisonFactorNames) {
        this.comparisonFactorNames = comparisonFactorNames;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getAutoClose() {
        return autoClose;
    }

    public void setAutoClose(Boolean autoClose) {
        this.autoClose = autoClose;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }

    public List<OptionScoreDto> getOptionScores() {
        return optionScores;
    }

    public void setOptionScores(List<OptionScoreDto> optionScores) {
        this.optionScores = optionScores;
    }
}
