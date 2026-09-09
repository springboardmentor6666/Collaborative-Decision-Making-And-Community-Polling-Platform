package com.decisionhub.dto;

import java.util.Map;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: AdminStatsOverviewDto
 * Architecture Tier: Data Transfer Object (DTO Tier)
 * Package: com.decisionhub.dto
 *
 * Purpose:
 *   Data transfer object transferring AdminStatsOverviewDto state across architectural boundaries.
 */

public class AdminStatsOverviewDto {

    // User Metrics
    private long totalUsers;
    private long activeUsers;
    private long deactivatedUsers;
    private long pendingDeletionUsers;
    private long newUsersToday;
    private long newUsersThisWeek;
    private long newUsersThisMonth;

    // Decision Metrics
    private long totalDecisions;
    private long openDecisions;
    private long closedDecisions;
    private long decisionsCreatedToday;
    private long decisionsCreatedThisWeek;
    private long decisionsCreatedThisMonth;

    // Community Metrics
    private long totalCommunities;
    private long publicCommunities;
    private long privateCommunities;
    private long communitiesCreatedToday;
    private long communitiesCreatedThisWeek;
    private long communitiesCreatedThisMonth;

    // Engagement & Content Metrics
    private long totalComments;
    private long commentsCreatedToday;
    private long totalDiscussions; // community messages
    private long discussionsCreatedToday;
    private long totalVotes;
    private long totalPolls;

    // Moderation & Reports Metrics
    private long totalReports;
    private long pendingReports;
    private long reviewedReports;
    private long resolvedReports;
    private long noActionReports;
    private long temporarilyRemovedContent;
    private long permanentlyRemovedContent;

    // Breakdown mappings
    private Map<String, Long> reportsByContentType;
    private Map<String, Long> reportsByStatus;

    public AdminStatsOverviewDto() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getDeactivatedUsers() {
        return deactivatedUsers;
    }

    public void setDeactivatedUsers(long deactivatedUsers) {
        this.deactivatedUsers = deactivatedUsers;
    }

    public long getPendingDeletionUsers() {
        return pendingDeletionUsers;
    }

    public void setPendingDeletionUsers(long pendingDeletionUsers) {
        this.pendingDeletionUsers = pendingDeletionUsers;
    }

    public long getNewUsersToday() {
        return newUsersToday;
    }

    public void setNewUsersToday(long newUsersToday) {
        this.newUsersToday = newUsersToday;
    }

    public long getNewUsersThisWeek() {
        return newUsersThisWeek;
    }

    public void setNewUsersThisWeek(long newUsersThisWeek) {
        this.newUsersThisWeek = newUsersThisWeek;
    }

    public long getNewUsersThisMonth() {
        return newUsersThisMonth;
    }

    public void setNewUsersThisMonth(long newUsersThisMonth) {
        this.newUsersThisMonth = newUsersThisMonth;
    }

    public long getTotalDecisions() {
        return totalDecisions;
    }

    public void setTotalDecisions(long totalDecisions) {
        this.totalDecisions = totalDecisions;
    }

    public long getOpenDecisions() {
        return openDecisions;
    }

    public void setOpenDecisions(long openDecisions) {
        this.openDecisions = openDecisions;
    }

    public long getClosedDecisions() {
        return closedDecisions;
    }

    public void setClosedDecisions(long closedDecisions) {
        this.closedDecisions = closedDecisions;
    }

    public long getDecisionsCreatedToday() {
        return decisionsCreatedToday;
    }

    public void setDecisionsCreatedToday(long decisionsCreatedToday) {
        this.decisionsCreatedToday = decisionsCreatedToday;
    }

    public long getDecisionsCreatedThisWeek() {
        return decisionsCreatedThisWeek;
    }

    public void setDecisionsCreatedThisWeek(long decisionsCreatedThisWeek) {
        this.decisionsCreatedThisWeek = decisionsCreatedThisWeek;
    }

    public long getDecisionsCreatedThisMonth() {
        return decisionsCreatedThisMonth;
    }

