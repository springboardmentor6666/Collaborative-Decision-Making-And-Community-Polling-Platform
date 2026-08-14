package com.decisionhub.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionResponse {

    private Long id;

    private Long decisionId;

    private String optionText;

    private long voteCount;

    private boolean selected;
}