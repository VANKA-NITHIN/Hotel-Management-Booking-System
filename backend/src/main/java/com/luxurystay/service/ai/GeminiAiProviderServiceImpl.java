package com.luxurystay.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxurystay.config.AiConfiguration;
import com.luxurystay.dto.AiChatResponseDTO;
import com.luxurystay.dto.AiMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiAiProviderServiceImpl implements AiProviderService {

    private final AiConfiguration aiConfiguration;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    @Override
    public AiChatResponseDTO generateResponse(List<AiMessageDTO> messages, String systemContext) {
        String url = String.format(GEMINI_API_URL, aiConfiguration.getModel(), aiConfiguration.getApiKey());

        Map<String, Object> requestBody = new HashMap<>();
        
        // System instruction
        if (systemContext != null && !systemContext.isEmpty()) {
            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", List.of(Map.of("text", systemContext)));
            requestBody.put("system_instruction", systemInstruction);
        }

        // Contents
        List<Map<String, Object>> contents = new ArrayList<>();
        for (AiMessageDTO msg : messages) {
            String role = msg.getRole().equals("assistant") ? "model" : "user";
            
            // Skip system messages from the history since it's in system_instruction
            if ("system".equalsIgnoreCase(msg.getRole())) {
                continue;
            }

            Map<String, Object> part = new HashMap<>();
            part.put("text", msg.getContent());

            Map<String, Object> content = new HashMap<>();
            content.put("role", role);
            content.put("parts", List.of(part));
            
            contents.add(content);
        }
        
        requestBody.put("contents", contents);

        // Generation Config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 1024);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String jsonResponse = restTemplate.postForObject(url, entity, String.class);
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            
            String responseText = "";
            if (rootNode.has("candidates") && rootNode.get("candidates").isArray() && rootNode.get("candidates").size() > 0) {
                JsonNode firstCandidate = rootNode.get("candidates").get(0);
                if (firstCandidate.has("content") && firstCandidate.get("content").has("parts")) {
                    responseText = firstCandidate.get("content").get("parts").get(0).get("text").asText();
                }
            }
            
            return AiChatResponseDTO.builder()
                    .role("assistant")
                    .content(responseText)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error communicating with Gemini API", e);
            throw new RuntimeException("Failed to generate AI response", e);
        }
    }
}
