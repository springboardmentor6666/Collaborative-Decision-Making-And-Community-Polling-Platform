package com.decisionhub.dto;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: ImpressionRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for Impression operations.
 */

public class ImpressionRequest {

    private String type;

    public ImpressionRequest() {
    }

    public ImpressionRequest(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
