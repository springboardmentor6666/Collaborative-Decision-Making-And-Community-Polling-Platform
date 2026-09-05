package com.decisionhub.repository;

import com.decisionhub.entity.CommunityMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityMessageReactionRepository extends JpaRepository<CommunityMessageReaction, Long> {

    List<CommunityMessageReaction> findByMessageId(Long messageId);

    Optional<CommunityMessageReaction> findByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);

    void deleteByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);

    boolean existsByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);
}
