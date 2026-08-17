package com.decisionhub.backend.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class ProfileUpdateRequest {

    @NotBlank(message = "Name is required")
    private String name;
}
