package com.decisionhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommunityRequest {

    @NotBlank(message = "Community name is required")
    @Size(max = 100)
    private String communityName;

    private String description;

    @Size(max = 100)
    private String category;

    public CommunityRequest() {}

    public String getCommunityName() { return communityName; }
    public void setCommunityName(String communityName) { this.communityName = communityName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
