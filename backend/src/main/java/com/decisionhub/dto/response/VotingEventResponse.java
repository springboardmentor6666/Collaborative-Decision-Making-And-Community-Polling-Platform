package com.decisionhub.dto.response;

import com.decisionhub.common.enums.ElectionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.common.enums.VotingEventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VotingEventResponse {
    private Long eventId;
    private Long communityId;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private VotingEventStatus status;
    private VoteType votingType;
    private boolean anonymousVoting;
    private ElectionVisibility resultsVisible;
    private boolean resultsPublished;
    private LocalDateTime createdAt;
    private String createdByUser;
}
