package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.PatientVitals;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientVitalsRepository extends JpaRepository<PatientVitals, Long> {

    // Find all vitals for a patient
    List<PatientVitals> findByPatientIdOrderByRecordedAtDesc(Long patientId);

    // Find vitals with pagination
    Page<PatientVitals> findByPatientId(Long patientId, Pageable pageable);

    // Get latest vitals for a patient
    Optional<PatientVitals> findFirstByPatientIdOrderByRecordedAtDesc(Long patientId);

    // Get vitals for a specific appointment
    Optional<PatientVitals> findByAppointmentId(Long appointmentId);

    // Get vitals within a date range
    @Query("SELECT v FROM PatientVitals v WHERE v.patient.id = :patientId " +
           "AND v.recordedAt BETWEEN :startDate AND :endDate ORDER BY v.recordedAt DESC")
    List<PatientVitals> findByPatientIdAndDateRange(
            @Param("patientId") Long patientId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Get last N vitals readings for trend display
    @Query("SELECT v FROM PatientVitals v WHERE v.patient.id = :patientId ORDER BY v.recordedAt DESC")
    List<PatientVitals> findRecentVitals(@Param("patientId") Long patientId, Pageable pageable);

    // Count vitals for a patient
    long countByPatientId(Long patientId);
}
