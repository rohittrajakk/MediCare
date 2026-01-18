package com.HMS.MediCare.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String consultantName;
    private java.time.LocalDate visitDate;
    private Long appointmentId;
    private String diagnosis;
    private String symptoms;
    private String prescription;
    private String dosageInstructions;
    private String notes;
    private LocalDateTime recordDate;
    private String attachmentPath;
}
