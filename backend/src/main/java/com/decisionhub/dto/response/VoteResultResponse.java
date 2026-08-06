package com.decisionhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteResultResponse {

    private Long decisionId;
    private long totalVotesCount;
    private Map<Long, Long> optionVoteCounts;
    private Map<Long, BigDecimal> optionPercentages;
    private OptionResponse winningOption;
}
