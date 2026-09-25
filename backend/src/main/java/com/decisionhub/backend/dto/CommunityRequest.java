package com.decisionhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommunityRequest {

    @NotBlank
    private String communityName;

    private String description;
}