package com.decisionhub.backend.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionResponse {

    private Long id;

    private String title;

    private String description;

    private String category;

    private String visibility;

    private LocalDate deadline;

    private boolean anonymous;

    private List<OptionResponse> options;
}