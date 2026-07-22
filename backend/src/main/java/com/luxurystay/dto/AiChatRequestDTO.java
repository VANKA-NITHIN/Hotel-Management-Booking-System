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
public class AiChatRequestDTO {
    private String sessionId;
    private List<AiMessageDTO> messages;
    private String userMessage; // Current message if not sending history
    private String locale; // User's selected language
}
