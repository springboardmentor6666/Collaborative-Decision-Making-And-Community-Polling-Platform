package com.decisionhub.event;

import com.decisionhub.entity.User;
import org.springframework.context.ApplicationEvent;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: NotificationEvent
 * Architecture Tier: Application Event (Event-Driven Tier)
 * Package: com.decisionhub.event
 *
 * Purpose:
 *   Spring application domain event representing an alert to be processed and dispatched to targeted user accounts.
 */

public class NotificationEvent extends ApplicationEvent {

    private final User targetUser;
    private final String type;
    private final String message;
    private final String emailSubject;

    public NotificationEvent(Object source, User targetUser, String type, String message, String emailSubject) {
        super(source);
        this.targetUser = targetUser;
        this.type = type;
        this.message = message;
        this.emailSubject = emailSubject;
    }

    public User getTargetUser() {
        return targetUser;
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public String getEmailSubject() {
        return emailSubject;
    }
}
