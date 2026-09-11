package com.decisionhub.entity;

import com.decisionhub.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "user_preference")
@SQLDelete(sql = "UPDATE user_preference SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Notification Preferences
    @Column(name = "email_digest", nullable = false, length = 20)
    @Builder.Default
    private String emailDigest = "DAILY"; // INSTANT, DAILY, WEEKLY, OFF

    @Column(name = "notify_new_decisions", nullable = false)
    @Builder.Default
    private boolean notifyNewDecisions = true;

    @Column(name = "notify_vote_deadlines", nullable = false)
    @Builder.Default
    private boolean notifyVoteDeadlines = true;

    @Column(name = "notify_decision_results", nullable = false)
    @Builder.Default
    private boolean notifyDecisionResults = true;

    @Column(name = "notify_comments_and_mentions", nullable = false)
    @Builder.Default
    private boolean notifyCommentsAndMentions = true;

    @Column(name = "notify_hikes", nullable = false)
    @Builder.Default
    private boolean notifyHikes = true;

    @Column(name = "notify_elections", nullable = false)
    @Builder.Default
    private boolean notifyElections = true;

    @Column(name = "in_app_notifications", nullable = false)
    @Builder.Default
    private boolean inAppNotifications = true;

    // Voting & Privacy Preferences
    @Column(name = "default_voting_mode", nullable = false, length = 20)
    @Builder.Default
    private String defaultVotingMode = "PUBLIC"; // PUBLIC, ANONYMOUS

    @Column(name = "activity_visibility", nullable = false, length = 20)
    @Builder.Default
    private String activityVisibility = "PUBLIC"; // PUBLIC, COMMUNITY_ONLY, PRIVATE

    @Column(name = "show_badges", nullable = false)
    @Builder.Default
    private boolean showBadges = true;

    // Appearance & Localization
    @Column(name = "timezone", length = 50)
    @Builder.Default
    private String timezone = "UTC";

    @Column(name = "theme", length = 20)
    @Builder.Default
    private String theme = "system"; // light, dark, system

    @Column(name = "feed_density", length = 20)
    @Builder.Default
    private String feedDensity = "comfortable"; // comfortable, compact
}
