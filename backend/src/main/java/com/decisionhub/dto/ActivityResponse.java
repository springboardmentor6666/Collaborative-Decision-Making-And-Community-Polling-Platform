package com.decisionhub.dto;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class ActivityResponse {

    private Long id;
    private UserSummaryDto actor;
    private String activityType;
    private String entityType;
    private Long entityId;
    private Long communityId;
    private String communityName;
    private String title;
    private Map<String, Object> metadata = new HashMap<>();
    private LocalDateTime createdAt;

    public ActivityResponse() {
    }

    public ActivityResponse(Long id, UserSummaryDto actor, String activityType, String entityType,
                            Long entityId, Long communityId, String communityName, String title,
                            Map<String, Object> metadata, LocalDateTime createdAt) {
        this.id = id;
        this.actor = actor;
        this.activityType = activityType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.communityId = communityId;
        this.communityName = communityName;
        this.title = title;
        if (metadata != null) {
            this.metadata = metadata;
        }
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserSummaryDto getActor() {
        return actor;
    }

    public void setActor(UserSummaryDto actor) {
        this.actor = actor;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
