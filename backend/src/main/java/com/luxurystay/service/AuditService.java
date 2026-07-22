package com.luxurystay.service;

import com.luxurystay.entity.AuditLog;
import com.luxurystay.enums.AuditActionType;
import com.luxurystay.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(@lombok.NonNull AuditLog logEntry) {
        try {
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to write audit log entry asynchronously", e);
        }
    }

    public AuditLog.AuditLogBuilder createLogBuilder(String actorId, String actorUsername, AuditActionType actionType) {
        return AuditLog.builder()
                .actorId(actorId)
                .actorUsername(actorUsername)
                .actionType(actionType)
                .outcome("SUCCESS");
    }
}
