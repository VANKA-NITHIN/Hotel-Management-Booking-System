package com.luxurystay.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventEnvelope<T> {
    
    @Builder.Default
    private String eventId = UUID.randomUUID().toString();
    
    private EventType eventType;
    
    private String entityType;
    
    private String entityId;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Builder.Default
    private Integer version = 1;
    
    private String actorId; // ID of the user/system that triggered the event
    
    private String targetId; // ID of the target (e.g. companyId, specific userId)
    
    @Builder.Default
    private String priority = "NORMAL"; // HIGH, NORMAL, LOW
    
    private T payload;
}
