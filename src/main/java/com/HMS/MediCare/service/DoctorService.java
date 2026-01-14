package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.request.DoctorRequest;
import com.HMS.MediCare.dto.request.LoginRequest;
import com.HMS.MediCare.dto.response.AvailableSlotsResponse;
import com.HMS.MediCare.dto.response.DoctorResponse;
import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.Doctor;
import com.HMS.MediCare.exception.BadRequestException;
import com.HMS.MediCare.exception.DuplicateResourceException;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.AppointmentRepository;
import com.HMS.MediCare.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DoctorResponse createDoctor(DoctorRequest request) {
        if (doctorRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Doctor doctor = Doctor.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .experience(request.getExperience())
                .consultationFee(request.getConsultationFee())
                .availableFrom(request.getAvailableFrom() != null ? request.getAvailableFrom() : LocalTime.of(9, 0))
                .availableTo(request.getAvailableTo() != null ? request.getAvailableTo() : LocalTime.of(17, 0))
                .active(true)
                .build();

        Doctor savedDoctor = doctorRepository.save(doctor);
        return mapToResponse(savedDoctor);
    }

    public DoctorResponse login(LoginRequest request) {
        Doctor doctor = doctorRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return mapToResponse(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        return mapToResponse(doctor);
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getActiveDoctors() {
        return doctorRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponse> getAllDoctorsPaginated(Pageable pageable) {
        return doctorRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecializationContainingIgnoreCase(specialization).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DoctorResponse updateDoctor(Long id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));

        if (!doctor.getEmail().equals(request.getEmail()) 
                && doctorRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        doctor.setName(request.getName());
        doctor.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            doctor.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        doctor.setPhone(request.getPhone());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperience(request.getExperience());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setAvailableFrom(request.getAvailableFrom());
        doctor.setAvailableTo(request.getAvailableTo());

        Doctor updatedDoctor = doctorRepository.save(doctor);
        return mapToResponse(updatedDoctor);
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor", "id", id);
        }
        doctorRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public AvailableSlotsResponse getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        // Get all booked appointments for the doctor on the given date
        List<Appointment> bookedAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDate(doctorId, date);
        
        Set<LocalTime> bookedSlots = bookedAppointments.stream()
                .map(Appointment::getTimeSlot)
                .collect(Collectors.toSet());

        // Generate available slots (30-minute intervals)
        List<LocalTime> availableSlots = new ArrayList<>();
        LocalTime current = doctor.getAvailableFrom();
        LocalTime end = doctor.getAvailableTo();

        while (current.isBefore(end)) {
            if (!bookedSlots.contains(current)) {
                availableSlots.add(current);
            }
            current = current.plusMinutes(30);
        }

        return AvailableSlotsResponse.builder()
                .doctorId(doctorId)
                .doctorName(doctor.getName())
                .availableSlots(availableSlots)
                .build();
    }

    public Doctor getDoctorEntityById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
    }

    public long countDoctors() {
        return doctorRepository.count();
    }

    private DoctorResponse mapToResponse(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .email(doctor.getEmail())
                .phone(doctor.getPhone())
                .specialization(doctor.getSpecialization())
                .qualification(doctor.getQualification())
                .experience(doctor.getExperience())
                .consultationFee(doctor.getConsultationFee())
                .availableFrom(doctor.getAvailableFrom())
                .availableTo(doctor.getAvailableTo())
                .active(doctor.getActive())
                .createdAt(doctor.getCreatedAt())
                .build();
    }
}
