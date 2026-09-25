package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.CommunityRequest;
import com.decisionhub.backend.dto.CommunityResponse;

import java.util.List;
import com.decisionhub.backend.dto.DecisionResponse;

public interface CommunityService {

    CommunityResponse createCommunity(CommunityRequest request);

    List<CommunityResponse> getAllCommunities();

    void deleteCommunity(Long id);
    CommunityResponse getCommunity(Long id);
    CommunityResponse join(Long id);
    CommunityResponse leave(Long id);
    List<DecisionResponse> getCommunityDecisions(Long id);
}
