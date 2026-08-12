package com.decisionhub.repository;

import com.decisionhub.common.enums.AbuseReportStatus;
import com.decisionhub.entity.AbuseReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AbuseReportRepository extends JpaRepository<AbuseReport, Long> {
    Page<AbuseReport> findByDecision_Community_CommunityIdAndStatus(Long communityId, AbuseReportStatus status, Pageable pageable);
    
    Page<AbuseReport> findByDecision_Community_CommunityId(Long communityId, Pageable pageable);
    
    Page<AbuseReport> findByStatus(AbuseReportStatus status, Pageable pageable);
}
