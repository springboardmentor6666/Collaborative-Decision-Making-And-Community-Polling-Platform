package com.decisionhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {

    private Long attachmentId;
    private Long decisionId;
    private Long commentId;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private UserResponse uploadedBy;
    private LocalDateTime uploadedAt;
}
