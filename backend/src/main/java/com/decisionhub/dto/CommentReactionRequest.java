package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentReactionRequest {

    @NotBlank(message = "Reaction type is required")
    private String reactionType;

    public CommentReactionRequest() {
    }

    public CommentReactionRequest(String reactionType) {
        this.reactionType = reactionType;
    }

    public String getReactionType() {
        return reactionType;
    }

    public void setReactionType(String reactionType) {
        this.reactionType = reactionType;
    }
}
