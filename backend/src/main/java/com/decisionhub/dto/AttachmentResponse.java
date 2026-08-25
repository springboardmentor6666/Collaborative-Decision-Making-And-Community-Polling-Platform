package com.decisionhub.dto;

import java.time.LocalDateTime;

public class AttachmentResponse {

    private Long id;
    private String filename;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private Long decisionId;
    private Long commentId;
    private UserResponse uploadedBy;
    private LocalDateTime createdAt;

    public AttachmentResponse() {
    }

    public AttachmentResponse(Long id, String filename, String fileUrl, String fileType, Long fileSize, Long decisionId, Long commentId, UserResponse uploadedBy, LocalDateTime createdAt) {
        this.id = id;
        this.filename = filename;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.decisionId = decisionId;
        this.commentId = commentId;
        this.uploadedBy = uploadedBy;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public UserResponse getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(UserResponse uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
