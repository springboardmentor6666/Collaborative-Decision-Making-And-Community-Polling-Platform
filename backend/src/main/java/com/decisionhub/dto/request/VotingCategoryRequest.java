package com.decisionhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class VotingCategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;
    
    private String description;
    
    private int displayOrder;
    
    @Min(value = 1, message = "Max selections must be at least 1")
    private int maxSelections = 1;
}
