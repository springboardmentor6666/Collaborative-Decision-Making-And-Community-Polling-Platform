package com.decisionhub.dto;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: ApiResponse
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Response payload DTO serializing Api domain data for client consumption.
 */

public class ApiResponse {

    private boolean success;
    private String message;

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
