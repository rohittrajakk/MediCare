package com.HMS.MediCare.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * MedicationDose entity for logging when medications are taken
 * Tracks adherence and enables analytics
 */
@Entity
@Table(name = "medication_doses", indexes = {
    @Index(name = "idx_dose_medication", columnList = "medication_id"),
    @Index(name = "idx_dose_taken_at", columnList = "taken_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationDose {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;

    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    @Column(name = "skipped")
    @Builder.Default
    private Boolean skipped = false;

    @Column(name = "skip_reason", length = 200)
    private String skipReason;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
