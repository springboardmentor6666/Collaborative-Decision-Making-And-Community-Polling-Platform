package com.decisionhub.filter;

import com.decisionhub.security.SecurityUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter that generates a unique requestId per incoming HTTP request and binds it to SLF4J MDC context for distributed tracing.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MdcLoggingFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_KEY = "requestId";
    private static final String USER_ID_KEY = "userId";
    private static final String HEADER_REQUEST_ID = "X-Request-ID";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String requestId = request.getHeader(HEADER_REQUEST_ID);
            if (requestId == null || requestId.isEmpty()) {
                requestId = UUID.randomUUID().toString().substring(0, 8);
            }

            MDC.put(REQUEST_ID_KEY, requestId);
            response.setHeader(HEADER_REQUEST_ID, requestId);

            SecurityUtils.getCurrentUserId().ifPresent(id -> MDC.put(USER_ID_KEY, id.toString()));

            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
