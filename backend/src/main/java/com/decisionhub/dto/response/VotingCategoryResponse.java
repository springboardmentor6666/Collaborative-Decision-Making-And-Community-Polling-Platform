package com.decisionhub.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VotingCategoryResponse {
    private Long categoryId;
    private Long eventId;
    private String name;
    private String description;
    private int displayOrder;
    private int maxSelections;
    private LocalDateTime createdAt;
}
