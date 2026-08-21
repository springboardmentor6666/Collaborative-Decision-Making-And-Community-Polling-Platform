package com.decisionhub.service;

import com.decisionhub.dto.request.VotingEventRequest;
import com.decisionhub.dto.response.VotingEventResponse;

import java.util.List;

public interface VotingEventService {
    VotingEventResponse createVotingEvent(Long communityId, Long userId, VotingEventRequest request);
    VotingEventResponse updateVotingEvent(Long eventId, Long userId, VotingEventRequest request);
    VotingEventResponse getVotingEvent(Long eventId, Long userId);
    List<VotingEventResponse> getCommunityEvents(Long communityId);
    void publishEvent(Long eventId, Long userId);
    void startEvent(Long eventId, Long userId);
    void closeEvent(Long eventId, Long userId);
    void publishResults(Long eventId, Long userId);
    void deleteVotingEvent(Long eventId, Long userId);
}
