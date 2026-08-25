package com.decisionhub.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommunityMessageResponse {
    private Long id;
    private String content;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    private boolean canDelete;
}
