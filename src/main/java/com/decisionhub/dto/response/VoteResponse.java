package com.decisionhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteResponse {

    private Long voteId;
    private Long decisionId;
    private Long optionId;
    private UserResponse voter;
    private Integer rating;
    private LocalDateTime createdAt;
}
