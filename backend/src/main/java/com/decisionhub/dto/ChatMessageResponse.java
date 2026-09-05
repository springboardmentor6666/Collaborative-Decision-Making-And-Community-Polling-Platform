package com.decisionhub.dto;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ChatMessageResponse {

    private Long id;
    private Long channelId;
    private UserSummaryDto sender;
    private String content;
    private String messageType;
    private Boolean isPinned;
    private Boolean isEdited;
    private Boolean isDeleted;
    private Long parentMessageId;
    private Map<String, List<String>> reactions = new LinkedHashMap<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ChatMessageResponse() {
    }

    public ChatMessageResponse(Long id, Long channelId, UserSummaryDto sender, String content,
                               String messageType, Boolean isPinned, Boolean isEdited,
                               Long parentMessageId, Map<String, List<String>> reactions,
                               LocalDateTime createdAt) {
        this.id = id;
        this.channelId = channelId;
        this.sender = sender;
        this.content = content;
        this.messageType = messageType;
        this.isPinned = isPinned;
        this.isEdited = isEdited;
        this.parentMessageId = parentMessageId;
        if (reactions != null) {
            this.reactions = reactions;
        }
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getChannelId() {
        return channelId;
    }

    public void setChannelId(Long channelId) {
        this.channelId = channelId;
    }

    public UserSummaryDto getSender() {
        return sender;
    }

    public void setSender(UserSummaryDto sender) {
        this.sender = sender;
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

    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
    }

    public Boolean getIsEdited() {
        return isEdited;
    }

    public void setIsEdited(Boolean isEdited) {
        this.isEdited = isEdited;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Long getParentMessageId() {
        return parentMessageId;
    }

    public void setParentMessageId(Long parentMessageId) {
        this.parentMessageId = parentMessageId;
    }

    public Map<String, List<String>> getReactions() {
        return reactions;
    }

    public void setReactions(Map<String, List<String>> reactions) {
        this.reactions = reactions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
