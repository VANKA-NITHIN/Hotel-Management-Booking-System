package com.luxurystay.controller;

import com.luxurystay.dto.AiChatRequestDTO;
import com.luxurystay.dto.AiChatResponseDTO;
import com.luxurystay.service.ai.AiOrchestratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiOrchestratorService aiOrchestratorService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponseDTO> chat(
            @RequestBody AiChatRequestDTO request,
            Authentication authentication) {
        
        AiChatResponseDTO response = aiOrchestratorService.processChat(request, authentication);
        return ResponseEntity.ok(response);
    }
}
