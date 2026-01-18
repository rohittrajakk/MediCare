package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.request.PatientVitalsRequest;
import com.HMS.MediCare.dto.response.PatientVitalsResponse;
import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.entity.PatientVitals;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.AppointmentRepository;
import com.HMS.MediCare.repository.PatientRepository;
import com.HMS.MediCare.repository.PatientVitalsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientVitalsService {

    private final PatientVitalsRepository vitalsRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final com.HMS.MediCare.repository.MedicalRecordRepository medicalRecordRepository;

    // Record new vitals
    public PatientVitalsResponse recordVitals(Long patientId, PatientVitalsRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
        }

        PatientVitals vitals = PatientVitals.builder()
                .patient(patient)
                .appointment(appointment)
                .systolicBP(request.getSystolicBP())
                .diastolicBP(request.getDiastolicBP())
                .heartRate(request.getHeartRate())
                .temperature(request.getTemperature())
                .weight(request.getWeight())
                .height(request.getHeight())
                .oxygenSaturation(request.getOxygenSaturation())
                .bloodGlucose(request.getBloodGlucose())
                .respiratoryRate(request.getRespiratoryRate())
                .hemoglobin(request.getHemoglobin())
                .dataSource(request.getDataSource())
                .notes(request.getNotes())
                .recordedBy(request.getRecordedBy())
                .build();

        PatientVitals saved = vitalsRepository.save(vitals);
        return mapToResponse(saved);
    }

    // Get all vitals for a patient
    @Transactional(readOnly = true)
    public List<PatientVitalsResponse> getPatientVitals(Long patientId) {
        return vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get paginated vitals
    @Transactional(readOnly = true)
    public Page<PatientVitalsResponse> getPatientVitalsPaginated(Long patientId, Pageable pageable) {
        return vitalsRepository.findByPatientId(patientId, pageable)
                .map(this::mapToResponse);
    }

    // Get latest vitals
    @Transactional(readOnly = true)
    public PatientVitalsResponse getLatestVitals(Long patientId) {
        return vitalsRepository.findFirstByPatientIdOrderByRecordedAtDesc(patientId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    // Get recent vitals for trend (last N readings)
    @Transactional(readOnly = true)
    public List<PatientVitalsResponse> getRecentVitals(Long patientId, int count) {
        return vitalsRepository.findRecentVitals(patientId, PageRequest.of(0, count)).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Delete vitals record
    public void deleteVitals(Long vitalsId) {
        if (!vitalsRepository.existsById(vitalsId)) {
            throw new ResourceNotFoundException("Vitals", "id", vitalsId);
        }
        vitalsRepository.deleteById(vitalsId);
    }

    // --- Dashboard Aggregation Logic ---

    public com.HMS.MediCare.dto.response.VitalsDashboardResponse getPatientHealthDashboard(Long patientId) {
        // 1. Fetch recent vitals (limit 50 to ensure we capture spread out updates)
        List<PatientVitals> recentVitals = vitalsRepository.findRecentVitals(patientId, PageRequest.of(0, 50));
        
        // 2. Fetch medical records for conditions
        List<com.HMS.MediCare.entity.MedicalRecord> records = medicalRecordRepository.findByPatientId(patientId);
        List<String> conditions = records.stream()
                .map(com.HMS.MediCare.entity.MedicalRecord::getDiagnosis)
                .filter(d -> d != null && !d.isEmpty())
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        // 3. Aggregate Metrics
        var builder = com.HMS.MediCare.dto.response.VitalsDashboardResponse.builder();
        builder.activeConditions(conditions);

        // Helper to find latest non-null
        builder.weight(findLatestMetric(recentVitals, v -> v.getWeight() != null, v -> v.getWeight().toString(), "kg"));
        builder.height(findLatestMetric(recentVitals, v -> v.getHeight() != null, v -> v.getHeight().toString(), "cm"));
        builder.temperature(findLatestMetric(recentVitals, v -> v.getTemperature() != null, v -> v.getTemperature().toString(), "°F"));
        builder.heartRate(findLatestMetric(recentVitals, v -> v.getHeartRate() != null, v -> v.getHeartRate().toString(), "bpm"));
        builder.oxygenSaturation(findLatestMetric(recentVitals, v -> v.getOxygenSaturation() != null, v -> v.getOxygenSaturation().toString(), "%"));
        builder.respiratoryRate(findLatestMetric(recentVitals, v -> v.getRespiratoryRate() != null, v -> v.getRespiratoryRate().toString(), "bpm"));
        builder.bloodGlucose(findLatestMetric(recentVitals, v -> v.getBloodGlucose() != null, v -> v.getBloodGlucose().toString(), "mg/dL"));
        builder.hemoglobin(findLatestMetric(recentVitals, v -> v.getHemoglobin() != null, v -> v.getHemoglobin().toString(), "g/dL"));

        // BP is special (two fields)
        PatientVitals latestBP = recentVitals.stream().filter(v -> v.getSystolicBP() != null && v.getDiastolicBP() != null).findFirst().orElse(null);
        if (latestBP != null) {
            String val = latestBP.getSystolicBP() + "/" + latestBP.getDiastolicBP();
            builder.bloodPressure(createMetric(val, "mmHg", checkBPStatus(latestBP.getSystolicBP(), latestBP.getDiastolicBP()), latestBP));
        }

        // BMI Calculation
        try {
             var latestWeight = recentVitals.stream().filter(v -> v.getWeight() != null).findFirst().orElse(null);
             var latestHeight = recentVitals.stream().filter(v -> v.getHeight() != null).findFirst().orElse(null);
             if (latestWeight != null && latestHeight != null) {
                 double w = latestWeight.getWeight().doubleValue();
                 double h = latestHeight.getHeight().doubleValue() / 100.0; // cm to m
                 if (h > 0) {
                     double bmi = w / (h * h);
                     String bmiStr = String.format("%.1f", bmi);
                     String status = bmi < 18.5 ? "UNDERWEIGHT" : bmi < 25 ? "NORMAL" : bmi < 30 ? "OVERWEIGHT" : "OBESE";
                     // Use date from the most recent of the two
                     PatientVitals source = latestWeight.getRecordedAt().isAfter(latestHeight.getRecordedAt()) ? latestWeight : latestHeight;
                     builder.bmi(createMetric(bmiStr, "", status, source));
                 }
             }
        } catch (Exception ignored) {}

        return builder.build();
    }

    private com.HMS.MediCare.dto.response.VitalsDashboardResponse.VitalMetric findLatestMetric(
            List<PatientVitals> vitals, 
            java.util.function.Predicate<PatientVitals> predicate, 
            java.util.function.Function<PatientVitals, String> valueExtractor, 
            String unit) {
        
        return vitals.stream().filter(predicate).findFirst()
                .map(v -> createMetric(valueExtractor.apply(v), unit, "NORMAL", v)) // Status logic can be improved
                .orElse(null);
    }

    private com.HMS.MediCare.dto.response.VitalsDashboardResponse.VitalMetric createMetric(String value, String unit, String status, PatientVitals v) {
        return com.HMS.MediCare.dto.response.VitalsDashboardResponse.VitalMetric.builder()
                .value(value)
                .unit(unit)
                .status(status)
                .source(v.getDataSource() != null ? v.getDataSource() : "MANUAL")
                .recordedAt(v.getRecordedAt().toString())
                .timeAgo(getTimeAgo(v.getRecordedAt()))
                .build();
    }

    private String getTimeAgo(java.time.LocalDateTime dateTime) {
        java.time.Duration dur = java.time.Duration.between(dateTime, java.time.LocalDateTime.now());
        long mins = dur.toMinutes();
        if (mins < 60) return mins + "m ago";
        long hours = dur.toHours();
        if (hours < 24) return hours + "h ago";
        long days = dur.toDays();
        return days + "d ago";
    }

    private String checkBPStatus(int sys, int dia) {
        if (sys > 140 || dia > 90) return "HIGH";
        if (sys < 90 || dia < 60) return "LOW";
        return "NORMAL";
    }


    private PatientVitalsResponse mapToResponse(PatientVitals vitals) {
        PatientVitalsResponse response = PatientVitalsResponse.builder()
                .id(vitals.getId())
                .patientId(vitals.getPatient().getId())
                .appointmentId(vitals.getAppointment() != null ? vitals.getAppointment().getId() : null)
                .systolicBP(vitals.getSystolicBP())
                .diastolicBP(vitals.getDiastolicBP())
                .heartRate(vitals.getHeartRate())
                .temperature(vitals.getTemperature())
                .weight(vitals.getWeight())
                .height(vitals.getHeight())
                .oxygenSaturation(vitals.getOxygenSaturation())
                .bloodGlucose(vitals.getBloodGlucose())
                .respiratoryRate(vitals.getRespiratoryRate())
                .hemoglobin(vitals.getHemoglobin())
                .dataSource(vitals.getDataSource())
                .notes(vitals.getNotes())
                .recordedAt(vitals.getRecordedAt())
                .recordedBy(vitals.getRecordedBy())
                .build();

        // Calculate display values
        if (vitals.getSystolicBP() != null && vitals.getDiastolicBP() != null) {
            response.setBloodPressureDisplay(vitals.getSystolicBP() + "/" + vitals.getDiastolicBP() + " mmHg");
            response.setBpStatus(calculateBPStatus(vitals.getSystolicBP(), vitals.getDiastolicBP()));
        }

        if (vitals.getHeartRate() != null) {
            response.setHrStatus(calculateHRStatus(vitals.getHeartRate()));
        }

        if (vitals.getTemperature() != null) {
            response.setTempStatus(calculateTempStatus(vitals.getTemperature()));
        }

        if (vitals.getOxygenSaturation() != null) {
            response.setO2Status(calculateO2Status(vitals.getOxygenSaturation()));
        }

        // Calculate BMI if height and weight available
        if (vitals.getHeight() != null && vitals.getWeight() != null 
                && vitals.getHeight().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal heightInMeters = vitals.getHeight().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            BigDecimal bmi = vitals.getWeight().divide(
                    heightInMeters.multiply(heightInMeters), 1, RoundingMode.HALF_UP);
            response.setBmi(bmi);
        }

        return response;
    }

    private String calculateBPStatus(int systolic, int diastolic) {
        if (systolic >= 180 || diastolic >= 120) return "CRITICAL";
        if (systolic >= 140 || diastolic >= 90) return "HIGH";
        if (systolic >= 130 || diastolic >= 80) return "ELEVATED";
        if (systolic < 90 || diastolic < 60) return "LOW";
        return "NORMAL";
    }

    private String calculateHRStatus(int heartRate) {
        if (heartRate > 100) return "HIGH";
        if (heartRate < 60) return "LOW";
        return "NORMAL";
    }

    private String calculateTempStatus(BigDecimal temp) {
        double t = temp.doubleValue();
        if (t >= 103) return "HIGH";
        if (t >= 100.4) return "ELEVATED";
        if (t < 95) return "LOW";
        return "NORMAL";
    }

    private String calculateO2Status(int o2) {
        if (o2 < 90) return "CRITICAL";
        if (o2 < 95) return "LOW";
        return "NORMAL";
    }
}
