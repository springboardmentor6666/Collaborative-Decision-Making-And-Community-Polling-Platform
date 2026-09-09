package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: ChatReactionRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for ChatReaction operations.
 */

public class ChatReactionRequest {

    @NotBlank(message = "Emoji cannot be blank")
    private String emoji;

    public ChatReactionRequest() {
    }

    public ChatReactionRequest(String emoji) {
        this.emoji = emoji;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }
}
