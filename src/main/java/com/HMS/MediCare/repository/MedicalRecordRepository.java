package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<MedicalRecord> findByPatientId(Long patientId);

    @EntityGraph(attributePaths = {"patient", "doctor"})
    Page<MedicalRecord> findByPatientId(Long patientId, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<MedicalRecord> findByDoctorId(Long doctorId);

    @EntityGraph(attributePaths = {"patient", "doctor"})
    Page<MedicalRecord> findByDoctorId(Long doctorId, Pageable pageable);
    
    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);
}
