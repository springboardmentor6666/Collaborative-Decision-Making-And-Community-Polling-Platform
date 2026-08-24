package com.decisionhub.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DecisionResponse {

    private Long id;
    private String title;
    private String description;
    private String visibility;
    private String status;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private UserResponse owner;
    private Long categoryId;
    private String categoryName;
    private Long communityId;
    private String communityName;
    private List<PollResponse> polls;
    private List<OptionDto> options;
    private List<ComparisonFactorDto> comparisonFactors;
    private List<OptionScoreDto> optionScores;

    public DecisionResponse() {
    }

    public DecisionResponse(Long id, String title, String description, String visibility, Boolean isDeleted,
                            LocalDateTime createdAt, UserResponse owner, Long categoryId, String categoryName,
                            List<PollResponse> polls) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.visibility = visibility;
        this.status = "OPEN";
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.owner = owner;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.polls = polls;
    }

    public DecisionResponse(Long id, String title, String description, String visibility, Boolean isDeleted,
                            LocalDateTime createdAt, UserResponse owner, Long categoryId, String categoryName,
                            Long communityId, String communityName, List<PollResponse> polls) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.visibility = visibility;
        this.status = "OPEN";
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.owner = owner;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.communityId = communityId;
        this.communityName = communityName;
        this.polls = polls;
    }

    public DecisionResponse(Long id, String title, String description, String visibility, String status,
                            Boolean isDeleted, LocalDateTime createdAt, UserResponse owner, Long categoryId,
                            String categoryName, Long communityId, String communityName, List<PollResponse> polls) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.visibility = visibility;
        this.status = status;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.owner = owner;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.communityId = communityId;
        this.communityName = communityName;
        this.polls = polls;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public UserResponse getOwner() {
        return owner;
    }

    public void setOwner(UserResponse owner) {
        this.owner = owner;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getCommunityId() {
        return communityId;
    }

    public void setCommunityId(Long communityId) {
        this.communityId = communityId;
    }

    public String getCommunityName() {
        return communityName;
    }

    public void setCommunityName(String communityName) {
        this.communityName = communityName;
    }

    public List<PollResponse> getPolls() {
        return polls;
    }

    public void setPolls(List<PollResponse> polls) {
        this.polls = polls;
    }

    public List<OptionDto> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDto> options) {
        this.options = options;
    }

    public List<ComparisonFactorDto> getComparisonFactors() {
        return comparisonFactors;
    }

    public void setComparisonFactors(List<ComparisonFactorDto> comparisonFactors) {
        this.comparisonFactors = comparisonFactors;
    }

    public List<OptionScoreDto> getOptionScores() {
        return optionScores;
    }

    public void setOptionScores(List<OptionScoreDto> optionScores) {
        this.optionScores = optionScores;
    }
}
