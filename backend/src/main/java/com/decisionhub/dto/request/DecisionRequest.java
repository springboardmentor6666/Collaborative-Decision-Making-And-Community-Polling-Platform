package com.decisionhub.dto.request;

import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class DecisionRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;

    private String description;


    private Long communityId;

    @NotNull(message = "Vote type is required")
    private VoteType voteType;

    private DecisionVisibility visibility;
    private LocalDateTime deadline;
    private Boolean allowAnonymousVote;

    @NotNull(message = "At least two options are required")
    @Size(min = 2, message = "At least two options are required to create a decision board")
    private List<OptionRequest> options;
}
