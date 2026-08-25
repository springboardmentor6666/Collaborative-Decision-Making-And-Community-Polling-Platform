package com.decisionhub.repository;

import com.decisionhub.entity.GeneratedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeneratedReportRepository extends JpaRepository<GeneratedReport, Long> {
    List<GeneratedReport> findByGeneratedByIdOrderByCreatedAtDesc(Long userId);
    List<GeneratedReport> findAllByOrderByCreatedAtDesc();
}
