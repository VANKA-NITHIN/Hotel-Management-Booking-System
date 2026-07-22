package com.luxurystay.service.ai;

import com.luxurystay.dto.AiChatResponseDTO;
import com.luxurystay.dto.AiMessageDTO;
import java.util.List;

public interface AiProviderService {
    AiChatResponseDTO generateResponse(List<AiMessageDTO> messages, String systemContext);
}
