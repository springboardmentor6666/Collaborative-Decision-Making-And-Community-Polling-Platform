package com.decisionhub.dto.response;

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
public class UserPreferencesResponse {

    private Long id;
    private Long userId;

    // Notification Preferences
    private String emailDigest;
    private boolean notifyNewDecisions;
    private boolean notifyVoteDeadlines;
    private boolean notifyDecisionResults;
    private boolean notifyCommentsAndMentions;
    private boolean notifyHikes;
    private boolean notifyElections;
    private boolean inAppNotifications;

    // Voting & Privacy Preferences
    private String defaultVotingMode;
    private String activityVisibility;
    private boolean showBadges;

    // Appearance & Localization
    private String timezone;
    private String theme;
    private String feedDensity;
}
