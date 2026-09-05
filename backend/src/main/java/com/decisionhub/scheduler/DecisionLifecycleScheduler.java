package com.decisionhub.scheduler;

import com.decisionhub.entity.Decision;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.service.DecisionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DecisionLifecycleScheduler {

    private static final Logger log = LoggerFactory.getLogger(DecisionLifecycleScheduler.class);

    private final DecisionRepository decisionRepository;
    private final DecisionService decisionService;

    public DecisionLifecycleScheduler(DecisionRepository decisionRepository, DecisionService decisionService) {
        this.decisionRepository = decisionRepository;
        this.decisionService = decisionService;
    }

    @Scheduled(fixedRate = 300000) // 5 minutes
    public void autoCloseExpiredDecisions() {
        LocalDateTime now = LocalDateTime.now();
        List<Decision> expiredDecisions = decisionRepository.findExpiredAutoCloseDecisions(now);

        if (expiredDecisions.isEmpty()) {
            return;
        }

        log.info("DecisionLifecycleScheduler found {} decision(s) to auto-close", expiredDecisions.size());

        for (Decision decision : expiredDecisions) {
            try {
                decisionService.closeDecision(decision.getId(), "SYSTEM");
                log.info("Auto-closed decision ID: {} ('{}')", decision.getId(), decision.getTitle());
            } catch (Exception e) {
                log.error("Failed to auto-close decision ID: {}", decision.getId(), e);
            }
        }
    }
}
