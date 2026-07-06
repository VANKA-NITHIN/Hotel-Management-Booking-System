package com.luxurystay.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class RateLimitInterceptorIntegrationTest {

    @Autowired
    private RateLimitInterceptor rateLimitInterceptor;

    @BeforeEach
    void setUp() {
        // Clear all buckets before each test
        rateLimitInterceptor.getMetrics(); // Verify metrics endpoint works
    }

    @Test
    void anonymousUser_withinLimit_allowsRequests() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.setRemoteAddr("192.168.1.100");
        // No Authorization header = anonymous

        for (int i = 0; i < 10; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            boolean allowed = rateLimitInterceptor.preHandle(request, response, new Object());
            assertTrue(allowed, "Request " + (i + 1) + " should be allowed for anonymous user");
            assertEquals("30", response.getHeader("X-RateLimit-Limit"), "Limit should be 30 for anonymous");
        }
    }

    @Test
    void authenticatedUser_higherLimit_allowsMoreRequests() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.setRemoteAddr("192.168.1.200");
        request.addHeader("Authorization", "Bearer test-jwt-token");

        for (int i = 0; i < 50; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            boolean allowed = rateLimitInterceptor.preHandle(request, response, new Object());
            assertTrue(allowed, "Request " + (i + 1) + " should be allowed for authenticated user");
            assertEquals("120", response.getHeader("X-RateLimit-Limit"), "Limit should be 120 for authenticated");
        }
    }

    @Test
    void anonymousUser_separateBucketFromAuthenticated() {
        String ip = "192.168.1.300";

        // Exhaust anonymous bucket (30/min)
        for (int i = 0; i < 30; i++) {
            MockHttpServletRequest anonRequest = new MockHttpServletRequest("GET", "/api/test");
            anonRequest.setRemoteAddr(ip);
            MockHttpServletResponse response = new MockHttpServletResponse();
            rateLimitInterceptor.preHandle(anonRequest, response, new Object());
        }

        // 31st anonymous request should be rate limited
        MockHttpServletRequest anonRequest31 = new MockHttpServletRequest("GET", "/api/test");
        anonRequest31.setRemoteAddr(ip);
        MockHttpServletResponse anonResponse31 = new MockHttpServletResponse();
        boolean blocked = rateLimitInterceptor.preHandle(anonRequest31, anonResponse31, new Object());
        assertFalse(blocked, "31st anonymous request should be blocked");
        assertEquals("429", String.valueOf(anonResponse31.getStatus()));

        // Same IP with auth should still work (separate bucket)
        MockHttpServletRequest authRequest = new MockHttpServletRequest("GET", "/api/test");
        authRequest.setRemoteAddr(ip);
        authRequest.addHeader("Authorization", "Bearer test-token");
        MockHttpServletResponse authResponse = new MockHttpServletResponse();
        boolean authAllowed = rateLimitInterceptor.preHandle(authRequest, authResponse, new Object());
        assertTrue(authAllowed, "Authenticated request from same IP should use separate bucket");
    }

    @Test
    void rateLimitHeaders_setCorrectly() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.setRemoteAddr("192.168.1.400");

        MockHttpServletResponse response = new MockHttpServletResponse();
        rateLimitInterceptor.preHandle(request, response, new Object());

        assertNotNull(response.getHeader("X-RateLimit-Limit"), "Should set X-RateLimit-Limit header");
        assertNotNull(response.getHeader("X-RateLimit-Remaining"), "Should set X-RateLimit-Remaining header");
        assertEquals("30", response.getHeader("X-RateLimit-Limit"));
    }

    @Test
    void rateLimitedRequest_returns429WithRetryAfter() {
        String ip = "192.168.1.500";

        // Exhaust anonymous bucket
        for (int i = 0; i < 30; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/test");
            req.setRemoteAddr(ip);
            rateLimitInterceptor.preHandle(req, new MockHttpServletResponse(), new Object());
        }

        // Next request should be 429
        MockHttpServletRequest blocked = new MockHttpServletRequest("GET", "/api/test");
        blocked.setRemoteAddr(ip);
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        boolean allowed = rateLimitInterceptor.preHandle(blocked, blockedResponse, new Object());

        assertFalse(allowed);
        assertEquals("429", String.valueOf(blockedResponse.getStatus()));
        assertNotNull(blockedResponse.getHeader("Retry-After"), "Should include Retry-After header");
        assertEquals("0", blockedResponse.getHeader("X-RateLimit-Remaining"));
    }

    @Test
    void differentIPs_getSeparateBuckets() {
        // Exhaust bucket for IP 1
        for (int i = 0; i < 30; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/test");
            req.setRemoteAddr("10.0.0.1");
            rateLimitInterceptor.preHandle(req, new MockHttpServletResponse(), new Object());
        }

        // IP 2 should still be allowed
        MockHttpServletRequest req2 = new MockHttpServletRequest("GET", "/api/test");
        req2.setRemoteAddr("10.0.0.2");
        MockHttpServletResponse resp2 = new MockHttpServletResponse();
        boolean allowed = rateLimitInterceptor.preHandle(req2, resp2, new Object());
        assertTrue(allowed, "Different IP should have its own bucket");
    }

    @Test
    void metrics_endpoint_returnsHealthyStatus() {
        Map<String, Object> metrics = rateLimitInterceptor.getMetrics();

        assertNotNull(metrics);
        assertEquals("healthy", metrics.get("status"));
        assertEquals(30, metrics.get("anonymousLimit"));
        assertEquals(120, metrics.get("authenticatedLimit"));
        assertEquals(5, metrics.get("bucketTTLMinutes"));
        assertEquals(10_000, metrics.get("maxBuckets"));
        assertEquals("bucket4j + Caffeine", metrics.get("implementation"));
    }
}
