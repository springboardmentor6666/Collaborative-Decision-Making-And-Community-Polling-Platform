package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CommentRequest {

    @NotNull(message = "Decision ID is required")
    private Long decisionId;

    @NotBlank(message = "Comment content cannot be empty")
    @Size(max = 2000, message = "Comment must not exceed 2000 characters")
    private String content;

    public CommentRequest() {
    }

    public CommentRequest(Long decisionId, String content) {
        this.decisionId = decisionId;
        this.content = content;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
