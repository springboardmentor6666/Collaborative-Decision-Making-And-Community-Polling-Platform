package com.decisionhub.mapper;

import com.decisionhub.dto.request.DecisionRequest;
import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.entity.Decision;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {
        UserMapper.class,
        CommunityMapper.class,
        OptionMapper.class,
        AttachmentMapper.class
})
public interface DecisionMapper {

    @Mapping(target = "createdBy", source = "createdBy")
    @Mapping(target = "community", expression = "java(safeCommunity(decision.getCommunity()))")
    @Mapping(target = "options", source = "options")
    @Mapping(target = "totalVotes", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    DecisionResponse toResponse(Decision decision);

    @Mapping(target = "decisionId", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "community", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "likeCount", ignore = true)
    @Mapping(target = "shareCount", ignore = true)
    @Mapping(target = "options", ignore = true)
    Decision toEntity(DecisionRequest request);

    default com.decisionhub.dto.response.CommunityResponse safeCommunity(com.decisionhub.entity.Community community) {
        if (community == null) return null;
        try {
            return com.decisionhub.dto.response.CommunityResponse.builder()
                    .communityId(community.getCommunityId())
                    .name(community.getName())
                    .description(community.getDescription())
                    .visibility(community.getVisibility())
                    .image(community.getImage())
                    .createdAt(community.getCreatedAt())
                    .build();
        } catch (jakarta.persistence.EntityNotFoundException | org.hibernate.ObjectNotFoundException e) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
