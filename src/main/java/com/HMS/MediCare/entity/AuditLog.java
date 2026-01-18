package com.HMS.MediCare.entity;

import com.HMS.MediCare.enums.AuditAction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

/**
 * HIPAA-Compliant Audit Log Entity
 * - Immutable: Cannot be updated after creation
 * - Hash Chain: Each entry linked to previous for tamper detection
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_user", columnList = "userId"),
    @Index(name = "idx_audit_entity", columnList = "entityType, entityId"),
    @Index(name = "idx_audit_action", columnList = "action")
})
@Immutable // Hibernate will prevent any updates
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditAction action;

    @Column(nullable = false, length = 50)
    private String entityType;

    @Column(length = 50)
    private String entityId;

    @Column
    private Long userId;

    @Column(length = 100)
    private String userEmail;

    @Column(length = 20)
    private String userRole;

    @Column(length = 50)
    private String ipAddress;

    @Column(nullable = false, length = 200)
    private String method;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(length = 20)
    private String outcome; // SUCCESS, FAILURE

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    // Hash chain for tamper detection
    @Column(length = 64)
    private String previousHash;

    @Column(nullable = false, length = 64)
    private String currentHash;
}
