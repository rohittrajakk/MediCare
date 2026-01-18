package com.HMS.MediCare.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_medical_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientMedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // Type: ALLERGY, CONDITION, MEDICATION, SURGERY, FAMILY_HISTORY
    @Column(nullable = false, length = 30)
    private String type;

    // Name of the allergy/condition/medication/surgery
    @Column(nullable = false, length = 200)
    private String name;

    // Severity for allergies: MILD, MODERATE, SEVERE
    @Column(length = 20)
    private String severity;

    // Status: ACTIVE, RESOLVED, CHRONIC, DISCONTINUED
    @Column(length = 20)
    private String status;

    // Additional details
    @Column(columnDefinition = "TEXT")
    private String notes;

    // For medications: dosage information
    @Column(length = 100)
    private String dosage;

    // For medications: frequency (e.g., "twice daily")
    @Column(length = 100)
    private String frequency;

    // When the condition/medication started
    @Column(name = "start_date")
    private LocalDate startDate;

    // When resolved (null if ongoing)
    @Column(name = "end_date")
    private LocalDate endDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;
}
