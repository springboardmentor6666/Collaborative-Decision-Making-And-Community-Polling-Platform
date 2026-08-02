package com.decisionhub.service.impl;


import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final CommunityRepository communityRepository;

    private final VoteRepository voteRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSystemDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDecisions", decisionRepository.count());
        stats.put("totalCommunities", communityRepository.count());

        stats.put("totalVotes", voteRepository.count());
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserAnalytics(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("userId", userId);
        stats.put("totalCreatedDecisions", decisionRepository.findByCreatedByUserId(userId, null).getTotalElements());
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDecisionAnalytics(Long decisionId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("decisionId", decisionId);
        stats.put("totalVotes", voteRepository.countByDecisionDecisionId(decisionId));
        return stats;
    }
}
