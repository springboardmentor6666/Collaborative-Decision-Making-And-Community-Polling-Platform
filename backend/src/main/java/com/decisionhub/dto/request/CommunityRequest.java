package com.decisionhub.dto.request;

import com.decisionhub.common.enums.CommunityVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityRequest {

    @NotBlank(message = "Community name is required")
    @Size(min = 3, max = 100, message = "Community name must be between 3 and 100 characters")
    private String name;

    private String description;


    private CommunityVisibility visibility;
    private String image;
}
