package com.decisionhub.dto.request;

import jakarta.validation.constraints.NotNull;
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
public class VoteRequest {

    @NotNull(message = "Decision ID is required")
    private Long decisionId;

    @NotNull(message = "Option ID is required")
    private Long optionId;

    private Integer rating;
}
