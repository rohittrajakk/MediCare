package com.HMS.MediCare.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientVitalsRequest {

    private Long appointmentId;

    // Blood Pressure
    private Integer systolicBP;
    private Integer diastolicBP;

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

    private String notes;
    private String recordedBy;
}
