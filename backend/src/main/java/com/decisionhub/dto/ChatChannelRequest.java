package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ChatChannelRequest {

    @NotBlank(message = "Channel name is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Channel name must contain only lowercase alphanumeric characters and hyphens")
    @Size(min = 2, max = 50, message = "Channel name must be between 2 and 50 characters")
    private String name;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    public ChatChannelRequest() {
    }

    public ChatChannelRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
