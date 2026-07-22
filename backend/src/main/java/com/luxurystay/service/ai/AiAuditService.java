package com.luxurystay.service.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AiAuditService {

    public void logRequest(String sessionId, String userId, int promptLength) {
        log.info("AI Request Started | Session: {} | User: {} | Prompt Length: {}", sessionId, userId != null ? userId : "Guest", promptLength);
    }

    public void logResponse(String sessionId, String modelUsed, long executionTimeMs) {
        log.info("AI Response Generated | Session: {} | Model: {} | Time: {}ms", sessionId, modelUsed, executionTimeMs);
    }
    
    public void logRateLimit(String sessionId, String userId) {
        log.warn("AI Rate Limit Exceeded | Session: {} | User: {}", sessionId, userId != null ? userId : "Guest");
    }
}
