package com.decisionhub.dto;

public class TypingIndicatorDto {

    private Long userId;
    private String userName;
    private Boolean isTyping;

    public TypingIndicatorDto() {
    }

    public TypingIndicatorDto(Boolean isTyping) {
        this.isTyping = isTyping;
    }

    public TypingIndicatorDto(Long userId, String userName, Boolean isTyping) {
        this.userId = userId;
        this.userName = userName;
        this.isTyping = isTyping;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = id(userId);
    }

    private Long id(Long userId) {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Boolean getIsTyping() {
        return isTyping;
    }

    public void setIsTyping(Boolean isTyping) {
        this.isTyping = isTyping;
    }
}
