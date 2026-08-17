package com.decisionhub.backend.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private String status;
    private LocalDateTime createdAt;
    private String createdByName;
    private Long communityId;
    private String communityName;
    private long totalVotes;
    private boolean alreadyVoted;

    private List<OptionResponse> options;
}
