package com.luxurystay.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class EventPublisherService {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishBookingEvent(EventType eventType, String entityId, String actorId, Object payload, String targetUserId) {
        EventEnvelope<Object> envelope = buildEnvelope(eventType, "BOOKING", entityId, actorId, payload, targetUserId);
        
        // Broadcast to general bookings topic for admins
        messagingTemplate.convertAndSend("/topic/bookings", envelope);
        
        // If there's a specific target user, send to their private queue
        if (targetUserId != null) {
            messagingTemplate.convertAndSendToUser(targetUserId, "/queue/bookings", envelope);
        }
        
        log.info("Published {} event for booking {}", eventType, entityId);
    }

    public void publishHotelEvent(EventType eventType, String entityId, String actorId, Object payload) {
        EventEnvelope<Object> envelope = buildEnvelope(eventType, "HOTEL", entityId, actorId, payload, null);
        messagingTemplate.convertAndSend("/topic/hotels", envelope);
        log.info("Published {} event for hotel {}", eventType, entityId);
    }

    public void publishRoomEvent(EventType eventType, String entityId, String actorId, Object payload) {
        EventEnvelope<Object> envelope = buildEnvelope(eventType, "ROOM", entityId, actorId, payload, null);
        messagingTemplate.convertAndSend("/topic/rooms", envelope);
        log.info("Published {} event for room {}", eventType, entityId);
    }

    public void publishHousekeepingEvent(EventType eventType, String entityId, String actorId, Object payload) {
        EventEnvelope<Object> envelope = buildEnvelope(eventType, "HOUSEKEEPING", entityId, actorId, payload, null);
        messagingTemplate.convertAndSend("/topic/housekeeping", envelope);
        log.info("Published {} event for housekeeping task {}", eventType, entityId);
    }

    public void publishWalletEvent(EventType eventType, String entityId, String actorId, Object payload, String targetUserId) {
        EventEnvelope<Object> envelope = buildEnvelope(eventType, "WALLET", entityId, actorId, payload, targetUserId);
        if (targetUserId != null) {
            messagingTemplate.convertAndSendToUser(targetUserId, "/queue/wallet", envelope);
        }
        log.info("Published {} event for wallet {}", eventType, entityId);
    }

    public void publishCorporateEvent(EventType eventType, String entityId, String actorId, Object payload, String companyId) {
        EventEnvelope<Object> envelope = buildEnvelope(eventType, "CORPORATE", entityId, actorId, payload, companyId);
        if (companyId != null) {
            messagingTemplate.convertAndSend("/topic/corporate/" + companyId, envelope);
        }
        log.info("Published {} event for company {}", eventType, companyId);
    }

    public void publishNotificationEvent(EventType eventType, String entityId, String actorId, Object payload, String targetUserId) {
        EventEnvelope<Object> envelope = buildEnvelope(eventType, "NOTIFICATION", entityId, actorId, payload, targetUserId);
        if (targetUserId != null) {
            messagingTemplate.convertAndSendToUser(targetUserId, "/queue/notifications", envelope);
        }
        log.info("Published notification event {} for user {}", eventType, targetUserId);
    }

    @SuppressWarnings("null")
    private EventEnvelope<Object> buildEnvelope(EventType eventType, String entityType, String entityId, String actorId, Object payload, String targetId) {
        EventEnvelope<Object> envelope = new EventEnvelope<>();
        envelope.setEventType(eventType);
        envelope.setEntityType(entityType);
        envelope.setEntityId(entityId);
        envelope.setActorId(actorId);
        envelope.setPayload(payload);
        envelope.setTargetId(targetId);
        envelope.setTimestamp(LocalDateTime.now());
        envelope.setVersion(1);
        envelope.setPriority("NORMAL");
        return envelope;
    }
}
