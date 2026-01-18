package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.MedicationDose;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicationDoseRepository extends JpaRepository<MedicationDose, Long> {

    List<MedicationDose> findByMedicationId(Long medicationId);

    Page<MedicationDose> findByMedicationIdOrderByTakenAtDesc(Long medicationId, Pageable pageable);

    // Find doses in date range for adherence calculation
    @Query("SELECT d FROM MedicationDose d WHERE d.medication.id = :medicationId " +
           "AND d.scheduledTime BETWEEN :startDate AND :endDate")
    List<MedicationDose> findDosesInRange(
            @Param("medicationId") Long medicationId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Count taken vs skipped for adherence stats
    @Query("SELECT COUNT(d) FROM MedicationDose d WHERE d.medication.id = :medicationId AND d.skipped = false")
    long countTakenDoses(@Param("medicationId") Long medicationId);

    @Query("SELECT COUNT(d) FROM MedicationDose d WHERE d.medication.id = :medicationId AND d.skipped = true")
    long countSkippedDoses(@Param("medicationId") Long medicationId);

    // Find recent doses for a patient (last 7 days)
    @Query("SELECT d FROM MedicationDose d WHERE d.medication.patient.id = :patientId " +
           "AND d.takenAt >= :since ORDER BY d.takenAt DESC")
    List<MedicationDose> findRecentDosesByPatient(
            @Param("patientId") Long patientId,
            @Param("since") LocalDateTime since);
}
