package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;

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
