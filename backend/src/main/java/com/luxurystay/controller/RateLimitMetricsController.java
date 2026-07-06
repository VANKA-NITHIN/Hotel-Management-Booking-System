package com.luxurystay.controller;

import com.luxurystay.config.RateLimitInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/admin/rate-limit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RateLimitMetricsController {

    private final RateLimitInterceptor rateLimitInterceptor;

    /**
     * GET /api/admin/rate-limit/metrics
     * Returns rate limiting statistics for monitoring
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(rateLimitInterceptor.getMetrics());
    }

    /**
     * GET /api/admin/rate-limit/health
     * Simple health check for rate limiter
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "component", "RateLimitInterceptor",
                "implementation", "bucket4j + Caffeine"
        ));
    }
}
