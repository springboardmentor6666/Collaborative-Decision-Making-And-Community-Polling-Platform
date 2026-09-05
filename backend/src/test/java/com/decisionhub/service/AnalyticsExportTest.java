package com.decisionhub.service;

import com.decisionhub.entity.*;
import com.decisionhub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class AnalyticsExportTest {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private DecisionOptionRepository decisionOptionRepository;

    @Autowired
    private ComparisonFactorRepository comparisonFactorRepository;

    @Autowired
    private OptionScoreRepository optionScoreRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private PollOptionRepository pollOptionRepository;

    @Autowired
    private VoteRepository voteRepository;

    private User owner;
    private Decision decision;

    @BeforeEach
    void setUp() {
        optionScoreRepository.deleteAll();
        comparisonFactorRepository.deleteAll();
        voteRepository.deleteAll();
        pollOptionRepository.deleteAll();
        pollRepository.deleteAll();
        decisionOptionRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();

        owner = new User();
        owner.setEmail("export_owner@test.com");
        owner.setFullName("Export Owner");
        owner.setPasswordHash("pass");
        userRepository.save(owner);

        decision = new Decision();
        decision.setTitle("Cloud Provider Evaluation");
        decision.setOwner(owner);
        decision.setStatus("OPEN");
        decisionRepository.save(decision);

        DecisionOption opt1 = new DecisionOption();
        opt1.setDecision(decision);
        opt1.setLabel("AWS");
        decisionOptionRepository.save(opt1);

        DecisionOption opt2 = new DecisionOption();
        opt2.setDecision(decision);
        opt2.setLabel("GCP");
        decisionOptionRepository.save(opt2);

        ComparisonFactor factor1 = new ComparisonFactor();
        factor1.setDecision(decision);
        factor1.setName("Cost");
        comparisonFactorRepository.save(factor1);

        ComparisonFactor factor2 = new ComparisonFactor();
        factor2.setDecision(decision);
        factor2.setName("Reliability");
        comparisonFactorRepository.save(factor2);

        OptionScore s1 = new OptionScore(opt1, factor1, 8);
        optionScoreRepository.save(s1);
        OptionScore s2 = new OptionScore(opt1, factor2, 9);
        optionScoreRepository.save(s2);
        OptionScore s3 = new OptionScore(opt2, factor1, 9);
        optionScoreRepository.save(s3);
        OptionScore s4 = new OptionScore(opt2, factor2, 8);
        optionScoreRepository.save(s4);

        decision.getOptions().add(opt1);
        decision.getOptions().add(opt2);
        decision.getComparisonFactors().add(factor1);
        decision.getComparisonFactors().add(factor2);
    }

    @Test
    void exportDecisionCsv_ProducesValidCsvWithMatrixAndSummary() {
        byte[] csvBytes = analyticsService.exportDecisionCsv(decision.getId());
        assertNotNull(csvBytes);
        assertTrue(csvBytes.length > 0);

        String csv = new String(csvBytes, StandardCharsets.UTF_8);
        assertTrue(csv.contains("DECISION SUMMARY"));
        assertTrue(csv.contains("Cloud Provider Evaluation"));
        assertTrue(csv.contains("VOTE DISTRIBUTION BREAKDOWN"));
        assertTrue(csv.contains("MULTI-CRITERIA COMPARISON FACTORS SCORE MATRIX"));
        assertTrue(csv.contains("Option / Factor,\"Cost\",\"Reliability\""));
        assertTrue(csv.contains("\"AWS\",8,9"));
        assertTrue(csv.contains("\"GCP\",9,8"));
    }
}
