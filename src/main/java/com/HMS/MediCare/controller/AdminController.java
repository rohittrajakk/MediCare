package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.response.*;
import com.HMS.MediCare.service.AppointmentService;
import com.HMS.MediCare.service.DashboardService;
import com.HMS.MediCare.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
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
}
