package com.decisionhub.service;

import com.decisionhub.dto.request.ElectionVoteRequest;
import com.decisionhub.dto.response.ElectionResultsResponse;

public interface ElectionVotingService {
    void submitVote(Long categoryId, Long userId, ElectionVoteRequest request);
    ElectionResultsResponse getResults(Long eventId, Long userId);
}
