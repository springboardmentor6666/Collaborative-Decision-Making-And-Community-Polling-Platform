package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;

public class ModerationActionRequest {

    @NotBlank(message = "Action must be specified")
    private String action; // NO_ACTION, TEMPORARY_REMOVAL, DIRECT_REMOVE, RESTORE

    private String reason; // Message/Guidance to content creator

    private String internalNote; // Internal note for moderation audit

    public ModerationActionRequest() {
    }

    public ModerationActionRequest(String action, String reason, String internalNote) {
        this.action = action;
        this.reason = reason;
        this.internalNote = internalNote;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getInternalNote() {
        return internalNote;
    }

    public void setInternalNote(String internalNote) {
        this.internalNote = internalNote;
    }
}
