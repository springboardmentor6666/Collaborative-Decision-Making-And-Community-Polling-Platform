package com.decisionhub.dto;

import java.time.LocalDateTime;

public class ReportDetailResponse {

    private Long id;
    private String contentType; // DECISION, COMMENT, DISCUSSION, USER
    private Long contentId;
    private String reason;
    private String description;
    private String status; // PENDING, REVIEWED, RESOLVED, NO_ACTION, TEMPORARILY_REMOVED, CONTENT_REMOVED
    private String moderationAction;
    private String moderationReason;

    // Reporter Details
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;
    private String reporterAvatar;

    // Reported User / Creator Details
    private Long reportedUserId;
    private String reportedUserName;
    private String reportedUserEmail;
    private String reportedUserAvatar;

    // Content Snapshot Preview
    private String contentTitle;
    private String contentSnippet;
    private String contentStatus;
    private String contentUrl;
    private boolean contentExists;
    private boolean contentTemporarilyHidden;

    // Review Details
    private String reviewedByEmail;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReportDetailResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getModerationAction() {
        return moderationAction;
    }

    public void setModerationAction(String moderationAction) {
        this.moderationAction = moderationAction;
    }

    public String getModerationReason() {
        return moderationReason;
    }

    public void setModerationReason(String moderationReason) {
        this.moderationReason = moderationReason;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public String getReporterEmail() {
        return reporterEmail;
    }

    public void setReporterEmail(String reporterEmail) {
        this.reporterEmail = reporterEmail;
    }

    public String getReporterAvatar() {
        return reporterAvatar;
    }

    public void setReporterAvatar(String reporterAvatar) {
        this.reporterAvatar = reporterAvatar;
    }

    public Long getReportedUserId() {
        return reportedUserId;
    }

    public void setReportedUserId(Long reportedUserId) {
        this.reportedUserId = reportedUserId;
    }

    public String getReportedUserName() {
        return reportedUserName;
    }

    public void setReportedUserName(String reportedUserName) {
        this.reportedUserName = reportedUserName;
    }

    public String getReportedUserEmail() {
        return reportedUserEmail;
    }

    public void setReportedUserEmail(String reportedUserEmail) {
        this.reportedUserEmail = reportedUserEmail;
    }

    public String getReportedUserAvatar() {
        return reportedUserAvatar;
    }

    public void setReportedUserAvatar(String reportedUserAvatar) {
        this.reportedUserAvatar = reportedUserAvatar;
    }

    public String getContentTitle() {
        return contentTitle;
    }

    public void setContentTitle(String contentTitle) {
        this.contentTitle = contentTitle;
    }

    public String getContentSnippet() {
        return contentSnippet;
    }

    public void setContentSnippet(String contentSnippet) {
        this.contentSnippet = contentSnippet;
    }

    public String getContentStatus() {
        return contentStatus;
    }

    public void setContentStatus(String contentStatus) {
        this.contentStatus = contentStatus;
    }

    public String getContentUrl() {
        return contentUrl;
    }

    public void setContentUrl(String contentUrl) {
        this.contentUrl = contentUrl;
    }

    public boolean isContentExists() {
        return contentExists;
    }

    public void setContentExists(boolean contentExists) {
        this.contentExists = contentExists;
    }

    public boolean isContentTemporarilyHidden() {
        return contentTemporarilyHidden;
    }

    public void setContentTemporarilyHidden(boolean contentTemporarilyHidden) {
        this.contentTemporarilyHidden = contentTemporarilyHidden;
    }

    public String getReviewedByEmail() {
        return reviewedByEmail;
    }

    public void setReviewedByEmail(String reviewedByEmail) {
        this.reviewedByEmail = reviewedByEmail;
    }

    public String getReviewedByName() {
        return reviewedByName;
    }

    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