    public void setDecisionsCreatedThisMonth(long decisionsCreatedThisMonth) {
        this.decisionsCreatedThisMonth = decisionsCreatedThisMonth;
    }

    public long getTotalCommunities() {
        return totalCommunities;
    }

    public void setTotalCommunities(long totalCommunities) {
        this.totalCommunities = totalCommunities;
    }

    public long getPublicCommunities() {
        return publicCommunities;
    }

    public void setPublicCommunities(long publicCommunities) {
        this.publicCommunities = publicCommunities;
    }

    public long getPrivateCommunities() {
        return privateCommunities;
    }

    public void setPrivateCommunities(long privateCommunities) {
        this.privateCommunities = privateCommunities;
    }

    public long getCommunitiesCreatedToday() {
        return communitiesCreatedToday;
    }

    public void setCommunitiesCreatedToday(long communitiesCreatedToday) {
        this.communitiesCreatedToday = communitiesCreatedToday;
    }

    public long getCommunitiesCreatedThisWeek() {
        return communitiesCreatedThisWeek;
    }

    public void setCommunitiesCreatedThisWeek(long communitiesCreatedThisWeek) {
        this.communitiesCreatedThisWeek = communitiesCreatedThisWeek;
    }

    public long getCommunitiesCreatedThisMonth() {
        return communitiesCreatedThisMonth;
    }

    public void setCommunitiesCreatedThisMonth(long communitiesCreatedThisMonth) {
        this.communitiesCreatedThisMonth = communitiesCreatedThisMonth;
    }

    public long getTotalComments() {
        return totalComments;
    }

    public void setTotalComments(long totalComments) {
        this.totalComments = totalComments;
    }

    public long getCommentsCreatedToday() {
        return commentsCreatedToday;
    }

    public void setCommentsCreatedToday(long commentsCreatedToday) {
        this.commentsCreatedToday = commentsCreatedToday;
    }

    public long getTotalDiscussions() {
        return totalDiscussions;
    }

    public void setTotalDiscussions(long totalDiscussions) {
        this.totalDiscussions = totalDiscussions;
    }

    public long getDiscussionsCreatedToday() {
        return discussionsCreatedToday;
    }

    public void setDiscussionsCreatedToday(long discussionsCreatedToday) {
        this.discussionsCreatedToday = discussionsCreatedToday;
    }

    public long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public long getTotalPolls() {
        return totalPolls;
    }

    public void setTotalPolls(long totalPolls) {
        this.totalPolls = totalPolls;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }

    public long getReviewedReports() {
        return reviewedReports;
    }

    public void setReviewedReports(long reviewedReports) {
        this.reviewedReports = reviewedReports;
    }

    public long getResolvedReports() {
        return resolvedReports;
    }

    public void setResolvedReports(long resolvedReports) {
        this.resolvedReports = resolvedReports;
    }

    public long getNoActionReports() {
        return noActionReports;
    }

    public void setNoActionReports(long noActionReports) {
        this.noActionReports = noActionReports;
    }

    public long getTemporarilyRemovedContent() {
        return temporarilyRemovedContent;
    }

    public void setTemporarilyRemovedContent(long temporarilyRemovedContent) {
        this.temporarilyRemovedContent = temporarilyRemovedContent;
    }

    public long getPermanentlyRemovedContent() {
        return permanentlyRemovedContent;
    }

    public void setPermanentlyRemovedContent(long permanentlyRemovedContent) {
        this.permanentlyRemovedContent = permanentlyRemovedContent;
    }

    public Map<String, Long> getReportsByContentType() {
        return reportsByContentType;
    }

    public void setReportsByContentType(Map<String, Long> reportsByContentType) {
        this.reportsByContentType = reportsByContentType;
    }

    public Map<String, Long> getReportsByStatus() {
        return reportsByStatus;
    }

    public void setReportsByStatus(Map<String, Long> reportsByStatus) {
        this.reportsByStatus = reportsByStatus;
    }
}
