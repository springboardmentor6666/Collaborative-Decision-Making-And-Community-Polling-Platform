package com.decisionhub.service;

import com.decisionhub.dto.request.VoteRequest;
import com.decisionhub.dto.response.VoteResponse;
import com.decisionhub.dto.response.VoteResultResponse;

public interface VoteService {

    VoteResponse castVote(Long userId, VoteRequest request);

    VoteResponse changeVote(Long userId, Long voteId, VoteRequest request);

    VoteResponse castAnonymousVote(VoteRequest request);

    VoteResponse getUserVote(Long userId, Long decisionId);

    VoteResultResponse getVoteResults(Long decisionId);
}
