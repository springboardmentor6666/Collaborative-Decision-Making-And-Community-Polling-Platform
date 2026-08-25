package com.decisionhub.event;

import com.decisionhub.entity.User;
import org.springframework.context.ApplicationEvent;

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
