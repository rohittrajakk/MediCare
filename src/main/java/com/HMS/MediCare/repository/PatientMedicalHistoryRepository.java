package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.PatientMedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientMedicalHistoryRepository extends JpaRepository<PatientMedicalHistory, Long> {

    // Find all history for a patient
    List<PatientMedicalHistory> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    // Find by patient and type
    List<PatientMedicalHistory> findByPatientIdAndTypeOrderByCreatedAtDesc(Long patientId, String type);

    // Find active items by patient and type
    @Query("SELECT h FROM PatientMedicalHistory h WHERE h.patient.id = :patientId " +
           "AND h.type = :type AND h.status = 'ACTIVE' ORDER BY h.createdAt DESC")
    List<PatientMedicalHistory> findActiveByPatientIdAndType(
            @Param("patientId") Long patientId,
            @Param("type") String type);

    // Find all allergies for a patient
    default List<PatientMedicalHistory> findAllergies(Long patientId) {
        return findByPatientIdAndTypeOrderByCreatedAtDesc(patientId, "ALLERGY");
    }

    // Find all conditions for a patient
    default List<PatientMedicalHistory> findConditions(Long patientId) {
        return findByPatientIdAndTypeOrderByCreatedAtDesc(patientId, "CONDITION");
    }

    // Find all medications for a patient
    default List<PatientMedicalHistory> findMedications(Long patientId) {
        return findByPatientIdAndTypeOrderByCreatedAtDesc(patientId, "MEDICATION");
    }

    // Find all surgeries for a patient
    default List<PatientMedicalHistory> findSurgeries(Long patientId) {
        return findByPatientIdAndTypeOrderByCreatedAtDesc(patientId, "SURGERY");
    }

    // Count by patient and type
    long countByPatientIdAndType(Long patientId, String type);

    // Check if patient has specific allergy
    boolean existsByPatientIdAndTypeAndNameIgnoreCase(Long patientId, String type, String name);
}
