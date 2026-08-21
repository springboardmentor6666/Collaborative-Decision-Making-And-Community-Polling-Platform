package com.decisionhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NomineeRequest {
    @NotBlank(message = "Nominee name is required")
    private String name;
    
    private String description;
    private String imageUrl;
    private String externalUrl;
}
