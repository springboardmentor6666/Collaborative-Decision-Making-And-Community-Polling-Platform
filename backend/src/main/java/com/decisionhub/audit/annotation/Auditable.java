package com.decisionhub.audit.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom annotation marking service/controller methods for automatic AOP audit logging.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    /**
     * Action name logged in audit log (e.g. 'CREATE_DECISION', 'VOTE', 'DELETE_COMMENT').
     */
    String action();

    /**
     * Entity type associated with the action (e.g. 'DECISION', 'COMMENT', 'USER').
     */
    String entityType() default "";
}
