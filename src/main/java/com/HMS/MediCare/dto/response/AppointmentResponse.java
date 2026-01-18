package com.HMS.MediCare.dto.response;

import com.HMS.MediCare.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDate date;
    private LocalTime time;
    private AppointmentStatus status;
    private String symptoms;
    private Boolean isTelehealth;
    private String telehealthRoomName;
    private LocalDateTime createdAt;
}
