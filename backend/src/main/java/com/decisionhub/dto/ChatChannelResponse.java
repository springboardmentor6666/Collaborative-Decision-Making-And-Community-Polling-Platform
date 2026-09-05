package com.decisionhub.dto;

import java.time.LocalDateTime;

public class ChatChannelResponse {

    private Long id;
    private Long communityId;
    private String name;
    private String description;
    private Boolean isDefault;
    private UserSummaryDto createdBy;
    private LocalDateTime createdAt;

    public ChatChannelResponse() {
    }

    public ChatChannelResponse(Long id, Long communityId, String name, String description,
                               Boolean isDefault, UserSummaryDto createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.communityId = communityId;
        this.name = name;
        this.description = description;
        this.isDefault = isDefault;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCommunityId() {
        return communityId;
    }

    public void setCommunityId(Long communityId) {
        this.communityId = communityId;
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

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public UserSummaryDto getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserSummaryDto createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
