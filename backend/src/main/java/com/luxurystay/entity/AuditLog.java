package com.luxurystay.entity;

import com.luxurystay.enums.AuditActionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "actor_id")
    private String actorId;

    @Column(name = "actor_username")
    private String actorUsername;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private AuditActionType actionType;

    @Column(name = "resource_type")
    private String resourceType;

    @Column(name = "resource_id")
    private String resourceId;

    @Column(name = "request_path", length = 1024)
    private String requestPath;

    @Column(name = "http_method")
    private String httpMethod;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", length = 1024)
    private String userAgent;

    @Column(name = "session_id")
    private String sessionId;

    @Column(nullable = false)
    private String outcome; // SUCCESS or FAILURE

    @Column(name = "error_code")
    private String errorCode;
}
