package com.decisionhub.backend.dto;

import java.time.LocalDateTime;

public class CommunityResponse {
    private Long id;
    private String communityName;
    private String description;
    private String category;
    private Integer memberCount;
    private Long moderatorId;
    private String moderatorName;
    private boolean isMember;
    private LocalDateTime createdAt;

    public CommunityResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCommunityName() { return communityName; }
    public void setCommunityName(String communityName) { this.communityName = communityName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }
    public Long getModeratorId() { return moderatorId; }
    public void setModeratorId(Long moderatorId) { this.moderatorId = moderatorId; }
    public String getModeratorName() { return moderatorName; }
    public void setModeratorName(String moderatorName) { this.moderatorName = moderatorName; }
    public boolean isMember() { return isMember; }
    public void setMember(boolean member) { isMember = member; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
