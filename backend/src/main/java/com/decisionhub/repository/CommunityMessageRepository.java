package com.decisionhub.repository;

import com.decisionhub.entity.CommunityMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommunityMessageRepository extends JpaRepository<CommunityMessage, Long> {

    List<CommunityMessage> findByChannelIdAndIsDeletedFalseOrderByCreatedAtDesc(Long channelId, Pageable pageable);

    List<CommunityMessage> findByChannelIdAndCreatedAtBeforeAndIsDeletedFalseOrderByCreatedAtDesc(Long channelId, LocalDateTime before, Pageable pageable);

    List<CommunityMessage> findByChannelIdAndIsPinnedTrue(Long channelId);

    List<CommunityMessage> findByChannelIdAndIsPinnedTrueAndIsDeletedFalse(Long channelId);
}
