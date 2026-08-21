package com.decisionhub.repository;

import com.decisionhub.common.enums.NominationStatus;
import com.decisionhub.entity.Nominee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NomineeRepository extends JpaRepository<Nominee, Long>, JpaSpecificationExecutor<Nominee> {
    List<Nominee> findByVotingCategoryCategoryId(Long categoryId);
    List<Nominee> findByVotingCategoryCategoryIdAndNominationStatus(Long categoryId, NominationStatus status);
}
