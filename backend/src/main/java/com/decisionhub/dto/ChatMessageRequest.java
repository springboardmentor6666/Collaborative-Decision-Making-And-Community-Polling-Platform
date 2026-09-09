package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: ChatMessageRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for ChatMessage operations.
 */

public class ChatMessageRequest {

    @NotBlank(message = "Message content cannot be empty")
    @Size(max = 4000, message = "Message cannot exceed 4000 characters")
    private String content;

    private String messageType = "TEXT";

    private Long parentMessageId;

    public ChatMessageRequest() {
    }

    public ChatMessageRequest(String content) {
        this.content = content;
    }

    public ChatMessageRequest(String content, String messageType, Long parentMessageId) {
        this.content = content;
        this.messageType = messageType != null ? messageType : "TEXT";
        this.parentMessageId = parentMessageId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public Long getParentMessageId() {
        return parentMessageId;
    }

    public void setParentMessageId(Long parentMessageId) {
        this.parentMessageId = parentMessageId;
    }
}
