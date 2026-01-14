package com.HMS.MediCare.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must be 10-15 digits")
    private String phone;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    private String qualification;

    @Min(value = 0, message = "Experience must be positive")
    private Integer experience;

    @DecimalMin(value = "0.0", message = "Consultation fee must be positive")
    private BigDecimal consultationFee;

    private LocalTime availableFrom;
    
    private LocalTime availableTo;
}
