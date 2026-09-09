package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: UpdateMemberRoleRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for UpdateMemberRole operations.
 */

public class UpdateMemberRoleRequest {

    @NotBlank(message = "Role is required")
    private String role;

    public UpdateMemberRoleRequest() {
    }

    public UpdateMemberRoleRequest(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
