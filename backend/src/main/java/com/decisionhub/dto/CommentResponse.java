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
    private Integer upvotesCount = 0;
    private Integer downvotesCount = 0;
    private Integer score = 0;
    private String userReaction;
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
        this.upvotesCount = 0;
        this.downvotesCount = 0;
        this.score = 0;
    }

    public CommentResponse(Long id, Long decisionId, Long parentId, String content, 
                           LocalDateTime createdAt, UserResponse author, 
                           Boolean isFlagged, Integer replyCount,
                           Integer upvotesCount, Integer downvotesCount, Integer score, String userReaction) {
        this.id = id;
        this.decisionId = decisionId;
        this.parentId = parentId;
        this.content = content;
        this.createdAt = createdAt;
        this.author = author;
        this.isFlagged = isFlagged;
        this.replyCount = replyCount;
        this.upvotesCount = upvotesCount != null ? upvotesCount : 0;
        this.downvotesCount = downvotesCount != null ? downvotesCount : 0;
        this.score = score != null ? score : 0;
        this.userReaction = userReaction;
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

    public Integer getUpvotesCount() {
        return upvotesCount;
    }

    public void setUpvotesCount(Integer upvotesCount) {
        this.upvotesCount = upvotesCount;
    }

    public Integer getDownvotesCount() {
        return downvotesCount;
    }

    public void setDownvotesCount(Integer downvotesCount) {
        this.downvotesCount = downvotesCount;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getUserReaction() {
        return userReaction;
    }

    public void setUserReaction(String userReaction) {
        this.userReaction = userReaction;
    }

    public java.util.List<CommentResponse> getReplies() {
        return replies;
    }

    public void setReplies(java.util.List<CommentResponse> replies) {
        this.replies = replies;
    }
}
