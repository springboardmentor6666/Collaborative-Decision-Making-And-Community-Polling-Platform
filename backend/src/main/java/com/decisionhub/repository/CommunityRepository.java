package com.decisionhub.repository;

import com.decisionhub.common.enums.CommunityVisibility;
import com.decisionhub.entity.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long>, JpaSpecificationExecutor<Community> {

    Page<Community> findByVisibility(CommunityVisibility visibility, Pageable pageable);



    Page<Community> findByOwnerUserId(Long ownerId, Pageable pageable);

    @Query("SELECT c FROM Community c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Community> searchCommunities(@Param("query") String query, Pageable pageable);

    List<Community> findTop5ByOrderByCreatedAtDesc();
}
