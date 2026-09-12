package com.decisionhub.backend.dto;

import java.time.LocalDateTime;

public class CommentDTO {

    private Long id;
    private Long decisionId;
    private Long userId;
    private String username;
    private String commentText;
    private LocalDateTime createdAt;

    public CommentDTO() {
    }

    public CommentDTO(Long id, Long decisionId, Long userId, String username, String commentText, LocalDateTime createdAt) {
        this.id = id;
        this.decisionId = decisionId;
        this.userId = userId;
        this.username = username;
        this.commentText = commentText;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
