package com.decisionhub.mapper;

import com.decisionhub.dto.response.AttachmentResponse;
import com.decisionhub.entity.Attachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface AttachmentMapper {

    @Mapping(target = "decisionId", source = "decision.decisionId")
    @Mapping(target = "commentId", source = "comment.commentId")
    @Mapping(target = "uploadedBy", source = "uploadedBy")
    @Mapping(target = "uploadedAt", source = "createdAt")
    AttachmentResponse toResponse(Attachment attachment);
}
