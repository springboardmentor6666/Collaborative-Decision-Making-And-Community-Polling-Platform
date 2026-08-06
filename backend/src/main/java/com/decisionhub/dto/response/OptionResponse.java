package com.decisionhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionResponse {

    private Long optionId;
    private Long decisionId;
    private String title;
    private String description;
    private BigDecimal totalScore;
    private long voteCount;

    private LocalDateTime createdAt;
}
