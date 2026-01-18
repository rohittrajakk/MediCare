package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {

    List<Medication> findByPatientIdAndIsActiveTrue(Long patientId);

    List<Medication> findByPatientId(Long patientId);

    // Find medications needing refill within days
    @Query("SELECT m FROM Medication m WHERE m.patient.id = :patientId " +
           "AND m.isActive = true AND m.refillDate <= :refillBy")
    List<Medication> findMedicationsNeedingRefill(
            @Param("patientId") Long patientId,
            @Param("refillBy") LocalDate refillBy);

    // Find medications with reminders enabled
    List<Medication> findByPatientIdAndReminderEnabledTrueAndIsActiveTrue(Long patientId);

    // Count active medications for a patient
    long countByPatientIdAndIsActiveTrue(Long patientId);
}
