package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.CommunityRequest;
import com.decisionhub.backend.dto.CommunityResponse;

import java.util.List;

public interface CommunityService {

    CommunityResponse createCommunity(CommunityRequest request);

    List<CommunityResponse> getAllCommunities();

    void deleteCommunity(Long id);
}