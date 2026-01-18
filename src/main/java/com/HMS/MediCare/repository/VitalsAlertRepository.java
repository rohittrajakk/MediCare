package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.VitalsAlert;
import com.HMS.MediCare.enums.AlertSeverity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VitalsAlertRepository extends JpaRepository<VitalsAlert, Long> {

    List<VitalsAlert> findByPatientIdAndAcknowledgedFalseOrderByCreatedAtDesc(Long patientId);

    Page<VitalsAlert> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);

    List<VitalsAlert> findBySeverityAndAcknowledgedFalse(AlertSeverity severity);

    long countByPatientIdAndAcknowledgedFalse(Long patientId);

    long countBySeverityAndAcknowledgedFalse(AlertSeverity severity);
}
