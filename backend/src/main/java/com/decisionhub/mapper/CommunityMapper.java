package com.decisionhub.mapper;

import com.decisionhub.dto.request.CommunityRequest;
import com.decisionhub.dto.response.CommunityResponse;
import com.decisionhub.entity.Community;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CommunityMapper {

    @Mapping(target = "owner", source = "owner")
    @Mapping(target = "memberCount", ignore = true)
    CommunityResponse toResponse(Community community);

    @Mapping(target = "communityId", ignore = true)
    @Mapping(target = "owner", ignore = true)
    Community toEntity(CommunityRequest request);
}
