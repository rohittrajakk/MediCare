package com.HMS.MediCare.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_vitals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientVitals {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    // Blood Pressure
    @Column(name = "systolic_bp")
    private Integer systolicBP;

    @Column(name = "diastolic_bp")
    private Integer diastolicBP;

    // Heart Rate (beats per minute)
    @Column(name = "heart_rate")
    private Integer heartRate;

    // Temperature in Fahrenheit
    @Column(precision = 4, scale = 1)
    private BigDecimal temperature;

    // Weight in kg
    @Column(precision = 5, scale = 1)
    private BigDecimal weight;

    // Height in cm
    @Column(precision = 5, scale = 1)
    private BigDecimal height;

    // Oxygen Saturation percentage
    @Column(name = "oxygen_saturation")
    private Integer oxygenSaturation;

    // Blood Glucose in mg/dL
    @Column(name = "blood_glucose", precision = 5, scale = 1)
    private BigDecimal bloodGlucose;

    // Respiratory Rate (breaths per minute)
    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    // Hemoglobin in g/dL
    @Column(precision = 4, scale = 1)
    private BigDecimal hemoglobin;

    // Data Source (MANUAL, APPLE_HEALTH, etc.)
    @Column(name = "data_source")
    private String dataSource; // e.g., "MANUAL", "APPLE_HEALTH", "GOOGLE_FIT"

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "recorded_at", updatable = false)
    private LocalDateTime recordedAt;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;
}
