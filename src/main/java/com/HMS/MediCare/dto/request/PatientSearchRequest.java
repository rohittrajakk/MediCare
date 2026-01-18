package com.HMS.MediCare.dto.request;

import com.HMS.MediCare.enums.Gender;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientSearchRequest {
    
    // General search query (searches across name, email, phone)
    private String query;
    
    // Specific field filters
    private String name;
    private String email;
    private String phone;
    
    // Age range filters
    private Integer minAge;
    private Integer maxAge;
    
    // Demographic filters
    private Gender gender;
    private String bloodGroup;
    
    // Date range filters
    private LocalDate createdAfter;
    private LocalDate createdBefore;
    
    // Sorting
    private String sortBy;
    private String sortDirection;
}
