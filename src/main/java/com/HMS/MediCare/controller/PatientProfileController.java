package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.request.PatientMedicalHistoryRequest;
import com.HMS.MediCare.dto.request.PatientVitalsRequest;
import com.HMS.MediCare.dto.response.*;
import com.HMS.MediCare.service.AppointmentService;
import com.HMS.MediCare.service.PatientMedicalHistoryService;
import com.HMS.MediCare.service.PatientService;
import com.HMS.MediCare.service.PatientVitalsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}")
@RequiredArgsConstructor
@Tag(name = "Patient Profile", description = "Patient profile, vitals, and medical history APIs")
@CrossOrigin(origins = "*")
public class PatientProfileController {

    private final PatientService patientService;
    private final PatientVitalsService vitalsService;
    private final PatientMedicalHistoryService historyService;
    private final AppointmentService appointmentService;

    // ==================== PATIENT PROFILE ====================

    @GetMapping("/profile")
    @Operation(summary = "Get complete patient profile with vitals, history, and appointments")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> getPatientProfile(
            @PathVariable Long patientId) {
        
        PatientResponse patient = patientService.getPatientById(patientId);
        PatientVitalsResponse latestVitals = vitalsService.getLatestVitals(patientId);
        List<PatientVitalsResponse> recentVitals = vitalsService.getRecentVitals(patientId, 5);
        List<PatientMedicalHistoryResponse> allergies = historyService.getAllergies(patientId);
        List<PatientMedicalHistoryResponse> conditions = historyService.getConditions(patientId);
        List<PatientMedicalHistoryResponse> medications = historyService.getMedications(patientId);
        List<PatientMedicalHistoryResponse> surgeries = historyService.getSurgeries(patientId);
        List<AppointmentResponse> recentAppointments = appointmentService.getPatientAppointments(patientId);

        // Build profile response
        PatientProfileResponse profile = PatientProfileResponse.builder()
                .id(patient.getId())
                .name(patient.getName())
                .age(patient.getAge())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .gender(patient.getGender() != null ? patient.getGender().name() : null)
                .bloodGroup(patient.getBloodGroup())
                .emergencyContact(patient.getEmergencyContact())
                .riskLevel(patient.getRiskLevel())
                .primaryPhysician(patient.getPrimaryPhysician())
                .insuranceProvider(patient.getInsuranceProvider())
                .insuranceId(patient.getInsuranceId())
                .createdAt(patient.getCreatedAt())
                .latestVitals(latestVitals)
                .recentVitals(recentVitals)
                .allergies(allergies)
                .conditions(conditions)
                .medications(medications)
                .surgeries(surgeries)
                .recentAppointments(recentAppointments.stream().limit(10).toList())
                .totalAppointments(recentAppointments.size())
                .build();

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    // ==================== VITALS ====================

    @GetMapping("/vitals")
    @Operation(summary = "Get all vitals for a patient")
    public ResponseEntity<ApiResponse<List<PatientVitalsResponse>>> getVitals(
            @PathVariable Long patientId) {
        List<PatientVitalsResponse> vitals = vitalsService.getPatientVitals(patientId);
        return ResponseEntity.ok(ApiResponse.success(vitals));
    }

    @GetMapping("/vitals/latest")
    @Operation(summary = "Get latest vitals for a patient")
    public ResponseEntity<ApiResponse<PatientVitalsResponse>> getLatestVitals(
            @PathVariable Long patientId) {
        PatientVitalsResponse vitals = vitalsService.getLatestVitals(patientId);
        return ResponseEntity.ok(ApiResponse.success(vitals));
    }

    @GetMapping("/vitals/recent")
    @Operation(summary = "Get recent vitals for trend display")
    public ResponseEntity<ApiResponse<List<PatientVitalsResponse>>> getRecentVitals(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "5") int count) {
        List<PatientVitalsResponse> vitals = vitalsService.getRecentVitals(patientId, count);
        return ResponseEntity.ok(ApiResponse.success(vitals));
    }

