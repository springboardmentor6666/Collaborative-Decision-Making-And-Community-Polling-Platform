package com.decisionhub.dto;

import java.time.LocalDateTime;

public class SuggestionResponse {

    private Long id;
    private Long decisionId;
    private UserResponse user;
    private String content;
    private LocalDateTime createdAt;

    public SuggestionResponse() {
    }

    public SuggestionResponse(Long id, Long decisionId, UserResponse user, String content, LocalDateTime createdAt) {
        this.id = id;
        this.decisionId = decisionId;
        this.user = user;
        this.content = content;
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

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
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
}
