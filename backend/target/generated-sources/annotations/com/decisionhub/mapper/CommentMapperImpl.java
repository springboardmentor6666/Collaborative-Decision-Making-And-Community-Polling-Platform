package com.decisionhub.mapper;

import com.decisionhub.dto.request.CommentRequest;
import com.decisionhub.dto.response.CommentResponse;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Decision;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-01T21:39:17+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class CommentMapperImpl implements CommentMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public CommentResponse toResponse(Comment comment) {
        if ( comment == null ) {
            return null;
        }

        CommentResponse.CommentResponseBuilder commentResponse = CommentResponse.builder();

        commentResponse.decisionId( commentDecisionDecisionId( comment ) );
        commentResponse.parentCommentId( commentParentCommentCommentId( comment ) );
        commentResponse.user( userMapper.toResponse( comment.getUser() ) );
        commentResponse.commentId( comment.getCommentId() );
        commentResponse.createdAt( comment.getCreatedAt() );
        commentResponse.edited( comment.isEdited() );
        commentResponse.message( comment.getMessage() );
        commentResponse.replies( commentListToCommentResponseList( comment.getReplies() ) );

        return commentResponse.build();
    }

    @Override
    public Comment toEntity(CommentRequest request) {
        if ( request == null ) {
            return null;
        }

        Comment.CommentBuilder comment = Comment.builder();

        comment.message( request.getMessage() );

        return comment.build();
    }

    private Long commentDecisionDecisionId(Comment comment) {
        if ( comment == null ) {
            return null;
        }
        Decision decision = comment.getDecision();
        if ( decision == null ) {
            return null;
        }
        Long decisionId = decision.getDecisionId();
        if ( decisionId == null ) {
            return null;
        }
        return decisionId;
    }

    private Long commentParentCommentCommentId(Comment comment) {
        if ( comment == null ) {
            return null;
        }
        Comment parentComment = comment.getParentComment();
        if ( parentComment == null ) {
            return null;
        }
        Long commentId = parentComment.getCommentId();
        if ( commentId == null ) {
            return null;
        }
        return commentId;
    }

    protected List<CommentResponse> commentListToCommentResponseList(List<Comment> list) {
        if ( list == null ) {
            return null;
        }

        List<CommentResponse> list1 = new ArrayList<CommentResponse>( list.size() );
        for ( Comment comment : list ) {
            list1.add( toResponse( comment ) );
        }

        return list1;
    }
}
