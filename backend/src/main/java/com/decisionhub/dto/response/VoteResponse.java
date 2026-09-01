package com.decisionhub.dto.response;

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
public class VoteResponse {

    private Long voteId;
    private Long decisionId;
    private String decisionTitle;
    private String decisionStatus;
    private String voteType;
    private UserResponse voter;
    private List<SelectionResponseDto> selections;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SelectionResponseDto {
        private Long optionId;
        private String optionTitle;
        private Integer rating;
    }
}

