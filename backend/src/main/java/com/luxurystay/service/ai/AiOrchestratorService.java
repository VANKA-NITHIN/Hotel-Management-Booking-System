package com.luxurystay.service.ai;

import com.luxurystay.dto.AiChatRequestDTO;
import com.luxurystay.dto.AiChatResponseDTO;
import com.luxurystay.dto.AiMessageDTO;
import com.luxurystay.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiOrchestratorService {

    private final AiProviderService aiProviderService;
    private final ConversationMemoryService memoryService;
    private final ContextHydrationService hydrationService;
    private final PromptBuilderService promptBuilderService;
    private final AiAuditService auditService;
    private final AiRateLimiter rateLimiter;
    private final AuthService authService;

    public AiChatResponseDTO processChat(AiChatRequestDTO request, Authentication authentication) {
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = UUID.randomUUID().toString();
        }

        String userId = null;
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            try {
                userId = authService.getCurrentUser(authentication).getId().toString();
            } catch (Exception ignored) {
            }
        }

        if (!rateLimiter.isAllowed(sessionId)) {
            auditService.logRateLimit(sessionId, userId);
            return AiChatResponseDTO.builder()
                    .sessionId(sessionId)
                    .role("assistant")
                    .content("I'm receiving too many requests right now. Please wait a moment before sending another message.")
                    .build();
        }

        auditService.logRequest(sessionId, userId, request.getUserMessage() != null ? request.getUserMessage().length() : 0);
        long startTime = System.currentTimeMillis();

        // Hydrate context and build system prompt
        Map<String, Object> userContext = hydrationService.hydrateUserContext(authentication);
        String systemPrompt = promptBuilderService.buildSystemPrompt(userContext);

        // Fetch history or use provided messages
        List<AiMessageDTO> conversation = new ArrayList<>();
        
        if (request.getMessages() != null && !request.getMessages().isEmpty()) {
            conversation.addAll(request.getMessages());
        } else {
            conversation.addAll(memoryService.getHistory(sessionId));
            if (request.getUserMessage() != null) {
                AiMessageDTO userMsg = AiMessageDTO.builder()
                        .role("user")
                        .content(request.getUserMessage())
                        .build();
                conversation.add(userMsg);
                memoryService.addMessage(sessionId, userMsg);
            }
        }

        // Call Provider
        AiChatResponseDTO response = aiProviderService.generateResponse(conversation, systemPrompt);
        response.setSessionId(sessionId);

        // Save assistant response to memory if we are tracking it locally
        if (request.getUserMessage() != null) {
            memoryService.addMessage(sessionId, AiMessageDTO.builder()
                    .role("assistant")
                    .content(response.getContent())
                    .build());
        }

        long executionTime = System.currentTimeMillis() - startTime;
        auditService.logResponse(sessionId, "gemini-1.5-flash", executionTime);

        return response;
    }
}
