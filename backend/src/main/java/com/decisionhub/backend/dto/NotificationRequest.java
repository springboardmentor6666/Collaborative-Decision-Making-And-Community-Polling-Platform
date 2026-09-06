package com.decisionhub.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class NotificationRequest {
    private Long decisionId;
    private Long communityId;

    @NotBlank
    private String notificationType;

    @NotBlank
    private String message;

    public NotificationRequest() {
    }

    public NotificationRequest(Long decisionId, Long communityId, String notificationType, String message) {
        this.decisionId = decisionId;
        this.communityId = communityId;
        this.notificationType = notificationType;
        this.message = message;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }

    public Long getCommunityId() {
        return communityId;
    }

    public void setCommunityId(Long communityId) {
        this.communityId = communityId;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
