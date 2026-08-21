package com.decisionhub.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ElectionVoteRequest {
    // For SINGLE_CHOICE
    private Long nomineeId;
    
    // For MULTIPLE_CHOICE
    private List<Long> nomineeIds;
}
