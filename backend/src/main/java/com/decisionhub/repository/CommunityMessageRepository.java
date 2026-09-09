package com.decisionhub.repository;

import com.decisionhub.entity.CommunityMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CommunityMessageRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'CommunityMessage' entities.
 */
@Repository
public interface CommunityMessageRepository extends JpaRepository<CommunityMessage, Long> {

    List<CommunityMessage> findByChannelIdAndIsDeletedFalseOrderByCreatedAtDesc(Long channelId, Pageable pageable);

    List<CommunityMessage> findByChannelIdAndCreatedAtBeforeAndIsDeletedFalseOrderByCreatedAtDesc(Long channelId, LocalDateTime before, Pageable pageable);

    List<CommunityMessage> findByChannelIdAndIsPinnedTrue(Long channelId);

    List<CommunityMessage> findByChannelIdAndIsPinnedTrueAndIsDeletedFalse(Long channelId);

    long countByIsDeletedFalse();

    long countByCreatedAtGreaterThanEqual(LocalDateTime date);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
