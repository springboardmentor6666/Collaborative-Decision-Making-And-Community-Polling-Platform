package com.decisionhub.backend.dto;

import lombok.Data;

@Data
public class VoteRequest {

    private Long userId;

    private Long decisionId;

    private Long optionId;
}