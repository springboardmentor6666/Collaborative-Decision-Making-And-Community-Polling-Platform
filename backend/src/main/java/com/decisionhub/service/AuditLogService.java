package com.decisionhub.service;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.response.AuditLogResponse;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    void logAction(Long userId, String action, String entityType, Long entityId, String details, String ipAddress);

    void logAction(Long userId, String action, String entityType, Long entityId, String details);

    void logAction(Long userId, String action, String entityType, Long entityId);

    void logAction(String action, String entityType, Long entityId, String details);

    PagedResponse<AuditLogResponse> getAuditLogs(Pageable pageable);

    PagedResponse<AuditLogResponse> getUserAuditLogs(Long userId, Pageable pageable);
}
