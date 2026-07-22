package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMessageDTO {
    private String id;
    private String role; // "user", "assistant", "system", "tool"
    private String content;
    private String name;
}
