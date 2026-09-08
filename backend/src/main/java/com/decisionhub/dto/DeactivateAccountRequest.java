package com.decisionhub.dto;

import java.time.LocalDate;

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
