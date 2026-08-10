package com.decisionhub.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteResponse {

    private Long id;

    private String message;
}