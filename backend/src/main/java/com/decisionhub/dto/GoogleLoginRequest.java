package com.decisionhub.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: GoogleLoginRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for GoogleLogin operations.
 */

public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token is required")
    @JsonProperty("idToken")
    @JsonAlias({"id_token", "token", "credential"})
    private String idToken;

    public GoogleLoginRequest() {
    }

    public GoogleLoginRequest(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
