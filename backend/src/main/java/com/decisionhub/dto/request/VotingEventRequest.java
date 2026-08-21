package com.decisionhub.dto.request;

import com.decisionhub.common.enums.ElectionVisibility;
import com.decisionhub.common.enums.VoteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VotingEventRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    @NotNull(message = "Voting type is required")
    private VoteType votingType;
    
    private boolean anonymousVoting;
    
    @NotNull(message = "Results visibility configuration is required")
    private ElectionVisibility resultsVisible;
}
