package com.decisionhub.mapper;

import com.decisionhub.dto.request.CommentRequest;
import com.decisionhub.dto.response.CommentResponse;
import com.decisionhub.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CommentMapper {

    @Mapping(target = "decisionId", source = "decision.decisionId")
    @Mapping(target = "parentCommentId", source = "parentComment.commentId")
    @Mapping(target = "user", source = "user")
    CommentResponse toResponse(Comment comment);

    @Mapping(target = "commentId", ignore = true)
    @Mapping(target = "decision", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "parentComment", ignore = true)
    @Mapping(target = "edited", ignore = true)
    @Mapping(target = "replies", ignore = true)
    Comment toEntity(CommentRequest request);
}
