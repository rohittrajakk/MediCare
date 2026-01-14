package com.HMS.MediCare.dto.request;

import com.HMS.MediCare.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientRegistrationRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Min(value = 0, message = "Age must be positive")
    @Max(value = 150, message = "Age must be realistic")
    private Integer age;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must be 10-15 digits")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String address;

    private Gender gender;

    @Size(max = 5, message = "Blood group must not exceed 5 characters")
    private String bloodGroup;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Emergency contact must be 10-15 digits")
    private String emergencyContact;
}
