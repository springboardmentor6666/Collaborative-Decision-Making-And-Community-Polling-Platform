package com.decisionhub.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Spring MVC HandlerInterceptor logging HTTP request/response durations and alerting slow queries (>500ms).
 */
@Component
@Slf4j
public class LoggingInterceptor implements HandlerInterceptor {

    private static final String START_TIME_ATTR = "startTime";
    private static final long SLOW_THRESHOLD_MS = 500L;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) {
        request.setAttribute(START_TIME_ATTR, System.currentTimeMillis());
        log.debug("HTTP Incoming Request: {} {} from IP {}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request,
                                @NonNull HttpServletResponse response,
                                @NonNull Object handler,
                                @Nullable Exception ex) {
        Long startTime = (Long) request.getAttribute(START_TIME_ATTR);
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();

            if (duration > SLOW_THRESHOLD_MS) {
                log.warn("SLOW API ALERT: {} {} returned {} in {} ms", request.getMethod(), request.getRequestURI(), status, duration);
            } else {
                log.info("HTTP Request Completed: {} {} -> Status {} [{} ms]", request.getMethod(), request.getRequestURI(), status, duration);
            }
        }
    }
}
