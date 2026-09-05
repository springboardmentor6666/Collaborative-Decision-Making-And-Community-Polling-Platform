package com.decisionhub.event;

import java.util.HashMap;
import java.util.Map;

public class ActivityEvent {

    private Long actorId;
    private String activityType;
    private String entityType;
    private Long entityId;
    private Long communityId;
    private String title;
    private Map<String, Object> metadata = new HashMap<>();
    private String visibility = "PUBLIC";

    public ActivityEvent() {
    }

    public ActivityEvent(Long actorId, String activityType, String entityType, Long entityId,
                         Long communityId, String title, Map<String, Object> metadata, String visibility) {
        this.actorId = actorId;
        this.activityType = activityType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.communityId = communityId;
        this.title = title;
        if (metadata != null) {
            this.metadata = metadata;
        }
        if (visibility != null && !visibility.isBlank()) {
            this.visibility = visibility;
        }
    }

    public Long getActorId() {
        return actorId;
    }

    public void setActorId(Long actorId) {
        this.actorId = actorId;
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

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }
}
