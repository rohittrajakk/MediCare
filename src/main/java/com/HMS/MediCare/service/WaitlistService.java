package com.HMS.MediCare.service;

import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.AppointmentWaitlist;
import com.HMS.MediCare.entity.Doctor;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.enums.WaitlistStatus;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.DoctorRepository;
import com.HMS.MediCare.repository.PatientRepository;
import com.HMS.MediCare.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Waitlist Service for managing appointment waitlist
 * Automatically fills cancelled slots with waiting patients
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    /**
     * Add patient to waitlist for a doctor
     */
    public AppointmentWaitlist addToWaitlist(
            Long patientId,
            Long doctorId,
            LocalDate preferredStart,
            LocalDate preferredEnd,
            LocalTime timeStart,
            LocalTime timeEnd,
            String symptoms
    ) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        AppointmentWaitlist entry = AppointmentWaitlist.builder()
                .patient(patient)
                .doctor(doctor)
                .preferredDateStart(preferredStart != null ? preferredStart : LocalDate.now())
                .preferredDateEnd(preferredEnd != null ? preferredEnd : LocalDate.now().plusDays(30))
                .preferredTimeStart(timeStart)
                .preferredTimeEnd(timeEnd)
                .symptoms(symptoms)
                .status(WaitlistStatus.WAITING)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();

        log.info("Patient {} added to waitlist for doctor {}", patientId, doctorId);
        return waitlistRepository.save(entry);
    }

    /**
     * Find patients waiting for a slot that matches the cancelled appointment
     */
    public List<AppointmentWaitlist> findMatchingWaitlistEntries(Appointment cancelledAppointment) {
        return waitlistRepository.findMatchingWaitlistEntries(
                cancelledAppointment.getDoctor().getId(),
                cancelledAppointment.getAppointmentDate()
        );
    }

    /**
     * Notify first patient in waitlist about available slot
     */
    public AppointmentWaitlist notifyNextInWaitlist(Appointment cancelledAppointment) {
        List<AppointmentWaitlist> waitingPatients = findMatchingWaitlistEntries(cancelledAppointment);
        
        if (waitingPatients.isEmpty()) {
            log.info("No patients on waitlist for cancelled appointment {}", cancelledAppointment.getId());
            return null;
        }

        AppointmentWaitlist firstInQueue = waitingPatients.get(0);
        firstInQueue.setStatus(WaitlistStatus.NOTIFIED);
        firstInQueue.setNotifiedAt(LocalDateTime.now());
        
        // In a real system, this would send SMS/email notification
        log.info("Notified patient {} about available slot on {} at {}",
                firstInQueue.getPatient().getId(),
                cancelledAppointment.getAppointmentDate(),
                cancelledAppointment.getTimeSlot());

        return waitlistRepository.save(firstInQueue);
    }

    /**
     * Patient accepts the offered slot
     */
    public void acceptSlot(Long waitlistId) {
        AppointmentWaitlist entry = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry", "id", waitlistId));
        
        entry.setStatus(WaitlistStatus.ACCEPTED);
        waitlistRepository.save(entry);
        log.info("Patient {} accepted waitlist slot", entry.getPatient().getId());
    }

    /**
     * Patient declines the offered slot
     */
    public void declineSlot(Long waitlistId) {
        AppointmentWaitlist entry = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry", "id", waitlistId));
        
        entry.setStatus(WaitlistStatus.DECLINED);
        waitlistRepository.save(entry);
        log.info("Patient {} declined waitlist slot", entry.getPatient().getId());
    }

    /**
     * Cancel waitlist entry
     */
    public void cancelWaitlistEntry(Long waitlistId) {
        AppointmentWaitlist entry = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry", "id", waitlistId));
        
        entry.setStatus(WaitlistStatus.CANCELLED);
        waitlistRepository.save(entry);
    }

    /**
     * Get patient's active waitlist entries
     */
    @Transactional(readOnly = true)
    public List<AppointmentWaitlist> getPatientWaitlist(Long patientId) {
        return waitlistRepository.findByPatientIdAndStatus(patientId, WaitlistStatus.WAITING);
    }

    /**
     * Get count of patients waiting for a doctor
     */
    @Transactional(readOnly = true)
    public long getWaitlistCount(Long doctorId) {
        return waitlistRepository.countByDoctorIdAndStatus(doctorId, WaitlistStatus.WAITING);
    }
}
