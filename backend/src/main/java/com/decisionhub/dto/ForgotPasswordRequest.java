package com.decisionhub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: ForgotPasswordRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for ForgotPassword operations.
 */

public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    public ForgotPasswordRequest() {
    }

    public ForgotPasswordRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
