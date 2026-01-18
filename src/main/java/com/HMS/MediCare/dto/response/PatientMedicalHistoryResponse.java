package com.HMS.MediCare.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientMedicalHistoryResponse {

    private Long id;
    private Long patientId;

    private String type;       // ALLERGY, CONDITION, MEDICATION, SURGERY
    private String name;
    private String severity;   // MILD, MODERATE, SEVERE (for allergies)
    private String status;     // ACTIVE, RESOLVED, CHRONIC, DISCONTINUED

    private String notes;
    private String dosage;     // For medications
    private String frequency;  // For medications

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private String createdBy;

    // Display helpers
    private String displayLabel;     // e.g., "Penicillin (Severe)"
    private String statusBadgeColor; // For UI styling
}
