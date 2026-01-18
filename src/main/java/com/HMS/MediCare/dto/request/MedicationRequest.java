package com.HMS.MediCare.dto.request;

import com.HMS.MediCare.enums.MedicationFrequency;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicationRequest {

    @NotBlank(message = "Medication name is required")
    private String name;

    private String dosage;

    private MedicationFrequency frequency;

    private String instructions;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate refillDate;

    private Integer pillsRemaining;

    private Integer pillsPerRefill;

    private String reminderTimes; // e.g., "08:00,14:00,20:00"

    private Boolean reminderEnabled;

    private String prescribingDoctor;

    private String notes;
}
