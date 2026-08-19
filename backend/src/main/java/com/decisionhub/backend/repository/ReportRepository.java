package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    void deleteByDecisionId(Long decisionId);
}
