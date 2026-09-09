package com.decisionhub.dto;

import jakarta.validation.constraints.Size;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: UserProfileUpdateRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for UserProfileUpdate operations.
 */

public class UserProfileUpdateRequest {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    @Size(max = 255, message = "Avatar URL must not exceed 255 characters")
    private String avatar;

    public UserProfileUpdateRequest() {
    }

    public UserProfileUpdateRequest(String name, String bio, String avatar) {
        this.name = name;
        this.bio = bio;
        this.avatar = avatar;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
