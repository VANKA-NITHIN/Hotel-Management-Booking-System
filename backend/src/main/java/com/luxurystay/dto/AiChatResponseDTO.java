package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponseDTO {
    private String sessionId;
    private String content;
    private String role;
    private List<ToolCallDTO> toolCalls;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToolCallDTO {
        private String id;
        private String type;
        private String name;
        private Object arguments;
    }
}
