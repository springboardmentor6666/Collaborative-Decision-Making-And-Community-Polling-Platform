package com.decisionhub.repository;

import com.decisionhub.common.enums.AbuseReportStatus;
import com.decisionhub.entity.AbuseReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AbuseReportRepository extends JpaRepository<AbuseReport, Long> {

    @Query("SELECT r FROM AbuseReport r " +
           "LEFT JOIN r.decision d " +
           "LEFT JOIN d.community dc " +
           "LEFT JOIN r.community c " +
           "WHERE (dc.communityId = :communityId OR c.communityId = :communityId) " +
           "AND r.status = :status")
    Page<AbuseReport> findByCommunityIdAndStatus(@Param("communityId") Long communityId, @Param("status") AbuseReportStatus status, Pageable pageable);
    
    @Query("SELECT r FROM AbuseReport r " +
           "LEFT JOIN r.decision d " +
           "LEFT JOIN d.community dc " +
           "LEFT JOIN r.community c " +
           "WHERE (dc.communityId = :communityId OR c.communityId = :communityId)")
    Page<AbuseReport> findByCommunityId(@Param("communityId") Long communityId, Pageable pageable);
    
    Page<AbuseReport> findByStatus(AbuseReportStatus status, Pageable pageable);
}
