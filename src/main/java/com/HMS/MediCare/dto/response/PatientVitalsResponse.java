package com.HMS.MediCare.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientVitalsResponse {

    private Long id;
    private Long patientId;
    private Long appointmentId;

    // Blood Pressure
    private Integer systolicBP;
    private Integer diastolicBP;
    private String bloodPressureDisplay; // e.g., "120/80 mmHg"

    // Other vitals
    private Integer heartRate;
    private BigDecimal temperature;
    private BigDecimal weight;
    private BigDecimal height;
    private Integer oxygenSaturation;
    private BigDecimal bloodGlucose;
    private Integer respiratoryRate;
    private BigDecimal hemoglobin;
    private String dataSource;

    // BMI calculated from height/weight
    private BigDecimal bmi;

    private String notes;
    private LocalDateTime recordedAt;
    private String recordedBy;

    // Status indicators for abnormal values
    private String bpStatus;      // NORMAL, ELEVATED, HIGH, CRITICAL
    private String hrStatus;      // NORMAL, LOW, HIGH
    private String tempStatus;    // NORMAL, LOW, HIGH
    private String o2Status;      // NORMAL, LOW, CRITICAL
}
