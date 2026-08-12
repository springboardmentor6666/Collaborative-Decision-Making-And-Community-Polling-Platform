package com.decisionhub.service;

import com.decisionhub.common.enums.CommunityVisibility;
import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.CommunityRequest;
import com.decisionhub.dto.response.CommunityMemberResponse;
import com.decisionhub.dto.response.CommunityResponse;
import org.springframework.data.domain.Pageable;

public interface CommunityService {

    CommunityResponse createCommunity(Long userId, CommunityRequest request);

    CommunityResponse updateCommunity(Long communityId, Long userId, CommunityRequest request);

    CommunityResponse getCommunityById(Long communityId);

    PagedResponse<CommunityResponse> searchCommunities(String query, CommunityVisibility visibility, Long ownerId, Pageable pageable);

    PagedResponse<CommunityResponse> getUserCommunities(Long userId, Pageable pageable);

    void deleteCommunity(Long communityId, Long userId);

    CommunityMemberResponse joinCommunity(Long communityId, Long userId);

    void leaveCommunity(Long communityId, Long userId);

    void updateMemberRole(Long communityId, Long memberUserId, MemberRole role, Long requestingUserId);

    void removeMember(Long communityId, Long memberUserId, Long requestingUserId);

    PagedResponse<CommunityMemberResponse> getCommunityMembers(Long communityId, Pageable pageable);

    PagedResponse<CommunityMemberResponse> getPendingRequests(Long communityId, Long requestingUserId, Pageable pageable);

    void approveRequest(Long communityId, Long memberUserId, Long requestingUserId);

    void rejectRequest(Long communityId, Long memberUserId, Long requestingUserId);

    CommunityMemberResponse inviteUser(Long communityId, Long targetUserId, Long requestingUserId);

    CommunityMemberResponse getMembership(Long communityId, Long userId);
}
