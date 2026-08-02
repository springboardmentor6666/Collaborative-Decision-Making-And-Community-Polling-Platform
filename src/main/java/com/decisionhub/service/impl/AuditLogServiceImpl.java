package com.decisionhub.service.impl;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.response.AuditLogResponse;
import com.decisionhub.entity.AuditLog;
import com.decisionhub.entity.User;
import com.decisionhub.mapper.AuditLogMapper;
import com.decisionhub.repository.AuditLogRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Transactional
    public void logAction(Long userId, String action, String entityType, Long entityId, String ipAddress) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
        log.info("Audit log recorded: action=[{}], user=[{}], entity=[{}:{}]", action, userId, entityType, entityId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getAuditLogs(Pageable pageable) {
        Page<AuditLogResponse> page = auditLogRepository.findAll(pageable).map(auditLogMapper::toResponse);
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getUserAuditLogs(Long userId, Pageable pageable) {
        Page<AuditLogResponse> page = auditLogRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(auditLogMapper::toResponse);
        return PagedResponse.fromPage(page);
    }
}
