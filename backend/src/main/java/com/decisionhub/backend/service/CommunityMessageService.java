package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.CommunityMessageRequest;
import com.decisionhub.backend.dto.CommunityMessageResponse;

import java.util.List;

public interface CommunityMessageService {
    List<CommunityMessageResponse> list(Long communityId);
    CommunityMessageResponse add(Long communityId, CommunityMessageRequest request);
    void delete(Long messageId);
}
