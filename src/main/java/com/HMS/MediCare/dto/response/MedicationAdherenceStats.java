package com.HMS.MediCare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationAdherenceStats {
    private Long patientId;
    private Long totalActiveMedications;
    private Long medicationsNeedingRefill;
    private Double overallAdherenceRate; // Percentage 0-100
    private LocalDateTime lastUpdated;
}
