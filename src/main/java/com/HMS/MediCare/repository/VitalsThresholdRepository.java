package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.VitalsThreshold;
import com.HMS.MediCare.enums.VitalType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VitalsThresholdRepository extends JpaRepository<VitalsThreshold, Long> {

    List<VitalsThreshold> findByPatientIdAndIsActiveTrue(Long patientId);

    Optional<VitalsThreshold> findByPatientIdAndVitalType(Long patientId, VitalType vitalType);
}
