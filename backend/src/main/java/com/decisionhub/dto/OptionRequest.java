package com.decisionhub.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class OptionRequest {

    @NotBlank(message = "Option label is required")
    @JsonAlias({"optionText", "text", "name"})
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

    public String getOptionText() {
        return label;
    }

    public void setOptionText(String optionText) {
        this.label = optionText;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

