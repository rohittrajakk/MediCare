package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.ApiResponse;
import com.HMS.MediCare.dto.request.MedicationRequest;
import com.HMS.MediCare.dto.response.MedicationAdherenceStats;
import com.HMS.MediCare.dto.response.MedicationResponse;
import com.HMS.MediCare.service.MedicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Medication Controller for managing patient medications
 * Supports CRUD, dose logging, and adherence tracking
 */
@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
@Tag(name = "Medications", description = "Medication tracking and adherence management")
public class MedicationController {

    private final MedicationService medicationService;

    @PostMapping("/patient/{patientId}")
    @Operation(summary = "Add medication", description = "Add a new medication for a patient")
    public ResponseEntity<ApiResponse<MedicationResponse>> createMedication(
            @PathVariable Long patientId,
            @Valid @RequestBody MedicationRequest request
    ) {
        MedicationResponse response = medicationService.createMedication(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Medication added successfully", response));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get patient medications", description = "Get all medications for a patient")
    public ResponseEntity<ApiResponse<List<MedicationResponse>>> getPatientMedications(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "true") boolean activeOnly
    ) {
        List<MedicationResponse> medications = medicationService.getPatientMedications(patientId, activeOnly);
        return ResponseEntity.ok(ApiResponse.success("Medications retrieved", medications));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get medication by ID")
    public ResponseEntity<ApiResponse<MedicationResponse>> getMedicationById(@PathVariable Long id) {
        MedicationResponse response = medicationService.getMedicationById(id);
        return ResponseEntity.ok(ApiResponse.success("Medication retrieved", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update medication")
    public ResponseEntity<ApiResponse<MedicationResponse>> updateMedication(
            @PathVariable Long id,
            @Valid @RequestBody MedicationRequest request
    ) {
        MedicationResponse response = medicationService.updateMedication(id, request);
        return ResponseEntity.ok(ApiResponse.success("Medication updated", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate medication", description = "Soft delete - marks medication as inactive")
    public ResponseEntity<ApiResponse<String>> deactivateMedication(@PathVariable Long id) {
        medicationService.deactivateMedication(id);
        return ResponseEntity.ok(ApiResponse.success("Medication deactivated", null));
    }

    @PostMapping("/{id}/log-dose")
    @Operation(summary = "Log dose", description = "Log when a medication dose is taken or skipped")
    public ResponseEntity<ApiResponse<String>> logDose(
            @PathVariable Long id,
            @RequestParam boolean taken,
            @RequestParam(required = false) String notes
    ) {
        medicationService.logDose(id, taken, notes);
        String message = taken ? "Dose logged as taken" : "Dose logged as skipped";
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    @GetMapping("/patient/{patientId}/adherence")
    @Operation(summary = "Get adherence stats", description = "Get medication adherence statistics for a patient")
    public ResponseEntity<ApiResponse<MedicationAdherenceStats>> getAdherenceStats(@PathVariable Long patientId) {
        MedicationAdherenceStats stats = medicationService.getAdherenceStats(patientId);
        return ResponseEntity.ok(ApiResponse.success("Adherence stats retrieved", stats));
    }

    @GetMapping("/patient/{patientId}/refill-needed")
    @Operation(summary = "Get medications needing refill", description = "Get medications that need refill within 7 days")
    public ResponseEntity<ApiResponse<List<MedicationResponse>>> getMedicationsNeedingRefill(
            @PathVariable Long patientId
    ) {
        List<MedicationResponse> medications = medicationService.getMedicationsNeedingRefill(patientId);
        return ResponseEntity.ok(ApiResponse.success("Medications needing refill", medications));
    }
}
