package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.AppointmentWaitlist;
import com.HMS.MediCare.enums.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WaitlistRepository extends JpaRepository<AppointmentWaitlist, Long> {

    List<AppointmentWaitlist> findByPatientIdAndStatus(Long patientId, WaitlistStatus status);

    List<AppointmentWaitlist> findByDoctorIdAndStatus(Long doctorId, WaitlistStatus status);

    // Find waitlist entries that match an available slot
    @Query("SELECT w FROM AppointmentWaitlist w WHERE w.doctor.id = :doctorId " +
           "AND w.status = 'WAITING' " +
           "AND :date BETWEEN w.preferredDateStart AND w.preferredDateEnd " +
           "ORDER BY w.createdAt ASC")
    List<AppointmentWaitlist> findMatchingWaitlistEntries(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date);

    // Count waiting entries per doctor
    long countByDoctorIdAndStatus(Long doctorId, WaitlistStatus status);
}
