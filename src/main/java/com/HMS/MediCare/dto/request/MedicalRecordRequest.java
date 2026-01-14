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

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    private String diagnosis;

    private String prescription;

    private String dosageInstructions;

    private String notes;

    private String attachmentPath;
}
