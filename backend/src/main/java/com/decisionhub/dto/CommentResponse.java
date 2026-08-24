package com.decisionhub.dto;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private Long decisionId;
    private Long parentId;
    private String content;
    private LocalDateTime createdAt;
    private UserResponse author;
    private Boolean isFlagged;
    private Integer replyCount;
    private java.util.List<CommentResponse> replies = new java.util.ArrayList<>();

    public CommentResponse() {
    }

    public CommentResponse(Long id, Long decisionId, Long parentId, String content, 
                           LocalDateTime createdAt, UserResponse author, 
                           Boolean isFlagged, Integer replyCount) {
        this.id = id;
        this.decisionId = decisionId;
        this.parentId = parentId;
        this.content = content;
        this.createdAt = createdAt;
        this.author = author;
        this.isFlagged = isFlagged;
        this.replyCount = replyCount;
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

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public UserResponse getAuthor() {
        return author;
    }

    public void setAuthor(UserResponse author) {
        this.author = author;
    }

    public Boolean getIsFlagged() {
        return isFlagged;
    }

    public void setIsFlagged(Boolean isFlagged) {
        this.isFlagged = isFlagged;
    }

    public Integer getReplyCount() {
        return replyCount;
    }

    public void setReplyCount(Integer replyCount) {
        this.replyCount = replyCount;
    }

    public java.util.List<CommentResponse> getReplies() {
        return replies;
    }

    public void setReplies(java.util.List<CommentResponse> replies) {
        this.replies = replies;
    }
}
