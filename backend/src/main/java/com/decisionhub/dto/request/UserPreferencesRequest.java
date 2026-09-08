package com.decisionhub.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferencesRequest {

    // Notification Preferences
    private String emailDigest;
    private Boolean notifyNewDecisions;
    private Boolean notifyVoteDeadlines;
    private Boolean notifyDecisionResults;
    private Boolean notifyCommentsAndMentions;
    private Boolean notifyElections;
    private Boolean inAppNotifications;

    // Voting & Privacy Preferences
    private String defaultVotingMode;
    private String activityVisibility;
    private Boolean showBadges;

    // Appearance & Localization
    private String timezone;
    private String theme;
    private String feedDensity;
}
