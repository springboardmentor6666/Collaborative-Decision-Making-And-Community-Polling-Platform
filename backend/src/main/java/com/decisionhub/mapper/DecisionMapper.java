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
    @Mapping(target = "community", source = "community")
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
}
