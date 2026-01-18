package com.HMS.MediCare.entity;

import com.HMS.MediCare.enums.VitalType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Vitals Threshold for personalized alert rules
 * Each patient can have custom thresholds for different vital signs
 */
@Entity
@Table(name = "vitals_thresholds", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"patient_id", "vital_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalsThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "vital_type", nullable = false, length = 30)
    private VitalType vitalType;

    @Column(name = "min_value")
    private Double minValue;

    @Column(name = "max_value")
    private Double maxValue;

    @Column(name = "critical_min")
    private Double criticalMin;

    @Column(name = "critical_max")
    private Double criticalMax;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
