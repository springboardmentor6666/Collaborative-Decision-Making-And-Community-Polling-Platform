package com.decisionhub.repository;

import com.decisionhub.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByAdminEmailOrderByTimestampDesc(String adminEmail);
    List<AuditLog> findAllByOrderByTimestampDesc();
}
