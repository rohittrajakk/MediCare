package com.HMS.MediCare.dto.response;

import com.HMS.MediCare.enums.Gender;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {
    private Long id;
    private String name;
    private Integer age;
    private String phone;
    private String email;
    private String address;
    private Gender gender;
    private String bloodGroup;
    private String emergencyContact;
    private LocalDateTime createdAt;
}
