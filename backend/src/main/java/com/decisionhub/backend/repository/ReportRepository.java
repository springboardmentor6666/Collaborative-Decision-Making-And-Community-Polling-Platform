package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ReportRepository extends JpaRepository<Report, Long> {
    void deleteByDecisionId(Long decisionId);
    void deleteByDecisionIdIn(List<Long> decisionIds);
    void deleteByReportedById(Long userId);
    List<Report> findByDecisionId(Long decisionId);
}
