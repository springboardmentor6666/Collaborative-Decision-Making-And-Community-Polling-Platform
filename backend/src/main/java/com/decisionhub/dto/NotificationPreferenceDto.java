package com.decisionhub.dto;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: NotificationPreferenceDto
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Data transfer object transferring NotificationPreferenceDto state across architectural boundaries.
 */

public class NotificationPreferenceDto {

    private Boolean communityActivity;
    private Boolean communityUpdates;
    private Boolean comments;
    private Boolean commentReplies;
    private Boolean discussions;
    private Boolean mentions;
    private Boolean votingActivity;
    private Boolean decisionActivity;
    private Boolean communityInvites;
    private Boolean accountAlerts;

    public NotificationPreferenceDto() {
    }

    public NotificationPreferenceDto(Boolean communityActivity, Boolean communityUpdates, Boolean comments,
                                   Boolean commentReplies, Boolean discussions, Boolean mentions,
                                   Boolean votingActivity, Boolean decisionActivity, Boolean communityInvites,
                                   Boolean accountAlerts) {
        this.communityActivity = communityActivity;
        this.communityUpdates = communityUpdates;
        this.comments = comments;
        this.commentReplies = commentReplies;
        this.discussions = discussions;
        this.mentions = mentions;
        this.votingActivity = votingActivity;
        this.decisionActivity = decisionActivity;
        this.communityInvites = communityInvites;
        this.accountAlerts = accountAlerts;
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
}
