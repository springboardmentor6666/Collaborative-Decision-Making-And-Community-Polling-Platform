package com.decisionhub.service.impl;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.response.AuditLogResponse;
import com.decisionhub.entity.AuditLog;
import com.decisionhub.entity.User;
import com.decisionhub.mapper.AuditLogMapper;
import com.decisionhub.repository.AuditLogRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.SecurityUtils;
import com.decisionhub.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Transactional
    public void logAction(Long userId, String action, String entityType, Long entityId, String details, String ipAddress) {
        try {
            Long effectiveUserId = userId != null ? userId : SecurityUtils.getCurrentUserId().orElse(null);
            String effectiveIp = ipAddress != null ? ipAddress : getClientIpAddress();

            User user = effectiveUserId != null ? userRepository.findById(effectiveUserId).orElse(null) : null;

            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(effectiveIp)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log recorded: action=[{}], user=[{}], entity=[{}:{}], details=[{}]", action, effectiveUserId, entityType, entityId, details);
        } catch (Exception e) {
            log.error("Failed to record audit log: action={}, error={}", action, e.getMessage());
        }
    }

    @Override
    @Transactional
    public void logAction(Long userId, String action, String entityType, Long entityId, String details) {
        logAction(userId, action, entityType, entityId, details, null);
    }

    @Override
    @Transactional
    public void logAction(Long userId, String action, String entityType, Long entityId) {
        logAction(userId, action, entityType, entityId, null, null);
    }

    @Override
    @Transactional
    public void logAction(String action, String entityType, Long entityId, String details) {
        logAction(null, action, entityType, entityId, details, null);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getAuditLogs(Pageable pageable) {
        Page<AuditLogResponse> page = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(auditLogMapper::toResponse);
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getUserAuditLogs(Long userId, Pageable pageable) {
        Page<AuditLogResponse> page = auditLogRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(auditLogMapper::toResponse);
        return PagedResponse.fromPage(page);
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ignored) {
        }
        return "127.0.0.1";
    }
}
