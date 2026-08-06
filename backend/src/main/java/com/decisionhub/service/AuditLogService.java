package com.decisionhub.service;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.response.AuditLogResponse;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    void logAction(Long userId, String action, String entityType, Long entityId, String ipAddress);

    PagedResponse<AuditLogResponse> getAuditLogs(Pageable pageable);

    PagedResponse<AuditLogResponse> getUserAuditLogs(Long userId, Pageable pageable);
}
