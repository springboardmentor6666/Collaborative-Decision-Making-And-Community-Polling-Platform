package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Activity;
import com.decisionhub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByUserOrderByAtDesc(User user);
}
