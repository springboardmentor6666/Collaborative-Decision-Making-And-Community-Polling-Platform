package com.decisionhub.dto.response;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionResponse {

    private Long decisionId;
    private UserResponse createdBy;

    private CommunityResponse community;
    private String title;
    private String description;
    private VoteType voteType;
    private DecisionVisibility visibility;
    private DecisionStatus status;
    private LocalDateTime deadline;
    private boolean allowAnonymousVote;
    private int viewCount;
    private int likeCount;
    private int shareCount;
    private long totalVotes;
    private List<OptionResponse> options;
    private List<AttachmentResponse> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
