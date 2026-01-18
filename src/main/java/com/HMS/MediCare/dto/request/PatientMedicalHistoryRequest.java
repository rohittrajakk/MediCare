package com.HMS.MediCare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientMedicalHistoryRequest {

    @NotBlank(message = "Type is required")
    private String type;       // ALLERGY, CONDITION, MEDICATION, SURGERY

    @NotBlank(message = "Name is required")
    private String name;

    private String severity;   // MILD, MODERATE, SEVERE (for allergies)
    private String status;     // ACTIVE, RESOLVED, CHRONIC, DISCONTINUED

    private String notes;
    private String dosage;     // For medications
    private String frequency;  // For medications

    private LocalDate startDate;
    private LocalDate endDate;
    private String createdBy;
}
