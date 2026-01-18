package com.HMS.MediCare.dto.response;

import com.HMS.MediCare.enums.MedicationFrequency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationResponse {
    private Long id;
    private Long patientId;
    private String name;
    private String dosage;
    private MedicationFrequency frequency;
    private String instructions;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate refillDate;
    private Integer pillsRemaining;
    private Integer pillsPerRefill;
    private String reminderTimes;
    private Boolean reminderEnabled;
    private String prescribingDoctor;
    private String notes;
    private Boolean isActive;
    private Double adherenceRate;
    private Boolean refillNeeded;
    private LocalDateTime createdAt;
}
