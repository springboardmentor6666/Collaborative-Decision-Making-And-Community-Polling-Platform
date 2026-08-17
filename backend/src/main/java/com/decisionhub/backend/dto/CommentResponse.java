package com.decisionhub.backend.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommentResponse {

    private Long id;

    private String content;

    private String userName;

    private Long userId;

    private LocalDateTime createdAt;

    private boolean canDelete;
}