    @PostMapping("/vitals")
    @Operation(summary = "Record new vitals")
    public ResponseEntity<ApiResponse<PatientVitalsResponse>> recordVitals(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientVitalsRequest request) {
        PatientVitalsResponse vitals = vitalsService.recordVitals(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vitals recorded successfully", vitals));
    }

    @DeleteMapping("/vitals/{vitalsId}")
    @Operation(summary = "Delete vitals record")
    public ResponseEntity<ApiResponse<Void>> deleteVitals(
            @PathVariable Long patientId,
            @PathVariable Long vitalsId) {
        vitalsService.deleteVitals(vitalsId);
        return ResponseEntity.ok(ApiResponse.success("Vitals deleted successfully", null));
    }

    // ==================== MEDICAL HISTORY ====================

    @GetMapping("/medical-history")
    @Operation(summary = "Get all medical history for a patient")
    public ResponseEntity<ApiResponse<List<PatientMedicalHistoryResponse>>> getMedicalHistory(
            @PathVariable Long patientId,
            @RequestParam(required = false) String type) {
        List<PatientMedicalHistoryResponse> history;
        if (type != null && !type.isEmpty()) {
            history = historyService.getPatientHistoryByType(patientId, type);
        } else {
            history = historyService.getPatientHistory(patientId);
        }
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/allergies")
    @Operation(summary = "Get patient allergies")
    public ResponseEntity<ApiResponse<List<PatientMedicalHistoryResponse>>> getAllergies(
            @PathVariable Long patientId) {
        List<PatientMedicalHistoryResponse> allergies = historyService.getAllergies(patientId);
        return ResponseEntity.ok(ApiResponse.success(allergies));
    }

    @GetMapping("/conditions")
    @Operation(summary = "Get patient conditions")
    public ResponseEntity<ApiResponse<List<PatientMedicalHistoryResponse>>> getConditions(
            @PathVariable Long patientId) {
        List<PatientMedicalHistoryResponse> conditions = historyService.getConditions(patientId);
        return ResponseEntity.ok(ApiResponse.success(conditions));
    }

    @GetMapping("/medications")
    @Operation(summary = "Get patient medications")
    public ResponseEntity<ApiResponse<List<PatientMedicalHistoryResponse>>> getMedications(
            @PathVariable Long patientId) {
        List<PatientMedicalHistoryResponse> medications = historyService.getMedications(patientId);
        return ResponseEntity.ok(ApiResponse.success(medications));
    }

    @GetMapping("/surgeries")
    @Operation(summary = "Get patient surgeries")
    public ResponseEntity<ApiResponse<List<PatientMedicalHistoryResponse>>> getSurgeries(
            @PathVariable Long patientId) {
        List<PatientMedicalHistoryResponse> surgeries = historyService.getSurgeries(patientId);
        return ResponseEntity.ok(ApiResponse.success(surgeries));
    }



    @PutMapping("/medical-history/{historyId}")
    @Operation(summary = "Update medical history entry")
    public ResponseEntity<ApiResponse<PatientMedicalHistoryResponse>> updateMedicalHistory(
            @PathVariable Long patientId,
            @PathVariable Long historyId,
            @Valid @RequestBody PatientMedicalHistoryRequest request) {
        PatientMedicalHistoryResponse history = historyService.updateHistory(historyId, request);
        return ResponseEntity.ok(ApiResponse.success("Medical history updated successfully", history));
    }

    @DeleteMapping("/medical-history/{historyId}")
    @Operation(summary = "Delete medical history entry")
    public ResponseEntity<ApiResponse<Void>> deleteMedicalHistory(
            @PathVariable Long patientId,
            @PathVariable Long historyId) {
        historyService.deleteHistory(historyId);
        return ResponseEntity.ok(ApiResponse.success("Medical history deleted successfully", null));
    }
}
