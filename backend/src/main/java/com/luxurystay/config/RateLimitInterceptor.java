package com.luxurystay.config;

import org.springframework.lang.NonNull;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;

@Component
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterAccess(Duration.ofMinutes(5))
            .build();

    // Per-method limits: reads (GET) get generous budgets because a single page load fires
    // many parallel API calls, while writes (POST/PUT/DELETE/PATCH) stay tight because that's
    // where brute-force attacks (login, coupon guessing, contact spam) actually happen.
    // All values are overridable via application.yml (app.rate-limit.*).
    @Value("${app.rate-limit.anonymous-read:300}")
    private int anonymousReadLimit;

    @Value("${app.rate-limit.anonymous-write:20}")
    private int anonymousWriteLimit;

    @Value("${app.rate-limit.authenticated-read:600}")
    private int authenticatedReadLimit;

    @Value("${app.rate-limit.authenticated-write:60}")
    private int authenticatedWriteLimit;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String clientKey = getClientKey(request);
        boolean hasAuth = request.getHeader("Authorization") != null;
        boolean isWrite = isWriteMethod(request.getMethod());

        int limit = resolveLimit(hasAuth, isWrite);
        String bucketKey = clientKey + (hasAuth ? ":auth" : ":anon") + (isWrite ? ":w" : ":r");
        Bucket bucket = buckets.get(bucketKey, k -> createBucket(limit));

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        }

        long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
        log.warn("Rate limit exceeded for client: {}. Retry after {}s", clientKey, waitSeconds);

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("Retry-After", String.valueOf(waitSeconds));
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setContentType("application/json");
        try {
            response.getWriter().write(
                "{\"error\":\"Rate limit exceeded. Please try again later.\",\"retryAfter\":" + waitSeconds + "}");
        } catch (Exception ignored) {}
        return false;
    }

    private int resolveLimit(boolean hasAuth, boolean isWrite) {
        if (hasAuth) {
            return isWrite ? authenticatedWriteLimit : authenticatedReadLimit;
        }
        return isWrite ? anonymousWriteLimit : anonymousReadLimit;
    }

    private boolean isWriteMethod(String method) {
        if (method == null) {
            return false;
        }
        return method.equalsIgnoreCase("POST")
                || method.equalsIgnoreCase("PUT")
                || method.equalsIgnoreCase("DELETE")
                || method.equalsIgnoreCase("PATCH");
    }

    /**
     * Get rate limit metrics for monitoring
     */
    public Map<String, Object> getMetrics() {
        return Map.of(
                "activeBuckets", buckets.estimatedSize(),
                "status", "healthy",
                "anonymousReadLimit", anonymousReadLimit,
                "anonymousWriteLimit", anonymousWriteLimit,
                "authenticatedReadLimit", authenticatedReadLimit,
                "authenticatedWriteLimit", authenticatedWriteLimit,
                "bucketTTLMinutes", 5,
                "maxBuckets", 10_000,
                "implementation", "bucket4j + Caffeine"
        );
    }

    private Bucket createBucket(int requestsPerMinute) {
        Bandwidth limit = Bandwidth.builder().capacity(requestsPerMinute).refillGreedy(requestsPerMinute, Duration.ofMinutes(1)).build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientKey(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();

        // SECURITY: only trust X-Forwarded-For when the immediate peer is a trusted proxy
        // (private/loopback network, e.g. Render/Railway's internal router or localhost).
        // Otherwise a remote attacker can send a spoofed X-Forwarded-For header and rotate
        // identities to bypass the rate limit entirely.
        if (isTrustedProxy(remoteAddr)) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
        }
        return remoteAddr;
    }

    private boolean isTrustedProxy(String ip) {
        if (ip == null || ip.isBlank()) {
            return false;
        }
        try {
            java.net.InetAddress address = java.net.InetAddress.getByName(ip);
            return address.isLoopbackAddress() || address.isSiteLocalAddress();
        } catch (Exception e) {
            return false;
        }
    }
}
