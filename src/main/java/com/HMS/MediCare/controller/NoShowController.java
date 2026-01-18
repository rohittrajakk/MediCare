package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.ApiResponse;
import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.AppointmentWaitlist;
import com.HMS.MediCare.enums.ConfirmationStatus;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.AppointmentRepository;
import com.HMS.MediCare.service.NoShowRiskService;
import com.HMS.MediCare.service.WaitlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * No-Show Prevention Controller
 * AI-powered appointment risk assessment and waitlist management
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "No-Show Prevention", description = "AI-powered no-show risk assessment and waitlist")
public class NoShowController {

    private final NoShowRiskService noShowRiskService;
    private final WaitlistService waitlistService;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/{id}/risk-score")
    @Operation(summary = "Get no-show risk score", description = "AI-powered prediction of no-show probability")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNoShowRisk(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        double riskScore = noShowRiskService.calculateNoShowRisk(appointment);
        String riskLevel = noShowRiskService.getRiskLevel(riskScore);
        
        // Update the stored risk score
        appointment.setNoShowRiskScore(riskScore);
        appointmentRepository.save(appointment);
        
        Map<String, Object> result = new HashMap<>();
        result.put("appointmentId", id);
        result.put("riskScore", riskScore);
        result.put("riskLevel", riskLevel);
        result.put("riskPercentage", Math.round(riskScore * 100) + "%");
        
        return ResponseEntity.ok(ApiResponse.success("Risk score calculated", result));
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm appointment", description = "Patient confirms attendance")
    public ResponseEntity<ApiResponse<String>> confirmAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        appointment.setConfirmationStatus(ConfirmationStatus.CONFIRMED);
        appointment.setConfirmedAt(LocalDateTime.now());
        
        // Recalculate risk (confirmation lowers risk)
        double newRisk = noShowRiskService.calculateNoShowRisk(appointment);
        appointment.setNoShowRiskScore(newRisk);
        
        appointmentRepository.save(appointment);
        
        return ResponseEntity.ok(ApiResponse.success("Appointment confirmed", null));
    }

    @GetMapping("/high-risk")
    @Operation(summary = "Get high-risk appointments", description = "Get appointments with high no-show probability")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getHighRiskAppointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0.5") double threshold
    ) {
        List<Appointment> highRisk = noShowRiskService.getHighRiskAppointments(date, threshold);
        
        List<Map<String, Object>> result = highRisk.stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("appointmentId", a.getId());
                    map.put("patientName", a.getPatient().getName());
                    map.put("doctorName", a.getDoctor().getName());
                    map.put("date", a.getAppointmentDate());
                    map.put("time", a.getTimeSlot());
                    map.put("riskScore", a.getNoShowRiskScore());
                    map.put("riskLevel", noShowRiskService.getRiskLevel(a.getNoShowRiskScore()));
                    map.put("confirmationStatus", a.getConfirmationStatus());
                    return map;
                })
                .toList();
        
        return ResponseEntity.ok(ApiResponse.success("High-risk appointments retrieved", result));
    }

    // ===== Waitlist Endpoints =====

    @PostMapping("/waitlist")
    @Operation(summary = "Join waitlist", description = "Add patient to appointment waitlist")
    public ResponseEntity<ApiResponse<AppointmentWaitlist>> joinWaitlist(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate preferredStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate preferredEnd,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime timeStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime timeEnd,
            @RequestParam(required = false) String symptoms
    ) {
        AppointmentWaitlist entry = waitlistService.addToWaitlist(
                patientId, doctorId, preferredStart, preferredEnd, timeStart, timeEnd, symptoms
        );
        return ResponseEntity.ok(ApiResponse.success("Added to waitlist", entry));
    }

    @GetMapping("/waitlist/patient/{patientId}")
    @Operation(summary = "Get patient waitlist", description = "Get patient's active waitlist entries")
    public ResponseEntity<ApiResponse<List<AppointmentWaitlist>>> getPatientWaitlist(@PathVariable Long patientId) {
        List<AppointmentWaitlist> entries = waitlistService.getPatientWaitlist(patientId);
        return ResponseEntity.ok(ApiResponse.success("Waitlist entries retrieved", entries));
    }

    @PostMapping("/waitlist/{id}/accept")
    @Operation(summary = "Accept waitlist slot")
    public ResponseEntity<ApiResponse<String>> acceptWaitlistSlot(@PathVariable Long id) {
        waitlistService.acceptSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Slot accepted", null));
    }

    @PostMapping("/waitlist/{id}/decline")
    @Operation(summary = "Decline waitlist slot")
    public ResponseEntity<ApiResponse<String>> declineWaitlistSlot(@PathVariable Long id) {
        waitlistService.declineSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Slot declined", null));
    }

    @DeleteMapping("/waitlist/{id}")
    @Operation(summary = "Cancel waitlist entry")
    public ResponseEntity<ApiResponse<String>> cancelWaitlistEntry(@PathVariable Long id) {
        waitlistService.cancelWaitlistEntry(id);
        return ResponseEntity.ok(ApiResponse.success("Waitlist entry cancelled", null));
    }
}
