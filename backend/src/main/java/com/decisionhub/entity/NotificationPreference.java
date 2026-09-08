package com.decisionhub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "community_activity", nullable = false)
    private Boolean communityActivity = true;

    @Column(name = "community_updates", nullable = false)
    private Boolean communityUpdates = true;

    @Column(name = "comments", nullable = false)
    private Boolean comments = true;

    @Column(name = "comment_replies", nullable = false)
    private Boolean commentReplies = true;

    @Column(name = "discussions", nullable = false)
    private Boolean discussions = true;

    @Column(name = "mentions", nullable = false)
    private Boolean mentions = true;

    @Column(name = "voting_activity", nullable = false)
    private Boolean votingActivity = true;

    @Column(name = "decision_activity", nullable = false)
    private Boolean decisionActivity = true;

    @Column(name = "community_invites", nullable = false)
    private Boolean communityInvites = true;

    @Column(name = "account_alerts", nullable = false)
    private Boolean accountAlerts = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public NotificationPreference() {
    }

    public NotificationPreference(User user) {
        this.user = user;
        this.communityActivity = true;
        this.communityUpdates = true;
        this.comments = true;
        this.commentReplies = true;
        this.discussions = true;
        this.mentions = true;
        this.votingActivity = true;
        this.decisionActivity = true;
        this.communityInvites = true;
        this.accountAlerts = true;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Boolean getCommunityActivity() {
        return communityActivity != null ? communityActivity : true;
    }

    public void setCommunityActivity(Boolean communityActivity) {
        this.communityActivity = communityActivity;
    }

    public Boolean getCommunityUpdates() {
        return communityUpdates != null ? communityUpdates : true;
    }

    public void setCommunityUpdates(Boolean communityUpdates) {
        this.communityUpdates = communityUpdates;
    }

    public Boolean getComments() {
        return comments != null ? comments : true;
    }

    public void setComments(Boolean comments) {
        this.comments = comments;
    }

    public Boolean getCommentReplies() {
        return commentReplies != null ? commentReplies : true;
    }

    public void setCommentReplies(Boolean commentReplies) {
        this.commentReplies = commentReplies;
    }

    public Boolean getDiscussions() {
        return discussions != null ? discussions : true;
    }

    public void setDiscussions(Boolean discussions) {
        this.discussions = discussions;
    }

    public Boolean getMentions() {
        return mentions != null ? mentions : true;
    }

    public void setMentions(Boolean mentions) {
        this.mentions = mentions;
    }

    public Boolean getVotingActivity() {
        return votingActivity != null ? votingActivity : true;
    }

    public void setVotingActivity(Boolean votingActivity) {
        this.votingActivity = votingActivity;
    }

    public Boolean getDecisionActivity() {
        return decisionActivity != null ? decisionActivity : true;
    }

    public void setDecisionActivity(Boolean decisionActivity) {
        this.decisionActivity = decisionActivity;
    }

    public Boolean getCommunityInvites() {
        return communityInvites != null ? communityInvites : true;
    }

    public void setCommunityInvites(Boolean communityInvites) {
        this.communityInvites = communityInvites;
    }

    public Boolean getAccountAlerts() {
        return accountAlerts != null ? accountAlerts : true;
    }

    public void setAccountAlerts(Boolean accountAlerts) {
        this.accountAlerts = accountAlerts;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
