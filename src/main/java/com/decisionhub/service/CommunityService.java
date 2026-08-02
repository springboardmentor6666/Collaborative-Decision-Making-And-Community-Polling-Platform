package com.decisionhub.service;

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

    PagedResponse<CommunityResponse> searchCommunities(String query, Pageable pageable);

    void deleteCommunity(Long communityId, Long userId);

    CommunityMemberResponse joinCommunity(Long communityId, Long userId);

    void leaveCommunity(Long communityId, Long userId);

    void updateMemberRole(Long communityId, Long memberUserId, MemberRole role, Long requestingUserId);

    void removeMember(Long communityId, Long memberUserId, Long requestingUserId);

    PagedResponse<CommunityMemberResponse> getCommunityMembers(Long communityId, Pageable pageable);
}
