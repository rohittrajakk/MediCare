package com.HMS.MediCare.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long appointmentId; // Optional for external records

    private String consultantName;
    private java.time.LocalDate visitDate;

    private String diagnosis;
    private String symptoms;

    private String prescription;

    private String dosageInstructions;

    private String notes;

    private String attachmentPath;
}
