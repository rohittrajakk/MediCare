package com.HMS.MediCare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalsDashboardResponse {
    
    // Organ: Whole Body
    private VitalMetric weight;
    private VitalMetric height;
    private VitalMetric temperature;
    private VitalMetric bmi; // Calculated

    // Organ: Heart
    private VitalMetric heartRate;
    private VitalMetric bloodPressure; // Combined Sys/Dia

    // Organ: Lungs
    private VitalMetric oxygenSaturation;
    private VitalMetric respiratoryRate;

    // Organ: Liver / Blood
    private VitalMetric bloodGlucose;
    private VitalMetric hemoglobin;

    // Disorders / Conditions
    private List<String> activeConditions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VitalMetric {
        private String value; // e.g., "120/80" or "75"
        private String unit;  // e.g., "mmHg" or "kg"
        private String status; // NORMAL, ELEVATED, HIGH, CRITICAL, UNKNOWN
        private String source; // MANUAL, APPLE_HEALTH, etc.
        private String recordedAt; // ISO String
        private String timeAgo; // e.g. "2h ago"
    }
}
