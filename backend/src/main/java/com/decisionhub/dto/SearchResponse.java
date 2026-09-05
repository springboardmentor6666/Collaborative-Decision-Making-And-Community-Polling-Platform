package com.decisionhub.dto;

import java.util.ArrayList;
import java.util.List;

public class SearchResponse {

    private String query;
    private String type;
    private List<DecisionResponse> decisions = new ArrayList<>();
    private List<CommunityResponse> communities = new ArrayList<>();
    private List<CommentResponse> comments = new ArrayList<>();
    private long totalDecisions;
    private long totalCommunities;
    private long totalComments;
    private long totalResults;

    public SearchResponse() {
    }

    public SearchResponse(String query, String type,
                          List<DecisionResponse> decisions,
                          List<CommunityResponse> communities,
                          List<CommentResponse> comments,
                          long totalDecisions,
                          long totalCommunities,
                          long totalComments) {
        this.query = query;
        this.type = type;
        this.decisions = decisions != null ? decisions : new ArrayList<>();
        this.communities = communities != null ? communities : new ArrayList<>();
        this.comments = comments != null ? comments : new ArrayList<>();
        this.totalDecisions = totalDecisions;
        this.totalCommunities = totalCommunities;
        this.totalComments = totalComments;
        this.totalResults = totalDecisions + totalCommunities + totalComments;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<DecisionResponse> getDecisions() {
        return decisions;
    }

    public void setDecisions(List<DecisionResponse> decisions) {
        this.decisions = decisions;
    }

    public List<CommunityResponse> getCommunities() {
        return communities;
    }

    public void setCommunities(List<CommunityResponse> communities) {
        this.communities = communities;
    }

    public List<CommentResponse> getComments() {
        return comments;
    }

    public void setComments(List<CommentResponse> comments) {
        this.comments = comments;
    }

    public long getTotalDecisions() {
        return totalDecisions;
    }

    public void setTotalDecisions(long totalDecisions) {
        this.totalDecisions = totalDecisions;
    }

    public long getTotalCommunities() {
        return totalCommunities;
    }

    public void setTotalCommunities(long totalCommunities) {
        this.totalCommunities = totalCommunities;
    }

    public long getTotalComments() {
        return totalComments;
    }

    public void setTotalComments(long totalComments) {
        this.totalComments = totalComments;
    }

    public long getTotalResults() {
        return totalResults;
    }

    public void setTotalResults(long totalResults) {
        this.totalResults = totalResults;
    }
}
