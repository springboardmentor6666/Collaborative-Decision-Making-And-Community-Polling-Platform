package com.decisionhub.backend.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {

    private Long id;

    private String message;

    private boolean read;

    private LocalDateTime createdAt;
}