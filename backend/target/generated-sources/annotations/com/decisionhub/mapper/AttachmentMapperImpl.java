package com.decisionhub.mapper;

import com.decisionhub.dto.response.AttachmentResponse;
import com.decisionhub.entity.Attachment;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Decision;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-01T21:39:18+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class AttachmentMapperImpl implements AttachmentMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public AttachmentResponse toResponse(Attachment attachment) {
        if ( attachment == null ) {
            return null;
        }

        AttachmentResponse.AttachmentResponseBuilder attachmentResponse = AttachmentResponse.builder();

        attachmentResponse.decisionId( attachmentDecisionDecisionId( attachment ) );
        attachmentResponse.commentId( attachmentCommentCommentId( attachment ) );
        attachmentResponse.uploadedBy( userMapper.toResponse( attachment.getUploadedBy() ) );
        attachmentResponse.uploadedAt( attachment.getCreatedAt() );
        attachmentResponse.attachmentId( attachment.getAttachmentId() );
        attachmentResponse.fileName( attachment.getFileName() );
        attachmentResponse.fileType( attachment.getFileType() );
        attachmentResponse.fileUrl( attachment.getFileUrl() );

        return attachmentResponse.build();
    }

    private Long attachmentDecisionDecisionId(Attachment attachment) {
        if ( attachment == null ) {
            return null;
        }
        Decision decision = attachment.getDecision();
        if ( decision == null ) {
            return null;
        }
        Long decisionId = decision.getDecisionId();
        if ( decisionId == null ) {
            return null;
        }
        return decisionId;
    }

    private Long attachmentCommentCommentId(Attachment attachment) {
        if ( attachment == null ) {
            return null;
        }
        Comment comment = attachment.getComment();
        if ( comment == null ) {
            return null;
        }
        Long commentId = comment.getCommentId();
        if ( commentId == null ) {
            return null;
        }
        return commentId;
    }
}
