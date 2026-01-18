package com.HMS.MediCare.service;

import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.entity.VitalsAlert;
import com.HMS.MediCare.entity.VitalsThreshold;
import com.HMS.MediCare.enums.AlertSeverity;
import com.HMS.MediCare.enums.VitalType;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.PatientRepository;
import com.HMS.MediCare.repository.VitalsAlertRepository;
import com.HMS.MediCare.repository.VitalsThresholdRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Vitals Monitoring Service for remote patient monitoring
 * Provides threshold-based alerting and AI-powered health insights
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VitalsMonitoringService {

    private final VitalsThresholdRepository thresholdRepository;
    private final VitalsAlertRepository alertRepository;
    private final PatientRepository patientRepository;

    // Default normal ranges for vitals
    private static final Map<VitalType, double[]> DEFAULT_RANGES = Map.of(
            VitalType.BLOOD_PRESSURE_SYSTOLIC, new double[]{90, 120, 70, 180},
            VitalType.BLOOD_PRESSURE_DIASTOLIC, new double[]{60, 80, 40, 120},
            VitalType.HEART_RATE, new double[]{60, 100, 40, 150},
            VitalType.TEMPERATURE, new double[]{36.1, 37.2, 35.0, 39.0},
            VitalType.OXYGEN_LEVEL, new double[]{95, 100, 90, 100},
            VitalType.GLUCOSE_LEVEL, new double[]{70, 100, 50, 180},
            VitalType.WEIGHT, new double[]{0, 500, 0, 500},
            VitalType.RESPIRATORY_RATE, new double[]{12, 20, 8, 30}
    );

    /**
     * Record a vital reading and check for threshold violations
     */
    public Optional<VitalsAlert> recordVitalReading(Long patientId, VitalType vitalType, Double value) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        // Get thresholds (custom or default)
        double[] thresholds = getThresholds(patientId, vitalType);
        double minNormal = thresholds[0];
        double maxNormal = thresholds[1];
        double criticalMin = thresholds[2];
        double criticalMax = thresholds[3];

        // Check if value is outside thresholds
        if (value >= minNormal && value <= maxNormal) {
            log.debug("Vital {} for patient {} is normal: {}", vitalType, patientId, value);
            return Optional.empty();
        }

        // Determine severity
        AlertSeverity severity;
        String message;

        if (value < criticalMin || value > criticalMax) {
            severity = AlertSeverity.CRITICAL;
            message = String.format("CRITICAL: %s reading of %.1f is dangerously %s normal range",
                    formatVitalType(vitalType), value, value < criticalMin ? "below" : "above");
        } else if (value < minNormal - 10 || value > maxNormal + 10) {
            severity = AlertSeverity.HIGH;
            message = String.format("HIGH ALERT: %s reading of %.1f is significantly %s normal",
                    formatVitalType(vitalType), value, value < minNormal ? "below" : "above");
        } else if (value < minNormal - 5 || value > maxNormal + 5) {
            severity = AlertSeverity.MEDIUM;
            message = String.format("WARNING: %s reading of %.1f is moderately %s normal",
                    formatVitalType(vitalType), value, value < minNormal ? "below" : "above");
        } else {
            severity = AlertSeverity.LOW;
            message = String.format("NOTICE: %s reading of %.1f is slightly outside normal range",
                    formatVitalType(vitalType), value);
        }

        // Create alert
        VitalsAlert alert = VitalsAlert.builder()
                .patient(patient)
                .vitalType(vitalType)
                .recordedValue(value)
                .thresholdMin(minNormal)
                .thresholdMax(maxNormal)
                .severity(severity)
                .message(message)
                .aiRecommendation(generateAIRecommendation(vitalType, value, severity))
                .build();

        log.warn("Alert generated for patient {}: {} ({} - {})", patientId, message, vitalType, severity);
        return Optional.of(alertRepository.save(alert));
    }

    /**
     * Get thresholds for a vital type (custom or default)
     */
    private double[] getThresholds(Long patientId, VitalType vitalType) {
        Optional<VitalsThreshold> customThreshold = thresholdRepository.findByPatientIdAndVitalType(patientId, vitalType);

        if (customThreshold.isPresent()) {
            VitalsThreshold t = customThreshold.get();
            return new double[]{
                    t.getMinValue() != null ? t.getMinValue() : DEFAULT_RANGES.get(vitalType)[0],
                    t.getMaxValue() != null ? t.getMaxValue() : DEFAULT_RANGES.get(vitalType)[1],
                    t.getCriticalMin() != null ? t.getCriticalMin() : DEFAULT_RANGES.get(vitalType)[2],
                    t.getCriticalMax() != null ? t.getCriticalMax() : DEFAULT_RANGES.get(vitalType)[3]
            };
        }

        return DEFAULT_RANGES.getOrDefault(vitalType, new double[]{0, 100, 0, 200});
    }

    /**
     * Generate AI recommendation based on vital reading
     */
    private String generateAIRecommendation(VitalType vitalType, Double value, AlertSeverity severity) {
        return switch (vitalType) {
            case BLOOD_PRESSURE_SYSTOLIC, BLOOD_PRESSURE_DIASTOLIC ->
                    severity == AlertSeverity.CRITICAL
                            ? "Seek immediate medical attention. Rest and avoid strenuous activity."
                            : "Monitor blood pressure closely. Consider reducing salt intake and stress.";
            case HEART_RATE ->
                    value > 100
                            ? "Elevated heart rate detected. Rest, hydrate, and avoid caffeine."
                            : "Low heart rate detected. If experiencing dizziness, contact your doctor.";
            case TEMPERATURE ->
                    value > 37.5
                            ? "Fever detected. Rest, stay hydrated, and monitor symptoms. Consider acetaminophen."
                            : "Low body temperature. Warm up gradually and monitor for symptoms.";
            case OXYGEN_LEVEL ->
                    "Low oxygen level detected. Practice deep breathing. If below 90%, seek medical help immediately.";
            case GLUCOSE_LEVEL ->
                    value > 140
                            ? "High blood sugar. Consider light exercise and avoid carbohydrates."
                            : "Low blood sugar. Consume fast-acting sugar (juice, candy) immediately.";
            default -> "Consult with your healthcare provider about this reading.";
        };
    }

    /**
     * Set custom threshold for a patient
     */
    public VitalsThreshold setThreshold(Long patientId, VitalType vitalType, 
                                         Double min, Double max, Double criticalMin, Double criticalMax) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        VitalsThreshold threshold = thresholdRepository.findByPatientIdAndVitalType(patientId, vitalType)
                .orElse(VitalsThreshold.builder()
                        .patient(patient)
                        .vitalType(vitalType)
                        .build());

        threshold.setMinValue(min);
        threshold.setMaxValue(max);
        threshold.setCriticalMin(criticalMin);
        threshold.setCriticalMax(criticalMax);
        threshold.setIsActive(true);

        return thresholdRepository.save(threshold);
    }

    /**
     * Get unacknowledged alerts for a patient
     */
    @Transactional(readOnly = true)
    public List<VitalsAlert> getUnacknowledgedAlerts(Long patientId) {
        return alertRepository.findByPatientIdAndAcknowledgedFalseOrderByCreatedAtDesc(patientId);
    }

    /**
     * Get all alerts for a patient (paginated)
     */
    @Transactional(readOnly = true)
    public Page<VitalsAlert> getPatientAlerts(Long patientId, Pageable pageable) {
        return alertRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable);
    }

    /**
     * Acknowledge an alert
     */
    public VitalsAlert acknowledgeAlert(Long alertId, String acknowledgedBy) {
        VitalsAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", alertId));

        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(acknowledgedBy);

        return alertRepository.save(alert);
    }

    /**
     * Get critical alerts (for admin dashboard)
     */
    @Transactional(readOnly = true)
    public List<VitalsAlert> getCriticalAlerts() {
        return alertRepository.findBySeverityAndAcknowledgedFalse(AlertSeverity.CRITICAL);
    }

    /**
     * Count unacknowledged alerts by severity
     */
    @Transactional(readOnly = true)
    public long countUnacknowledgedBySeverity(AlertSeverity severity) {
        return alertRepository.countBySeverityAndAcknowledgedFalse(severity);
    }

    private String formatVitalType(VitalType type) {
        return type.name().replace("_", " ").toLowerCase();
    }
}
