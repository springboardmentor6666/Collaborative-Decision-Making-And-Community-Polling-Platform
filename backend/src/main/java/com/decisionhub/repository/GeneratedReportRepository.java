package com.decisionhub.repository;

import com.decisionhub.entity.GeneratedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: GeneratedReportRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'GeneratedReport' entities.
 */
@Repository
public interface GeneratedReportRepository extends JpaRepository<GeneratedReport, Long> {
    List<GeneratedReport> findByGeneratedByIdOrderByCreatedAtDesc(Long userId);
    List<GeneratedReport> findAllByOrderByCreatedAtDesc();
}
