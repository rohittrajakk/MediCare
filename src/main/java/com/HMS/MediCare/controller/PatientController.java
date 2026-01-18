package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.request.AppointmentRequest;
import com.HMS.MediCare.dto.request.LoginRequest;
import com.HMS.MediCare.dto.request.PatientRegistrationRequest;
import com.HMS.MediCare.dto.response.ApiResponse;
import com.HMS.MediCare.dto.response.AppointmentResponse;
import com.HMS.MediCare.dto.response.MedicalRecordResponse;
import com.HMS.MediCare.dto.response.PatientResponse;
import com.HMS.MediCare.service.AppointmentService;
import com.HMS.MediCare.service.MedicalRecordService;
import com.HMS.MediCare.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patient", description = "Patient management APIs")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final MedicalRecordService medicalRecordService;

    @PostMapping("/register")
    @Operation(summary = "Register a new patient")
    public ResponseEntity<ApiResponse<PatientResponse>> register(
            @Valid @RequestBody PatientRegistrationRequest request) {
        PatientResponse response = patientService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Patient login")
    public ResponseEntity<ApiResponse<PatientResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        PatientResponse response = patientService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patient by ID")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatient(@PathVariable Long id) {
        PatientResponse response = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update patient")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRegistrationRequest request) {
        PatientResponse response = patientService.updatePatient(id, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete patient")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully", null));
    }

    // Appointment endpoints for patient
    @PostMapping("/{patientId}/appointments")
    @Operation(summary = "Book an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @PathVariable Long patientId,
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.bookAppointment(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", response));
    }

    @GetMapping("/{patientId}/appointments")
    @Operation(summary = "Get patient appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getPatientAppointments(
            @PathVariable Long patientId) {
        List<AppointmentResponse> response = appointmentService.getPatientAppointments(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{patientId}/appointments/paginated")
    @Operation(summary = "Get patient appointments (paginated)")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getPatientAppointmentsPaginated(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AppointmentResponse> response = appointmentService.getPatientAppointmentsPaginated(
                patientId, PageRequest.of(page, size, Sort.by("appointmentDate").descending()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Medical Records endpoints for patient
    @GetMapping("/{patientId}/records")
    @Operation(summary = "Get patient medical records")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getPatientRecords(
            @PathVariable Long patientId) {
        List<MedicalRecordResponse> response = medicalRecordService.getPatientRecords(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{patientId}/records/paginated")
    @Operation(summary = "Get patient medical records (paginated)")
    public ResponseEntity<ApiResponse<Page<MedicalRecordResponse>>> getPatientRecordsPaginated(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<MedicalRecordResponse> response = medicalRecordService.getPatientRecordsPaginated(
                patientId, PageRequest.of(page, size, Sort.by("recordDate").descending()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{patientId}/medical-history")
    @Operation(summary = "Add medical history (allergy, condition, etc.)")
    public ResponseEntity<ApiResponse<Void>> addMedicalHistory(
            @PathVariable Long patientId,
            @Valid @RequestBody com.HMS.MediCare.dto.request.PatientMedicalHistoryRequest request) {
        patientService.addMedicalHistory(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Medical history added successfully", null));
    }
}
