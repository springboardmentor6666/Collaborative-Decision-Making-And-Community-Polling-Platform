package com.decisionhub.dto;

import java.time.LocalDateTime;

public class CommunityMemberResponse {

    private Long id;
    private Long communityId;
    private UserResponse user;
    private String role;
    private LocalDateTime joinedAt;

    public CommunityMemberResponse() {
    }

    public CommunityMemberResponse(Long id, Long communityId, UserResponse user, String role, LocalDateTime joinedAt) {
        this.id = id;
        this.communityId = communityId;
        this.user = user;
        this.role = role;
        this.joinedAt = joinedAt;
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

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
