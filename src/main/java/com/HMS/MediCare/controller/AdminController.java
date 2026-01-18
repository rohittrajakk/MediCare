package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.request.LoginRequest;
import com.HMS.MediCare.dto.response.*;
import com.HMS.MediCare.service.AppointmentService;
import com.HMS.MediCare.service.DashboardService;
import com.HMS.MediCare.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard APIs")
@CrossOrigin(origins = "*")
public class AdminController {

    private final DashboardService dashboardService;
    private final PatientService patientService;
    private final AppointmentService appointmentService;

    @Value("${ADMIN_EMAIL:admin@medicare.com}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;
    
    // Fallback admin credentials for testing
    private static final String FALLBACK_ADMIN_EMAIL = "rohitrajak54426@gmail.com";
    private static final String FALLBACK_ADMIN_PASSWORD = "Rohit@123";

    @PostMapping("/login")
    @Operation(summary = "Admin login")
    public ResponseEntity<ApiResponse<AdminResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        
        // Check environment variable credentials first
        boolean envCredentialsValid = adminEmail.equals(request.getEmail()) && 
            adminPassword != null && 
            !adminPassword.isEmpty() && 
            adminPassword.equals(request.getPassword());
        
        // Check fallback credentials
        boolean fallbackCredentialsValid = FALLBACK_ADMIN_EMAIL.equals(request.getEmail()) && 
            FALLBACK_ADMIN_PASSWORD.equals(request.getPassword());
        
        if (envCredentialsValid || fallbackCredentialsValid) {
            AdminResponse response = AdminResponse.builder()
                    .name("Administrator")
                    .email(request.getEmail())
                    .build();
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid admin credentials"));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse response = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue report")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        RevenueReportResponse response = dashboardService.getRevenueReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/patients")
    @Operation(summary = "Get all patients")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> getAllPatients() {
        List<PatientResponse> response = patientService.getAllPatients();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/patients/paginated")
    @Operation(summary = "Get all patients (paginated)")
    public ResponseEntity<ApiResponse<Page<PatientResponse>>> getAllPatientsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PatientResponse> response = patientService.getAllPatientsPaginated(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/appointments")
    @Operation(summary = "Get all appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments() {
        List<AppointmentResponse> response = appointmentService.getAllAppointments();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/appointments/paginated")
    @Operation(summary = "Get all appointments (paginated)")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getAllAppointmentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AppointmentResponse> response = appointmentService.getAllAppointmentsPaginated(
                PageRequest.of(page, size, Sort.by("appointmentDate").descending()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/patients/quick-search")
    @Operation(summary = "Quick search patients for auto-suggestions")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> quickSearchPatients(
            @RequestParam(required = false) String query) {
        List<PatientResponse> response = patientService.quickSearch(query);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/patients/search")
    @Operation(summary = "Advanced search patients with filters")
    public ResponseEntity<ApiResponse<Page<PatientResponse>>> searchPatients(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) com.HMS.MediCare.enums.Gender gender,
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAfter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdBefore,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        com.HMS.MediCare.dto.request.PatientSearchRequest searchRequest = 
                com.HMS.MediCare.dto.request.PatientSearchRequest.builder()
                        .query(query)
                        .name(name)
                        .email(email)
                        .phone(phone)
                        .minAge(minAge)
                        .maxAge(maxAge)
                        .gender(gender)
                        .bloodGroup(bloodGroup)
                        .createdAfter(createdAfter)
                        .createdBefore(createdBefore)
                        .sortBy(sortBy)
                        .sortDirection(sortDirection)
                        .build();
        
        Sort sort = sortDirection.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        
        Page<PatientResponse> response = patientService.searchPatients(
                searchRequest, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

