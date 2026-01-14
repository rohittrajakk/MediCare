package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.request.AppointmentRequest;
import com.HMS.MediCare.dto.response.AppointmentResponse;
import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.Doctor;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.enums.AppointmentStatus;
import com.HMS.MediCare.exception.BadRequestException;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public AppointmentResponse bookAppointment(Long patientId, AppointmentRequest request) {
        Patient patient = patientService.getPatientEntityById(patientId);
        Doctor doctor = doctorService.getDoctorEntityById(request.getDoctorId());

        // Check if appointment date is in the future
        if (request.getDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Appointment date must be in the future");
        }

        // Check if time slot is within doctor's availability
        if (request.getPreferredTime().isBefore(doctor.getAvailableFrom()) ||
                request.getPreferredTime().isAfter(doctor.getAvailableTo())) {
            throw new BadRequestException("Selected time is outside doctor's available hours");
        }

        // Check for conflicting appointments
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                request.getDoctorId(), request.getDate(), request.getPreferredTime());
        
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Time slot is already booked");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getDate())
                .timeSlot(request.getPreferredTime())
                .status(AppointmentStatus.PENDING)
                .symptoms(request.getSymptoms())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToResponse(savedAppointment);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getPatientAppointmentsPaginated(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientId(patientId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getDoctorAppointmentsPaginated(Long doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorId(doctorId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAllAppointmentsPaginated(Pageable pageable) {
        return appointmentRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    public AppointmentResponse cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }

        // Check if cancellation is within 24 hours of appointment
        LocalDateTime appointmentDateTime = LocalDateTime.of(
                appointment.getAppointmentDate(), appointment.getTimeSlot());
        if (appointmentDateTime.minusHours(24).isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot cancel appointment within 24 hours of scheduled time");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToResponse(savedAppointment);
    }

    public AppointmentResponse confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BadRequestException("Only pending appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToResponse(savedAppointment);
    }

    public AppointmentResponse completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot complete a cancelled appointment");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToResponse(savedAppointment);
    }

    public Appointment getAppointmentEntityById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
    }

    public long countAppointments() {
        return appointmentRepository.count();
    }

    public long countByStatus(AppointmentStatus status) {
        return appointmentRepository.countByStatus(status);
    }

    public long countTodayAppointments() {
        return appointmentRepository.countByAppointmentDate(LocalDate.now());
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getName())
                .doctorSpecialization(appointment.getDoctor().getSpecialization())
                .date(appointment.getAppointmentDate())
                .time(appointment.getTimeSlot())
                .status(appointment.getStatus())
                .symptoms(appointment.getSymptoms())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
