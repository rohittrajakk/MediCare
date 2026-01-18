package com.HMS.MediCare.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponse {
    private Long id;
    private String name;
    private String doctorUniqueId;
    private String email;
    private String phone;
    private String specialization;
    private String qualification;
    private Integer experience;
    private BigDecimal consultationFee;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private Boolean active;
    private LocalDateTime createdAt;
}
