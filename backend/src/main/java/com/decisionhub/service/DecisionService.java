package com.decisionhub.service;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.DecisionRequest;
import com.decisionhub.dto.response.DecisionResponse;
import org.springframework.data.domain.Pageable;

public interface DecisionService {

    DecisionResponse createDecision(Long userId, DecisionRequest request);

    DecisionResponse updateDecision(Long decisionId, Long userId, DecisionRequest request);

    DecisionResponse getDecisionById(Long decisionId, Long requestingUserId);

    void deleteDecision(Long decisionId, Long userId);

    PagedResponse<DecisionResponse> searchDecisions(
            String searchQuery,

            Long communityId,
            DecisionVisibility visibility,
            DecisionStatus status,
            VoteType voteType,
            Long createdById,
            Long requestingUserId,
            Pageable pageable
    );

    PagedResponse<DecisionResponse> getTrendingDecisions(Long requestingUserId, Pageable pageable);

    PagedResponse<DecisionResponse> getPopularDecisions(Long requestingUserId, Pageable pageable);

    PagedResponse<DecisionResponse> getLatestDecisions(Long requestingUserId, Pageable pageable);
}
