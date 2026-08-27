package com.decisionhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class CommunityResponse {

    private Long id;
    private String name;
    private String description;
    private String visibility;
    private Long categoryId;
    private String categoryName;
    private UserResponse createdBy;
    private LocalDateTime createdAt;
    private long memberCount;

    @JsonProperty("isMember")
    private boolean isMember;

    private String currentUserRole;
    private long decisionCount;

    public CommunityResponse() {
    }

    public CommunityResponse(Long id, String name, String description, String visibility, Long categoryId,
                             String categoryName, UserResponse createdBy, LocalDateTime createdAt,
                             long memberCount, boolean isMember, String currentUserRole, long decisionCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.visibility = visibility;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.memberCount = memberCount;
        this.isMember = isMember;
        this.currentUserRole = currentUserRole;
        this.decisionCount = decisionCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public UserResponse getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserResponse createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(long memberCount) {
        this.memberCount = memberCount;
    }

    @JsonProperty("isMember")
    public boolean isMember() {
        return isMember;
    }

    public void setMember(boolean member) {
        isMember = member;
    }

    public String getCurrentUserRole() {
        return currentUserRole;
    }

    public void setCurrentUserRole(String currentUserRole) {
        this.currentUserRole = currentUserRole;
    }

    public long getDecisionCount() {
        return decisionCount;
    }

    public void setDecisionCount(long decisionCount) {
        this.decisionCount = decisionCount;
    }
}
