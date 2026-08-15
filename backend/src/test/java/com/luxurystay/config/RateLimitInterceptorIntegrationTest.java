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
    void anonymousReads_allowManyRequests() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.setRemoteAddr("192.168.1.100");
        // No Authorization header = anonymous

        for (int i = 0; i < 100; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            boolean allowed = rateLimitInterceptor.preHandle(request, response, new Object());
            assertTrue(allowed, "Read request " + (i + 1) + " should be allowed for anonymous user");
            assertEquals("300", response.getHeader("X-RateLimit-Limit"), "Anonymous read limit should be 300");
        }
    }

    @Test
    void anonymousWrites_getTightLimit() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/test");
        request.setRemoteAddr("192.168.1.150");

        for (int i = 0; i < 20; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            assertTrue(rateLimitInterceptor.preHandle(request, response, new Object()),
                    "Write request " + (i + 1) + " should be allowed");
            assertEquals("20", response.getHeader("X-RateLimit-Limit"), "Anonymous write limit should be 20");
        }

        // 21st write must be blocked
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        boolean blocked = rateLimitInterceptor.preHandle(request, blockedResponse, new Object());
        assertFalse(blocked, "21st anonymous write should be blocked");
        assertEquals("429", String.valueOf(blockedResponse.getStatus()));
    }

    @Test
    void authenticatedUser_higherLimit_allowsMoreRequests() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.setRemoteAddr("192.168.1.200");
        request.addHeader("Authorization", "Bearer test-jwt-token");

        for (int i = 0; i < 100; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            boolean allowed = rateLimitInterceptor.preHandle(request, response, new Object());
            assertTrue(allowed, "Request " + (i + 1) + " should be allowed for authenticated user");
            assertEquals("600", response.getHeader("X-RateLimit-Limit"), "Authenticated read limit should be 600");
        }
    }

    @Test
    void anonymousUser_separateBucketFromAuthenticated() {
        String ip = "192.168.1.300";

        // Exhaust anonymous write bucket (20/min)
        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest anonRequest = new MockHttpServletRequest("POST", "/api/test");
            anonRequest.setRemoteAddr(ip);
            MockHttpServletResponse response = new MockHttpServletResponse();
            rateLimitInterceptor.preHandle(anonRequest, response, new Object());
        }

        // 21st anonymous write should be rate limited
        MockHttpServletRequest anonRequest21 = new MockHttpServletRequest("POST", "/api/test");
        anonRequest21.setRemoteAddr(ip);
        MockHttpServletResponse anonResponse21 = new MockHttpServletResponse();
        boolean blocked = rateLimitInterceptor.preHandle(anonRequest21, anonResponse21, new Object());
        assertFalse(blocked, "21st anonymous write should be blocked");
        assertEquals("429", String.valueOf(anonResponse21.getStatus()));

        // Same IP with auth should still work (separate bucket)
        MockHttpServletRequest authRequest = new MockHttpServletRequest("POST", "/api/test");
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
        assertEquals("300", response.getHeader("X-RateLimit-Limit"));
    }

    @Test
    void rateLimitedRequest_returns429WithRetryAfter() {
        String ip = "192.168.1.500";

        // Exhaust anonymous write bucket
        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/test");
            req.setRemoteAddr(ip);
            rateLimitInterceptor.preHandle(req, new MockHttpServletResponse(), new Object());
        }

        // Next write should be 429
        MockHttpServletRequest blocked = new MockHttpServletRequest("POST", "/api/test");
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
        // Exhaust write bucket for IP 1
        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/test");
            req.setRemoteAddr("10.0.0.1");
            rateLimitInterceptor.preHandle(req, new MockHttpServletResponse(), new Object());
        }

        // IP 2 should still be allowed
        MockHttpServletRequest req2 = new MockHttpServletRequest("POST", "/api/test");
        req2.setRemoteAddr("10.0.0.2");
        MockHttpServletResponse resp2 = new MockHttpServletResponse();
        boolean allowed = rateLimitInterceptor.preHandle(req2, resp2, new Object());
        assertTrue(allowed, "Different IP should have its own bucket");
    }

    @Test
    void readsAndWrites_haveSeparateBuckets() {
        String ip = "192.168.1.600";

        // Exhaust the anonymous WRITE bucket
        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/test");
            req.setRemoteAddr(ip);
            rateLimitInterceptor.preHandle(req, new MockHttpServletResponse(), new Object());
        }

        // 21st write blocked...
        MockHttpServletRequest blockedWrite = new MockHttpServletRequest("POST", "/api/test");
        blockedWrite.setRemoteAddr(ip);
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        assertFalse(rateLimitInterceptor.preHandle(blockedWrite, blockedResponse, new Object()));

        // ...but reads from the same client still flow (page loads must never trip 429)
        MockHttpServletRequest readReq = new MockHttpServletRequest("GET", "/api/test");
        readReq.setRemoteAddr(ip);
        MockHttpServletResponse readResponse = new MockHttpServletResponse();
        assertTrue(rateLimitInterceptor.preHandle(readReq, readResponse, new Object()),
                "Reads should not be throttled by write-bucket exhaustion");
    }

    @Test
    void metrics_endpoint_returnsHealthyStatus() {
        Map<String, Object> metrics = rateLimitInterceptor.getMetrics();

        assertNotNull(metrics);
        assertEquals("healthy", metrics.get("status"));
        assertEquals(300, metrics.get("anonymousReadLimit"));
        assertEquals(20, metrics.get("anonymousWriteLimit"));
        assertEquals(600, metrics.get("authenticatedReadLimit"));
        assertEquals(60, metrics.get("authenticatedWriteLimit"));
        assertEquals(5, metrics.get("bucketTTLMinutes"));
        assertEquals(10_000, metrics.get("maxBuckets"));
        assertEquals("bucket4j + Caffeine", metrics.get("implementation"));
    }

    @Test
    void spoofedXForwardedFor_fromPublicIp_doesNotBypassRateLimit() {
        // SECURITY: a public (non-proxy) client must NOT be able to rotate X-Forwarded-For
        // to evade the rate limit. All spoofed requests share one bucket keyed on the real IP.
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/test");
        request.setRemoteAddr("8.8.8.8");

        for (int i = 0; i < 20; i++) {
            request.removeHeader("X-Forwarded-For");
            request.addHeader("X-Forwarded-For", "1.1.1." + i); // rotate spoofed identity each time
            MockHttpServletResponse response = new MockHttpServletResponse();
            assertTrue(rateLimitInterceptor.preHandle(request, response, new Object()),
                    "Request " + (i + 1) + " should be allowed");
        }

        // 21st request - same real IP, new spoofed XFF - must still be blocked
        request.removeHeader("X-Forwarded-For");
        request.addHeader("X-Forwarded-For", "9.9.9.9");
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        boolean blocked = rateLimitInterceptor.preHandle(request, blockedResponse, new Object());
        assertFalse(blocked, "Spoofed X-Forwarded-For must not bypass the rate limit");
        assertEquals("429", String.valueOf(blockedResponse.getStatus()));
    }

    @Test
    void xForwardedFor_fromTrustedProxy_isUsedAsClientKey() {
        // Behind a trusted proxy (site-local peer), the real client comes from X-Forwarded-For.
        String proxyIp = "10.0.0.5";
        String clientIp = "203.0.113.7";

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/test");
        request.setRemoteAddr(proxyIp);

        for (int i = 0; i < 20; i++) {
            request.removeHeader("X-Forwarded-For");
            request.addHeader("X-Forwarded-For", clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();
            rateLimitInterceptor.preHandle(request, response, new Object());
        }

        // 21st write from the same client through the proxy must be blocked
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        boolean blocked = rateLimitInterceptor.preHandle(request, blockedResponse, new Object());
        assertFalse(blocked, "Client behind trusted proxy should be rate limited as one identity");

        // A DIFFERENT client through the same proxy gets its own bucket
        MockHttpServletRequest otherClient = new MockHttpServletRequest("POST", "/api/test");
        otherClient.setRemoteAddr(proxyIp);
        otherClient.addHeader("X-Forwarded-For", "198.51.100.9");
        MockHttpServletResponse otherResponse = new MockHttpServletResponse();
        assertTrue(rateLimitInterceptor.preHandle(otherClient, otherResponse, new Object()),
                "Different client behind proxy should have its own bucket");
    }
}
