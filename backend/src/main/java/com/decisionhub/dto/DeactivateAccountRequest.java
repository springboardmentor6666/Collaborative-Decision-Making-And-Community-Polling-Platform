package com.decisionhub.dto;

import java.time.LocalDate;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: DeactivateAccountRequest
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Request payload DTO carrying incoming client data with validation constraints for DeactivateAccount operations.
 */

public class DeactivateAccountRequest {

    private Integer durationDays;
    private LocalDate customUntilDate;

    public DeactivateAccountRequest() {
    }

    public DeactivateAccountRequest(Integer durationDays, LocalDate customUntilDate) {
        this.durationDays = durationDays;
        this.customUntilDate = customUntilDate;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public LocalDate getCustomUntilDate() {
        return customUntilDate;
    }

    public void setCustomUntilDate(LocalDate customUntilDate) {
        this.customUntilDate = customUntilDate;
    }
}
