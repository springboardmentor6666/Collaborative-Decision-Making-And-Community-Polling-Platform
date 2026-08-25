package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.CommunityMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityMessageRepository extends JpaRepository<CommunityMessage, Long> {
    List<CommunityMessage> findByCommunityIdOrderByCreatedAtAsc(Long communityId);
}
