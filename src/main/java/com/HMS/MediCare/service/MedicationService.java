package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.request.MedicationRequest;
import com.HMS.MediCare.dto.response.MedicationResponse;
import com.HMS.MediCare.dto.response.MedicationAdherenceStats;
import com.HMS.MediCare.entity.Medication;
import com.HMS.MediCare.entity.MedicationDose;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.MedicationDoseRepository;
import com.HMS.MediCare.repository.MedicationRepository;
import com.HMS.MediCare.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Medication Service for managing patient medications
 * Handles CRUD operations, adherence tracking, and refill alerts
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final MedicationDoseRepository doseRepository;
    private final PatientRepository patientRepository;

    /**
     * Create a new medication for a patient
     */
    public MedicationResponse createMedication(Long patientId, MedicationRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        Medication medication = Medication.builder()
                .patient(patient)
                .name(request.getName())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .instructions(request.getInstructions())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .refillDate(request.getRefillDate())
                .pillsRemaining(request.getPillsRemaining())
                .pillsPerRefill(request.getPillsPerRefill())
                .reminderTimes(request.getReminderTimes())
                .reminderEnabled(request.getReminderEnabled() != null ? request.getReminderEnabled() : true)
                .prescribingDoctor(request.getPrescribingDoctor())
                .notes(request.getNotes())
                .isActive(true)
                .build();

        Medication saved = medicationRepository.save(medication);
        log.info("Created medication {} for patient {}", saved.getName(), patientId);
        return mapToResponse(saved);
    }

    /**
     * Get all medications for a patient
     */
    @Transactional(readOnly = true)
    public List<MedicationResponse> getPatientMedications(Long patientId, boolean activeOnly) {
        List<Medication> medications = activeOnly 
                ? medicationRepository.findByPatientIdAndIsActiveTrue(patientId)
                : medicationRepository.findByPatientId(patientId);
        
        return medications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get single medication by ID
     */
    @Transactional(readOnly = true)
    public MedicationResponse getMedicationById(Long id) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));
        return mapToResponse(medication);
    }

    /**
     * Update a medication
     */
    public MedicationResponse updateMedication(Long id, MedicationRequest request) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));

        medication.setName(request.getName());
        medication.setDosage(request.getDosage());
        medication.setFrequency(request.getFrequency());
        medication.setInstructions(request.getInstructions());
        medication.setStartDate(request.getStartDate());
        medication.setEndDate(request.getEndDate());
        medication.setRefillDate(request.getRefillDate());
        medication.setPillsRemaining(request.getPillsRemaining());
        medication.setPillsPerRefill(request.getPillsPerRefill());
        medication.setReminderTimes(request.getReminderTimes());
        medication.setReminderEnabled(request.getReminderEnabled());
        medication.setPrescribingDoctor(request.getPrescribingDoctor());
        medication.setNotes(request.getNotes());

        Medication updated = medicationRepository.save(medication);
        return mapToResponse(updated);
    }

    /**
     * Deactivate a medication (soft delete)
     */
    public void deactivateMedication(Long id) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));
        medication.setIsActive(false);
        medicationRepository.save(medication);
    }

    /**
     * Log a dose taken or skipped
     */
    public void logDose(Long medicationId, boolean taken, String notes) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", medicationId));

        MedicationDose dose = MedicationDose.builder()
                .medication(medication)
                .scheduledTime(LocalDateTime.now())
                .takenAt(taken ? LocalDateTime.now() : null)
                .skipped(!taken)
                .skipReason(!taken ? notes : null)
                .notes(taken ? notes : null)
                .build();

        doseRepository.save(dose);

        // Update pills remaining if taken
        if (taken && medication.getPillsRemaining() != null && medication.getPillsRemaining() > 0) {
            medication.setPillsRemaining(medication.getPillsRemaining() - 1);
            medicationRepository.save(medication);
        }
    }

    /**
     * Get adherence statistics for a patient
     */
    @Transactional(readOnly = true)
    public MedicationAdherenceStats getAdherenceStats(Long patientId) {
        List<Medication> medications = medicationRepository.findByPatientIdAndIsActiveTrue(patientId);
        
        long totalMedications = medications.size();
        long medicationsNeedingRefill = medications.stream()
                .filter(m -> Boolean.TRUE.equals(m.isRefillNeeded()))
                .count();

        // Calculate overall adherence
        double totalAdherence = 0;
        int medicationsWithDoses = 0;
        
        for (Medication med : medications) {
            long taken = doseRepository.countTakenDoses(med.getId());
            long skipped = doseRepository.countSkippedDoses(med.getId());
            long total = taken + skipped;
            
            if (total > 0) {
                totalAdherence += (taken * 100.0) / total;
                medicationsWithDoses++;
            }
        }

        double overallAdherence = medicationsWithDoses > 0 
                ? totalAdherence / medicationsWithDoses 
                : 100.0;

        return MedicationAdherenceStats.builder()
                .patientId(patientId)
                .totalActiveMedications(totalMedications)
                .medicationsNeedingRefill(medicationsNeedingRefill)
                .overallAdherenceRate(Math.round(overallAdherence * 10) / 10.0)
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    /**
     * Get medications needing refill within 7 days
     */
    @Transactional(readOnly = true)
    public List<MedicationResponse> getMedicationsNeedingRefill(Long patientId) {
        LocalDate refillBy = LocalDate.now().plusDays(7);
        return medicationRepository.findMedicationsNeedingRefill(patientId, refillBy)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MedicationResponse mapToResponse(Medication medication) {
        return MedicationResponse.builder()
                .id(medication.getId())
                .patientId(medication.getPatient().getId())
                .name(medication.getName())
                .dosage(medication.getDosage())
                .frequency(medication.getFrequency())
                .instructions(medication.getInstructions())
                .startDate(medication.getStartDate())
                .endDate(medication.getEndDate())
                .refillDate(medication.getRefillDate())
                .pillsRemaining(medication.getPillsRemaining())
                .pillsPerRefill(medication.getPillsPerRefill())
                .reminderTimes(medication.getReminderTimes())
                .reminderEnabled(medication.getReminderEnabled())
                .prescribingDoctor(medication.getPrescribingDoctor())
                .notes(medication.getNotes())
                .isActive(medication.getIsActive())
                .adherenceRate(medication.getAdherenceRate())
                .refillNeeded(medication.isRefillNeeded())
                .createdAt(medication.getCreatedAt())
                .build();
    }
}
