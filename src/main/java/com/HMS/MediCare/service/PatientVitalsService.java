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
