package com.decisionhub.repository;

import com.decisionhub.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByDecisionDecisionId(Long decisionId);

    Page<Report> findByGeneratedByUserId(Long userId, Pageable pageable);

    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
