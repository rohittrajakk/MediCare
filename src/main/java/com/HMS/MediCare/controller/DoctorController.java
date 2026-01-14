package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.request.DoctorRequest;
import com.HMS.MediCare.dto.request.LoginRequest;
import com.HMS.MediCare.dto.request.MedicalRecordRequest;
import com.HMS.MediCare.dto.response.*;
import com.HMS.MediCare.entity.Doctor;
import com.HMS.MediCare.service.AppointmentService;
import com.HMS.MediCare.service.DoctorService;
import com.HMS.MediCare.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctor", description = "Doctor management APIs")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final MedicalRecordService medicalRecordService;

    @PostMapping
    @Operation(summary = "Create a new doctor")
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(
            @Valid @RequestBody DoctorRequest request) {
        DoctorResponse response = doctorService.createDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor created successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Doctor login")
    public ResponseEntity<ApiResponse<DoctorResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        DoctorResponse response = doctorService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping
    @Operation(summary = "Get all doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors() {
        List<DoctorResponse> response = doctorService.getAllDoctors();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getActiveDoctors() {
        List<DoctorResponse> response = doctorService.getActiveDoctors();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get all doctors (paginated)")
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> getAllDoctorsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<DoctorResponse> response = doctorService.getAllDoctorsPaginated(
                PageRequest.of(page, size, Sort.by("name")));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctor(@PathVariable Long id) {
        DoctorResponse response = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/specialization/{specialization}")
    @Operation(summary = "Get doctors by specialization")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctorsBySpecialization(
            @PathVariable String specialization) {
        List<DoctorResponse> response = doctorService.getDoctorsBySpecialization(specialization);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update doctor")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequest request) {
        DoctorResponse response = doctorService.updateDoctor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete doctor")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully", null));
    }

    // Slot availability
    @GetMapping("/{id}/slots")
    @Operation(summary = "Get available time slots for a doctor")
    public ResponseEntity<ApiResponse<AvailableSlotsResponse>> getAvailableSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        AvailableSlotsResponse response = doctorService.getAvailableSlots(id, date);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Doctor appointments
    @GetMapping("/{doctorId}/appointments")
    @Operation(summary = "Get doctor appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorAppointments(
            @PathVariable Long doctorId) {
        List<AppointmentResponse> response = appointmentService.getDoctorAppointments(doctorId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{doctorId}/appointments/paginated")
    @Operation(summary = "Get doctor appointments (paginated)")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getDoctorAppointmentsPaginated(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AppointmentResponse> response = appointmentService.getDoctorAppointmentsPaginated(
                doctorId, PageRequest.of(page, size, Sort.by("appointmentDate").descending()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Medical Records
    @PostMapping("/{doctorId}/records")
    @Operation(summary = "Add medical record")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> addMedicalRecord(
            @PathVariable Long doctorId,
            @Valid @RequestBody MedicalRecordRequest request) {
        Doctor doctor = doctorService.getDoctorEntityById(doctorId);
        MedicalRecordResponse response = medicalRecordService.createRecord(doctorId, request, doctor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Medical record added successfully", response));
    }

    @GetMapping("/{doctorId}/records")
    @Operation(summary = "Get doctor's medical records")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getDoctorRecords(
            @PathVariable Long doctorId) {
        List<MedicalRecordResponse> response = medicalRecordService.getDoctorRecords(doctorId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
