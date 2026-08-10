package com.decisionhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OptionRequest {

    @NotBlank(message = "Option text is required")
    private String optionText;

    private Long decisionId;
}