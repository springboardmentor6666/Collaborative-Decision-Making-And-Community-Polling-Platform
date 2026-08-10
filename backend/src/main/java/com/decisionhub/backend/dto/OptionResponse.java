package com.decisionhub.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionResponse {

    private Long id;

    private String optionText;

    private Long decisionId;
}