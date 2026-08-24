package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SuggestionRequest {

    @NotNull(message = "Decision ID is required")
    private Long decisionId;

    @NotBlank(message = "Suggestion content cannot be blank")
    @Size(max = 1000, message = "Suggestion content must not exceed 1000 characters")
    private String content;

    public SuggestionRequest() {
    }

    public SuggestionRequest(Long decisionId, String content) {
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
