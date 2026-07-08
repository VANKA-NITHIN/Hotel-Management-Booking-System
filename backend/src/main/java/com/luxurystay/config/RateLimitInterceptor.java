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

    private static final int ANONYMOUS_LIMIT = 30;
    private static final int AUTHENTICATED_LIMIT = 120;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String clientKey = getClientKey(request);
        boolean hasAuth = request.getHeader("Authorization") != null;
        int limit = hasAuth ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT;

        String bucketKey = clientKey + (hasAuth ? ":auth" : ":anon");
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

    /**
     * Get rate limit metrics for monitoring
     */
    public Map<String, Object> getMetrics() {
        return Map.of(
                "activeBuckets", buckets.estimatedSize(),
                "status", "healthy",
                "anonymousLimit", ANONYMOUS_LIMIT,
                "authenticatedLimit", AUTHENTICATED_LIMIT,
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
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
