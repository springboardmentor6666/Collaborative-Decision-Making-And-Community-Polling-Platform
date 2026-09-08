package com.decisionhub.scheduler;

import com.decisionhub.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AccountLifecycleScheduler {

    private static final Logger log = LoggerFactory.getLogger(AccountLifecycleScheduler.class);

    private final UserService userService;

    public AccountLifecycleScheduler(UserService userService) {
        this.userService = userService;
    }

    /**
     * Executes every 60 seconds to process pending account deletions (14-day hold expired)
     * and automatically reactivate accounts whose deactivation period has elapsed.
     */
    @Scheduled(fixedRate = 60000)
    public void processAccountLifecycles() {
        try {
            userService.processScheduledDeletions();
        } catch (Exception e) {
            log.error("Error during scheduled account deletions execution", e);
        }

        try {
            userService.processScheduledReactivations();
        } catch (Exception e) {
            log.error("Error during scheduled account reactivations execution", e);
        }
    }
}
