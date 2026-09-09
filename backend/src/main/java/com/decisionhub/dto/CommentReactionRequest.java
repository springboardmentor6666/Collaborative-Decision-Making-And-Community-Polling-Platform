package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CommentReactionRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for CommentReaction operations.
 */

public class CommentReactionRequest {

    @NotBlank(message = "Reaction type is required")
    @com.fasterxml.jackson.annotation.JsonProperty("reactionType")
    @com.fasterxml.jackson.annotation.JsonAlias({"type", "reaction_type"})
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
