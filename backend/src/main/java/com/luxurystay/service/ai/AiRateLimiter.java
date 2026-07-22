package com.luxurystay.service.ai;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AiRateLimiter {

    // Simple in-memory rate limiter per session. Allows 20 requests per session.
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 20;

    public boolean isAllowed(String sessionId) {
        if (sessionId == null) return true;
        
        requestCounts.putIfAbsent(sessionId, new AtomicInteger(0));
        int count = requestCounts.get(sessionId).incrementAndGet();
        
        return count <= MAX_REQUESTS;
    }
    
    public void reset(String sessionId) {
        requestCounts.remove(sessionId);
    }
}
