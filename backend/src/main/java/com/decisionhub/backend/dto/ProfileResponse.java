package com.decisionhub.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProfileResponse {

    private String name;

    private String email;

    private String role;

    private LocalDateTime createdAt;

    private long decisionsCreated;

    private long votesParticipated;

    private long joinedCommunities;
}