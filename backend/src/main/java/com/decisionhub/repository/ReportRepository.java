package com.decisionhub.repository;

import com.decisionhub.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByStatus(String status);

    List<Report> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    List<Report> findByReportedUserIdOrderByCreatedAtDesc(Long reportedUserId);

    long countByStatusIgnoreCase(String status);

    long countByCreatedAtGreaterThanEqual(LocalDateTime date);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT r.contentType, COUNT(r) FROM Report r GROUP BY r.contentType")
    List<Object[]> countGroupedByContentType();

    @Query("SELECT r.status, COUNT(r) FROM Report r GROUP BY r.status")
    List<Object[]> countGroupedByStatus();

    @Query("SELECT r FROM Report r WHERE " +
           "(:status IS NULL OR UPPER(r.status) = UPPER(:status)) AND " +
           "(:contentType IS NULL OR UPPER(r.contentType) = UPPER(:contentType)) AND " +
           "(:search IS NULL OR LOWER(r.reason) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.reporter.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " (r.reportedUser IS NOT NULL AND LOWER(r.reportedUser.email) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Report> findWithFilters(@Param("status") String status,
                                 @Param("contentType") String contentType,
                                 @Param("search") String search,
                                 Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.contentType = :contentType AND r.contentId = :contentId")
    List<Report> findByContentTypeAndContentId(@Param("contentType") String contentType, @Param("contentId") Long contentId);
}
