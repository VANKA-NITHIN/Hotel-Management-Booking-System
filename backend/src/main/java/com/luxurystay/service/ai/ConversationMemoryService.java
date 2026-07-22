package com.luxurystay.service.ai;

import com.luxurystay.dto.AiMessageDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConversationMemoryService {

    // Simple in-memory storage for MVP. In production (Phase 7B), this can move to Redis.
    private final Map<String, List<AiMessageDTO>> memory = new ConcurrentHashMap<>();

    public List<AiMessageDTO> getHistory(String sessionId) {
        return memory.getOrDefault(sessionId, new ArrayList<>());
    }

    public void addMessage(String sessionId, AiMessageDTO message) {
        memory.computeIfAbsent(sessionId, k -> new ArrayList<>()).add(message);
    }
    
    public void clearHistory(String sessionId) {
        memory.remove(sessionId);
    }
}
