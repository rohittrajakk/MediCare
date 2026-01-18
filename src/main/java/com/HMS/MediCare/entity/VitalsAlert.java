package com.HMS.MediCare.entity;

import com.HMS.MediCare.enums.AlertSeverity;
import com.HMS.MediCare.enums.VitalType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Vitals Alert entity for tracking abnormal readings
 * Supports severity levels and acknowledgment workflow
 */
@Entity
@Table(name = "vitals_alerts", indexes = {
    @Index(name = "idx_alert_patient", columnList = "patient_id"),
    @Index(name = "idx_alert_severity", columnList = "severity"),
    @Index(name = "idx_alert_acknowledged", columnList = "acknowledged")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalsAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "vital_type", nullable = false, length = 30)
    private VitalType vitalType;

    @Column(name = "recorded_value", nullable = false)
    private Double recordedValue;

    @Column(name = "threshold_min")
    private Double thresholdMin;

    @Column(name = "threshold_max")
    private Double thresholdMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertSeverity severity;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "ai_recommendation", columnDefinition = "TEXT")
    private String aiRecommendation;

    @Column(name = "acknowledged")
    @Builder.Default
    private Boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "acknowledged_by")
    private String acknowledgedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
