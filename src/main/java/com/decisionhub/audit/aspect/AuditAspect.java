package com.decisionhub.audit.aspect;

import com.decisionhub.audit.annotation.Auditable;
import com.decisionhub.security.SecurityUtils;
import com.decisionhub.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * AOP Aspect intercepting methods annotated with @Auditable and logging audit trails automatically.
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogService auditLogService;

    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void auditMethodExecution(JoinPoint joinPoint, Auditable auditable, Object result) {
        try {
            Long userId = SecurityUtils.getCurrentUserId().orElse(null);
            String ipAddress = getClientIpAddress();

            auditLogService.logAction(
                    userId,
                    auditable.action(),
                    auditable.entityType(),
                    null,
                    ipAddress
            );
        } catch (Exception ex) {
            log.error("Failed to record AOP audit log: {}", ex.getMessage());
        }
    }

    private String getClientIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0];
            }
            return request.getRemoteAddr();
        }
        return "127.0.0.1";
    }
}
