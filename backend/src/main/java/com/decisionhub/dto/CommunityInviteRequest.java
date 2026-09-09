package com.decisionhub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CommunityInviteRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for CommunityInvite operations.
 */

public class CommunityInviteRequest {

    @NotBlank(message = "Invitee email is required")
    @Email(message = "Invitee email must be a valid email address")
    private String inviteeEmail;

    public CommunityInviteRequest() {
    }

    public CommunityInviteRequest(String inviteeEmail) {
        this.inviteeEmail = inviteeEmail;
    }

    public String getInviteeEmail() {
        return inviteeEmail;
    }

    public void setInviteeEmail(String inviteeEmail) {
        this.inviteeEmail = inviteeEmail;
    }
}
