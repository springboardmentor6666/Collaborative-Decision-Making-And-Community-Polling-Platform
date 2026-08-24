package com.decisionhub.dto;

import java.time.LocalDateTime;

public class CommunityInviteResponse {

    private Long id;
    private Long communityId;
    private String communityName;
    private UserResponse invitee;
    private UserResponse inviter;
    private String status;
    private LocalDateTime createdAt;

    public CommunityInviteResponse() {
    }

    public CommunityInviteResponse(Long id, Long communityId, String communityName, 
                                   UserResponse invitee, UserResponse inviter, 
                                   String status, LocalDateTime createdAt) {
        this.id = id;
        this.communityId = communityId;
        this.communityName = communityName;
        this.invitee = invitee;
        this.inviter = inviter;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCommunityId() {
        return communityId;
    }

    public void setCommunityId(Long communityId) {
        this.communityId = communityId;
    }

    public String getCommunityName() {
        return communityName;
    }

    public void setCommunityName(String communityName) {
        this.communityName = communityName;
    }

    public UserResponse getInvitee() {
        return invitee;
    }

    public void setInvitee(UserResponse invitee) {
        this.invitee = invitee;
    }

    public UserResponse getInviter() {
        return inviter;
    }

    public void setInviter(UserResponse inviter) {
        this.inviter = inviter;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
