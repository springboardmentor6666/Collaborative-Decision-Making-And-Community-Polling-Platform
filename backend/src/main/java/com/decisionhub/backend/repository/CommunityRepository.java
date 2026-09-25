package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Community;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityRepository extends JpaRepository<Community, Long> {
    java.util.List<Community> findByOwnerId(Long ownerId);
}
