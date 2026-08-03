package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Option;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OptionRepository extends JpaRepository<Option, Long> {
}