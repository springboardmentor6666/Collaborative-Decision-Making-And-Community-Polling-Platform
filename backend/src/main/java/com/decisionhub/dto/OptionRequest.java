package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;

public class OptionRequest {

    @NotBlank(message = "Option label is required")
    private String label;

    private String description;

    public OptionRequest() {
    }

    public OptionRequest(String label) {
        this.label = label;
    }

    public OptionRequest(String label, String description) {
        this.label = label;
        this.description = description;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
