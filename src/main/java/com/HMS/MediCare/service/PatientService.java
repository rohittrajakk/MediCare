package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.request.LoginRequest;
import com.HMS.MediCare.dto.request.PatientRegistrationRequest;
import com.HMS.MediCare.dto.request.PatientSearchRequest;
import com.HMS.MediCare.dto.response.PatientResponse;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.exception.BadRequestException;
import com.HMS.MediCare.exception.DuplicateResourceException;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.PatientRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public PatientResponse register(PatientRegistrationRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Patient patient = Patient.builder()
                .name(request.getName())
                .age(request.getAge())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .emergencyContact(request.getEmergencyContact())
                .build();

        Patient savedPatient = patientRepository.save(patient);
        return mapToResponse(savedPatient);
    }

    public PatientResponse login(LoginRequest request) {
        Patient patient = patientRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), patient.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return mapToResponse(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return mapToResponse(patient);
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> getAllPatientsPaginated(Pageable pageable) {
        return patientRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    // Quick search for auto-suggestions (searches across name, email, phone, ID)
    @Transactional(readOnly = true)
    public List<PatientResponse> quickSearch(String query) {
        if (query == null || query.trim().isEmpty()) {
            return patientRepository.findAll().stream()
                    .limit(10)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return patientRepository.quickSearch(query.trim()).stream()
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Advanced search with multiple filters
    @Transactional(readOnly = true)
    public Page<PatientResponse> searchPatients(PatientSearchRequest request, Pageable pageable) {
        Specification<Patient> spec = buildSearchSpecification(request);
        return patientRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    private Specification<Patient> buildSearchSpecification(PatientSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // General query search (across multiple fields)
            if (request.getQuery() != null && !request.getQuery().trim().isEmpty()) {
                String searchTerm = "%" + request.getQuery().trim().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), searchTerm);
                Predicate emailPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")), searchTerm);
                Predicate phonePredicate = criteriaBuilder.like(root.get("phone"), searchTerm);
                predicates.add(criteriaBuilder.or(namePredicate, emailPredicate, phonePredicate));
            }

            // Name filter
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + request.getName().trim().toLowerCase() + "%"));
            }

            // Email filter
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        "%" + request.getEmail().trim().toLowerCase() + "%"));
            }

            // Phone filter
            if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("phone"),
                        "%" + request.getPhone().trim() + "%"));
            }

            // Age range filter
            if (request.getMinAge() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("age"), request.getMinAge()));
            }
            if (request.getMaxAge() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("age"), request.getMaxAge()));
            }

            // Gender filter
            if (request.getGender() != null) {
                predicates.add(criteriaBuilder.equal(root.get("gender"), request.getGender()));
            }

            // Blood group filter
            if (request.getBloodGroup() != null && !request.getBloodGroup().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("bloodGroup"), request.getBloodGroup().trim()));
            }

            // Date range filters
            if (request.getCreatedAfter() != null) {
                LocalDateTime startOfDay = request.getCreatedAfter().atStartOfDay();
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startOfDay));
            }
            if (request.getCreatedBefore() != null) {
                LocalDateTime endOfDay = request.getCreatedBefore().atTime(LocalTime.MAX);
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endOfDay));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public PatientResponse updatePatient(Long id, PatientRegistrationRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        // Check if email is being changed to an existing email
        if (!patient.getEmail().equals(request.getEmail()) 
                && patientRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        patient.setName(request.getName());
        patient.setAge(request.getAge());
        patient.setPhone(request.getPhone());
        patient.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            patient.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        patient.setAddress(request.getAddress());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setEmergencyContact(request.getEmergencyContact());

        Patient updatedPatient = patientRepository.save(patient);
        return mapToResponse(updatedPatient);
    }

    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", "id", id);
        }
        patientRepository.deleteById(id);
    }

    public PatientResponse updateAcuity(Long id, com.HMS.MediCare.enums.AcuityLevel acuityLevel, String alertReason) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        patient.setAcuityLevel(acuityLevel);
        patient.setAlertReason(alertReason);
        return mapToResponse(patientRepository.save(patient));
    }

    public void addMedicalHistory(Long patientId, com.HMS.MediCare.dto.request.PatientMedicalHistoryRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        com.HMS.MediCare.entity.PatientMedicalHistory history = com.HMS.MediCare.entity.PatientMedicalHistory.builder()
                .patient(patient)
                .type(request.getType())
                .name(request.getName())
                .severity(request.getSeverity())
                .status(request.getStatus())
                .notes(request.getNotes())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(request.getCreatedBy())
                .build();
        
        patient.getMedicalHistory().add(history);
        patientRepository.save(patient);
    }

    public Patient getPatientEntityById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
    }

    private PatientResponse mapToResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .name(patient.getName())
                .age(patient.getAge())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .emergencyContact(patient.getEmergencyContact())
                .riskLevel(patient.getRiskLevel())
                .primaryPhysician(patient.getPrimaryPhysician())
                .insuranceProvider(patient.getInsuranceProvider())
                .insuranceId(patient.getInsuranceId())
                .acuityLevel(patient.getAcuityLevel())
                .alertReason(patient.getAlertReason())
                .createdAt(patient.getCreatedAt())
                .build();
    }
}

