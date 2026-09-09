package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CommunityRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for Community operations.
 */

public class CommunityRequest {

    @NotBlank(message = "Community name is required")
    @Size(min = 3, max = 100, message = "Community name must be between 3 and 100 characters")
    private String name;

    private String description;

    private String visibility = "PUBLIC";

    private Long categoryId;

    public CommunityRequest() {
    }

    public CommunityRequest(String name, String description, String visibility, Long categoryId) {
        this.name = name;
        this.description = description;
        this.visibility = visibility;
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}
