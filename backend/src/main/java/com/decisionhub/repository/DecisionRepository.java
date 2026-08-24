package com.decisionhub.repository;

import com.decisionhub.entity.Decision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, Long>, JpaSpecificationExecutor<Decision> {
    List<Decision> findByOwnerId(Long ownerId);
    List<Decision> findByVisibility(String visibility);
    List<Decision> findByIsDeletedFalse();
    List<Decision> findByOwnerIdAndIsDeletedFalse(Long ownerId);
    List<Decision> findByCommunityIdAndIsDeletedFalse(Long communityId);
    long countByCommunityIdAndIsDeletedFalse(Long communityId);

    @Query("SELECT d FROM Decision d WHERE d.isDeleted = false " +
           "AND (:categoryId IS NULL OR d.category.id = :categoryId) " +
           "AND (:status IS NULL OR UPPER(d.status) = UPPER(:status)) " +
           "AND (:search IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Decision> findWithFilters(@Param("categoryId") Long categoryId,
                                  @Param("status") String status,
                                  @Param("search") String search,
                                  Pageable pageable);
}
