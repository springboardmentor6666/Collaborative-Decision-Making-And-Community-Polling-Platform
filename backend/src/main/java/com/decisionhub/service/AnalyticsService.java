package com.decisionhub.service;

import java.util.Map;

public interface AnalyticsService {

    Map<String, Object> getSystemDashboardStats(String timeRange);

    Map<String, Object> getUserAnalytics(Long userId);

    Map<String, Object> getCommunityAnalytics(Long communityId);

    Map<String, Object> getDecisionAnalytics(Long decisionId);
}
