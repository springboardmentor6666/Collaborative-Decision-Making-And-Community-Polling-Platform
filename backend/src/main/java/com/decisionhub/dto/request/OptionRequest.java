package com.decisionhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionRequest {

    @NotBlank(message = "Option title is required")
    @Size(min = 1, max = 150, message = "Title must be between 1 and 150 characters")
    private String title;

    private String description;

}
