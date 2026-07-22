package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    
    private boolean success;
    private String message;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private T data;
    
    // Optional pagination info if applicable
    private Object pagination;
    
    // Optional metadata
    private Map<String, Object> metadata;

    // 3-arg constructor for backward compatibility
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
}
