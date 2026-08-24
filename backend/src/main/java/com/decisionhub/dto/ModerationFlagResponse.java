package com.decisionhub.dto;

public class ModerationFlagResponse {

    private Long id;
    private String targetType;
    private Long targetId;
    private UserResponse reportedBy;
    private String reason;
    private String status;

    public ModerationFlagResponse() {
    }

    public ModerationFlagResponse(Long id, String targetType, Long targetId, 
                                  UserResponse reportedBy, String reason, String status) {
        this.id = id;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reportedBy = reportedBy;
        this.reason = reason;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public UserResponse getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(UserResponse reportedBy) {
        this.reportedBy = reportedBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
