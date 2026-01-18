package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.request.PatientMedicalHistoryRequest;
import com.HMS.MediCare.dto.response.PatientMedicalHistoryResponse;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.entity.PatientMedicalHistory;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.PatientMedicalHistoryRepository;
import com.HMS.MediCare.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientMedicalHistoryService {

    private final PatientMedicalHistoryRepository historyRepository;
    private final PatientRepository patientRepository;

    // Add new medical history entry
    public PatientMedicalHistoryResponse addHistory(Long patientId, PatientMedicalHistoryRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        PatientMedicalHistory history = PatientMedicalHistory.builder()
                .patient(patient)
                .type(request.getType().toUpperCase())
                .name(request.getName())
                .severity(request.getSeverity())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .notes(request.getNotes())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(request.getCreatedBy())
                .build();

        PatientMedicalHistory saved = historyRepository.save(history);
        return mapToResponse(saved);
    }

    // Get all history for a patient
    @Transactional(readOnly = true)
    public List<PatientMedicalHistoryResponse> getPatientHistory(Long patientId) {
        return historyRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get history by type
    @Transactional(readOnly = true)
    public List<PatientMedicalHistoryResponse> getPatientHistoryByType(Long patientId, String type) {
        return historyRepository.findByPatientIdAndTypeOrderByCreatedAtDesc(patientId, type.toUpperCase()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get allergies
    @Transactional(readOnly = true)
    public List<PatientMedicalHistoryResponse> getAllergies(Long patientId) {
        return getPatientHistoryByType(patientId, "ALLERGY");
    }

    // Get conditions
    @Transactional(readOnly = true)
    public List<PatientMedicalHistoryResponse> getConditions(Long patientId) {
        return getPatientHistoryByType(patientId, "CONDITION");
    }

    // Get medications
    @Transactional(readOnly = true)
    public List<PatientMedicalHistoryResponse> getMedications(Long patientId) {
        return getPatientHistoryByType(patientId, "MEDICATION");
    }

    // Get surgeries
    @Transactional(readOnly = true)
    public List<PatientMedicalHistoryResponse> getSurgeries(Long patientId) {
        return getPatientHistoryByType(patientId, "SURGERY");
    }

    // Update history entry
    public PatientMedicalHistoryResponse updateHistory(Long historyId, PatientMedicalHistoryRequest request) {
        PatientMedicalHistory history = historyRepository.findById(historyId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical History", "id", historyId));

        history.setType(request.getType().toUpperCase());
        history.setName(request.getName());
        history.setSeverity(request.getSeverity());
        history.setStatus(request.getStatus());
        history.setNotes(request.getNotes());
        history.setDosage(request.getDosage());
        history.setFrequency(request.getFrequency());
        history.setStartDate(request.getStartDate());
        history.setEndDate(request.getEndDate());

        PatientMedicalHistory updated = historyRepository.save(history);
        return mapToResponse(updated);
    }

    // Delete history entry
    public void deleteHistory(Long historyId) {
        if (!historyRepository.existsById(historyId)) {
            throw new ResourceNotFoundException("Medical History", "id", historyId);
        }
        historyRepository.deleteById(historyId);
    }

    // Check if patient has allergy
    @Transactional(readOnly = true)
    public boolean hasAllergy(Long patientId, String allergyName) {
        return historyRepository.existsByPatientIdAndTypeAndNameIgnoreCase(patientId, "ALLERGY", allergyName);
    }

    private PatientMedicalHistoryResponse mapToResponse(PatientMedicalHistory history) {
        PatientMedicalHistoryResponse response = PatientMedicalHistoryResponse.builder()
                .id(history.getId())
                .patientId(history.getPatient().getId())
                .type(history.getType())
                .name(history.getName())
                .severity(history.getSeverity())
                .status(history.getStatus())
                .notes(history.getNotes())
                .dosage(history.getDosage())
                .frequency(history.getFrequency())
                .startDate(history.getStartDate())
                .endDate(history.getEndDate())
                .createdAt(history.getCreatedAt())
                .createdBy(history.getCreatedBy())
                .build();

        // Set display label
        if ("ALLERGY".equals(history.getType()) && history.getSeverity() != null) {
            response.setDisplayLabel(history.getName() + " (" + history.getSeverity() + ")");
        } else if ("MEDICATION".equals(history.getType()) && history.getDosage() != null) {
            response.setDisplayLabel(history.getName() + " " + history.getDosage());
        } else {
            response.setDisplayLabel(history.getName());
        }

        // Set status badge color
        response.setStatusBadgeColor(getStatusBadgeColor(history.getStatus(), history.getSeverity()));

        return response;
    }

    private String getStatusBadgeColor(String status, String severity) {
        if (severity != null) {
            return switch (severity.toUpperCase()) {
                case "SEVERE" -> "red";
                case "MODERATE" -> "orange";
                case "MILD" -> "yellow";
                default -> "gray";
            };
        }
        if (status != null) {
            return switch (status.toUpperCase()) {
                case "ACTIVE", "CHRONIC" -> "blue";
                case "RESOLVED", "DISCONTINUED" -> "green";
                default -> "gray";
            };
        }
        return "gray";
    }
}
