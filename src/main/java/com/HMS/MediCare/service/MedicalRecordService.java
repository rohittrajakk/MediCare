package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.request.MedicalRecordRequest;
import com.HMS.MediCare.dto.response.MedicalRecordResponse;
import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.Doctor;
import com.HMS.MediCare.entity.MedicalRecord;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.enums.AppointmentStatus;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientService patientService;
    private final AppointmentService appointmentService;

    public MedicalRecordResponse createRecord(Long doctorId, MedicalRecordRequest request, Doctor doctor) {
        Patient patient = patientService.getPatientEntityById(request.getPatientId());
        
        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentService.getAppointmentEntityById(request.getAppointmentId());
        }

        // If doctor is provided (via controller), use it. Otherwise, doctor remains null (external record)
        
        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor) // Can be null
                .appointment(appointment) // Can be null
                .consultantName(request.getConsultantName())
                .visitDate(request.getVisitDate())
                .diagnosis(request.getDiagnosis())
                .symptoms(request.getSymptoms())
                .prescription(request.getPrescription())
                .dosageInstructions(request.getDosageInstructions())
                .notes(request.getNotes())
                .attachmentPath(request.getAttachmentPath())
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // Mark appointment as completed if linked
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
        }

        return mapToResponse(savedRecord);
    }
    
    // Default create method for patient-uploaded records where no internal doctor exists
    public MedicalRecordResponse createPatientRecord(MedicalRecordRequest request) {
        return createRecord(null, request, null);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getRecordById(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Record", "id", id));
        return mapToResponse(record);
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getPatientRecords(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecordResponse> getPatientRecordsPaginated(Long patientId, Pageable pageable) {
        return medicalRecordRepository.findByPatientId(patientId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getDoctorRecords(Long doctorId) {
        return medicalRecordRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecordResponse> getDoctorRecordsPaginated(Long doctorId, Pageable pageable) {
        return medicalRecordRepository.findByDoctorId(doctorId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MedicalRecord getRecordEntityById(Long id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Record", "id", id));
    }

    @Transactional(readOnly = true)
    public String getPrescriptionContent(Long recordId) {
        MedicalRecord record = getRecordEntityById(recordId);
        
        StringBuilder content = new StringBuilder();
        content.append("===========================================\n");
        content.append("           MEDICARE PRESCRIPTION           \n");
        content.append("===========================================\n\n");
        content.append("Patient: ").append(record.getPatient().getName()).append("\n");
        
        if (record.getDoctor() != null) {
            content.append("Doctor: Dr. ").append(record.getDoctor().getName()).append("\n");
            content.append("Specialization: ").append(record.getDoctor().getSpecialization()).append("\n");
        } else if (record.getConsultantName() != null) {
            content.append("Consultant:Dr. ").append(record.getConsultantName()).append("\n");
        }
        
        if (record.getVisitDate() != null) {
             content.append("Visit Date: ").append(record.getVisitDate()).append("\n");
        }
        content.append("Date Recorded: ").append(record.getRecordDate()).append("\n\n");
        content.append("-------------------------------------------\n");
        content.append("SYMPTOMS:\n").append(record.getSymptoms() != null ? record.getSymptoms() : "N/A").append("\n\n");
        content.append("DIAGNOSIS:\n").append(record.getDiagnosis()).append("\n\n");
        content.append("PRESCRIPTION:\n").append(record.getPrescription()).append("\n\n");
        content.append("DOSAGE INSTRUCTIONS:\n").append(record.getDosageInstructions()).append("\n\n");
        if (record.getNotes() != null && !record.getNotes().isEmpty()) {
            content.append("NOTES:\n").append(record.getNotes()).append("\n\n");
        }
        content.append("-------------------------------------------\n");
        content.append("         This is a digital prescription     \n");
        content.append("===========================================\n");
        
        return content.toString();
    }

    private MedicalRecordResponse mapToResponse(MedicalRecord record) {
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .patientId(record.getPatient().getId())
                .patientName(record.getPatient().getName())
                .doctorId(record.getDoctor() != null ? record.getDoctor().getId() : null)
                .doctorName(record.getDoctor() != null ? record.getDoctor().getName() : null)
                .consultantName(record.getConsultantName())
                .visitDate(record.getVisitDate())
                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                .diagnosis(record.getDiagnosis())
                .symptoms(record.getSymptoms())
                .prescription(record.getPrescription())
                .dosageInstructions(record.getDosageInstructions())
                .notes(record.getNotes())
                .recordDate(record.getRecordDate())
                .attachmentPath(record.getAttachmentPath())
                .build();
    }


}
