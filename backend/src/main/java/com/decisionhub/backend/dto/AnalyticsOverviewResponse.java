package com.decisionhub.backend.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsOverviewResponse {
    private long totalDecisions;
    private long activeDecisions;
    private long resolvedDecisions;
    private long totalVotes;
    private long totalCommunities;
    private long totalUsers;
    private double pollCompletionRate;
    private Map<String, Long> categoryBreakdown;
    private Map<String, Long> voteDistribution;
    private List<Map<String, Object>> monthlyTrends;
    private List<Map<String, Object>> topDecisions;

    public AnalyticsOverviewResponse() {
    }

    public long getTotalDecisions() {
        return totalDecisions;
    }

    public void setTotalDecisions(long totalDecisions) {
        this.totalDecisions = totalDecisions;
    }

    public long getActiveDecisions() {
        return activeDecisions;
    }

    public void setActiveDecisions(long activeDecisions) {
        this.activeDecisions = activeDecisions;
    }

    public long getResolvedDecisions() {
        return resolvedDecisions;
    }

    public void setResolvedDecisions(long resolvedDecisions) {
        this.resolvedDecisions = resolvedDecisions;
    }

    public long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public long getTotalCommunities() {
        return totalCommunities;
    }

    public void setTotalCommunities(long totalCommunities) {
        this.totalCommunities = totalCommunities;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public double getPollCompletionRate() {
        return pollCompletionRate;
    }

    public void setPollCompletionRate(double pollCompletionRate) {
        this.pollCompletionRate = pollCompletionRate;
    }

    public Map<String, Long> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(Map<String, Long> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public Map<String, Long> getVoteDistribution() {
        return voteDistribution;
    }

    public void setVoteDistribution(Map<String, Long> voteDistribution) {
        this.voteDistribution = voteDistribution;
    }

    public List<Map<String, Object>> getMonthlyTrends() {
        return monthlyTrends;
    }

    public void setMonthlyTrends(List<Map<String, Object>> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }

    public List<Map<String, Object>> getTopDecisions() {
        return topDecisions;
    }

    public void setTopDecisions(List<Map<String, Object>> topDecisions) {
        this.topDecisions = topDecisions;
    }
}
