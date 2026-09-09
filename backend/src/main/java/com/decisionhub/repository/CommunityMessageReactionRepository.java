package com.decisionhub.repository;

import com.decisionhub.entity.CommunityMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CommunityMessageReactionRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'CommunityMessageReaction' entities.
 */
@Repository
public interface CommunityMessageReactionRepository extends JpaRepository<CommunityMessageReaction, Long> {

    List<CommunityMessageReaction> findByMessageId(Long messageId);

    Optional<CommunityMessageReaction> findByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);

    void deleteByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);

    boolean existsByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);
}
