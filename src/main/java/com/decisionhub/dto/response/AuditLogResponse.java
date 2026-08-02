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
public class AuditLogResponse {

    private Long logId;
    private UserResponse user;
    private String action;
    private String entityType;
    private Long entityId;
    private String ipAddress;
    private LocalDateTime createdAt;
}
