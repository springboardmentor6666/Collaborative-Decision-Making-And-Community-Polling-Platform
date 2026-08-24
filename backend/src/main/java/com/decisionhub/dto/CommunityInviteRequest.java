package com.decisionhub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

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
