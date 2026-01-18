package com.HMS.MediCare.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfileResponse {

    // Basic Information
    private Long id;
    private String name;
    private Integer age;
    private String phone;
    private String email;
    private String address;
    private String gender;
    private String bloodGroup;
    private String emergencyContact;
    private LocalDateTime createdAt;

    // Enhanced fields
    private String riskLevel;
    private String primaryPhysician;
    private String insuranceProvider;
    private String insuranceId;

    // Statistics
    private Integer totalAppointments;
    private Integer totalRecords;
    private Integer completedVisits;
    private Integer upcomingVisits;

    // Related data
    private PatientVitalsResponse latestVitals;
    private List<PatientVitalsResponse> recentVitals;
    private List<PatientMedicalHistoryResponse> allergies;
    private List<PatientMedicalHistoryResponse> conditions;
    private List<PatientMedicalHistoryResponse> medications;
    private List<PatientMedicalHistoryResponse> surgeries;
    private List<AppointmentResponse> recentAppointments;
}
