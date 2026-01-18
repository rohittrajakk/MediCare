package com.HMS.MediCare.entity;

import com.HMS.MediCare.enums.MedicationFrequency;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Medication entity for tracking patient medications
 * Supports reminder scheduling and adherence tracking
 */
@Entity
@Table(name = "medications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient is required")
    private Patient patient;

    @NotBlank(message = "Medication name is required")
    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String dosage; // e.g., "500mg", "10ml"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private MedicationFrequency frequency = MedicationFrequency.ONCE_DAILY;

    @Column(length = 500)
    private String instructions; // e.g., "Take with food"

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "refill_date")
    private LocalDate refillDate;

    @Column(name = "pills_remaining")
    private Integer pillsRemaining;

    @Column(name = "pills_per_refill")
    private Integer pillsPerRefill;

    // Reminder times (comma-separated for multiple times per day)
    @Column(name = "reminder_times", length = 200)
    private String reminderTimes; // e.g., "08:00,14:00,20:00"

    @Column(name = "reminder_enabled")
    @Builder.Default
    private Boolean reminderEnabled = true;

    @Column(name = "prescribing_doctor", length = 100)
    private String prescribingDoctor;

    @Column(length = 500)
    private String notes;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MedicationDose> doses = new ArrayList<>();

    // Calculate adherence rate (percentage of doses taken)
    @Transient
    public Double getAdherenceRate() {
        if (doses == null || doses.isEmpty()) {
            return 100.0;
        }
        long takenCount = doses.stream().filter(d -> !Boolean.TRUE.equals(d.getSkipped())).count();
        return (takenCount * 100.0) / doses.size();
    }

    // Check if refill is needed soon (within 7 days)
    @Transient
    public Boolean isRefillNeeded() {
        if (refillDate == null) return false;
        return !LocalDate.now().plusDays(7).isBefore(refillDate);
    }
}
