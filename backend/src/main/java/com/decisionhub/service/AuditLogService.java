package com.decisionhub.service;

import com.decisionhub.entity.AuditLog;
import com.decisionhub.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logAction(String adminEmail, String action, String targetType, Long targetId, String details) {
        logAction(adminEmail, null, action, targetType, targetId, details, null);
    }

    @Transactional
    public void logAction(String adminEmail, com.decisionhub.entity.User actor, String action, String targetType, Long targetId, String details, String metadata) {
        AuditLog log = new AuditLog();
        log.setAdminEmail(adminEmail);
        log.setActor(actor);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);
        log.setMetadata(metadata);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
