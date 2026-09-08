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
public class UserDataExportResponse {

    private UserResponse profile;
    private UserPreferencesResponse preferences;
    private long totalCreatedDecisions;
    private long totalSavedDecisions;
    private long totalCommunitiesJoined;
    private LocalDateTime exportGeneratedAt;
    private String exportNotice;
}
