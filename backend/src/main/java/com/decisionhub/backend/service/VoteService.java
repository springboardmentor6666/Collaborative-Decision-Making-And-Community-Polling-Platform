package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.VoteRequest;
import com.decisionhub.backend.dto.VoteResponse;

import java.util.Map;

public interface VoteService {

    VoteResponse castVote(VoteRequest request);

    Map<String, Long> getVoteResults(Long decisionId);

}