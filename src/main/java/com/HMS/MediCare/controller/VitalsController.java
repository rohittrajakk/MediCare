package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.ApiResponse;
import com.HMS.MediCare.entity.VitalsAlert;
import com.HMS.MediCare.entity.VitalsThreshold;
import com.HMS.MediCare.enums.AlertSeverity;
import com.HMS.MediCare.enums.VitalType;
import com.HMS.MediCare.service.HealthInsightsService;
import com.HMS.MediCare.service.VitalsMonitoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Remote Patient Monitoring Controller
 * Vitals tracking, threshold alerts, and AI health insights
 */
@RestController
@RequestMapping("/api/vitals")
@RequiredArgsConstructor
@Tag(name = "Remote Patient Monitoring", description = "Vitals tracking and AI health insights")
public class VitalsController {

    private final VitalsMonitoringService vitalsMonitoringService;
    private final HealthInsightsService healthInsightsService;
    private final com.HMS.MediCare.service.PatientVitalsService patientVitalsService;

    @PostMapping("/record")
    @Operation(summary = "Record vital reading", description = "Record a vital sign and check for threshold violations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recordVital(
            @RequestParam Long patientId,
            @RequestParam VitalType vitalType,
            @RequestParam Double value
    ) {
        Optional<VitalsAlert> alert = vitalsMonitoringService.recordVitalReading(patientId, vitalType, value);
        
        Map<String, Object> result = new HashMap<>();
        result.put("recorded", true);
        result.put("vitalType", vitalType);
        result.put("value", value);
        
        if (alert.isPresent()) {
            result.put("alertGenerated", true);
            result.put("alert", alert.get());
        } else {
            result.put("alertGenerated", false);
            result.put("status", "Normal reading");
        }
        
        return ResponseEntity.ok(ApiResponse.success("Vital recorded", result));
    }

    @PostMapping("/add")
    @Operation(summary = "Add manual vitals", description = "Add comprehensive manual vitals record")
    public ResponseEntity<ApiResponse<com.HMS.MediCare.dto.response.PatientVitalsResponse>> addVitals(
            @RequestParam Long patientId,
            @RequestBody com.HMS.MediCare.dto.request.PatientVitalsRequest request
    ) {
        com.HMS.MediCare.dto.response.PatientVitalsResponse response = patientVitalsService.recordVitals(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Vitals recorded successfully", response));
    }

    @GetMapping("/dashboard/{patientId}")
    @Operation(summary = "Get 3D Vitals Dashboard Data", description = "Aggregated vitals and conditions for the 3D dashboard")
    public ResponseEntity<ApiResponse<com.HMS.MediCare.dto.response.VitalsDashboardResponse>> getDashboard(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success("Dashboard data fetched", patientVitalsService.getPatientHealthDashboard(patientId)));
    }

    @PostMapping("/record-multiple")
    @Operation(summary = "Record multiple vitals", description = "Record multiple vital signs at once")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recordMultipleVitals(
            @RequestParam Long patientId,
            @RequestBody Map<VitalType, Double> vitals
    ) {
        Map<String, Object> results = new HashMap<>();
        List<VitalsAlert> alerts = vitals.entrySet().stream()
                .map(entry -> vitalsMonitoringService.recordVitalReading(patientId, entry.getKey(), entry.getValue()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
        
        results.put("recorded", vitals.size());
        results.put("alertsGenerated", alerts.size());
        results.put("alerts", alerts);
        
        return ResponseEntity.ok(ApiResponse.success("Vitals recorded", results));
    }

    @PostMapping("/threshold")
    @Operation(summary = "Set vital threshold", description = "Set custom threshold for a patient's vital type")
    public ResponseEntity<ApiResponse<VitalsThreshold>> setThreshold(
            @RequestParam Long patientId,
            @RequestParam VitalType vitalType,
            @RequestParam Double minValue,
            @RequestParam Double maxValue,
            @RequestParam(required = false) Double criticalMin,
            @RequestParam(required = false) Double criticalMax
    ) {
        VitalsThreshold threshold = vitalsMonitoringService.setThreshold(
                patientId, vitalType, minValue, maxValue, criticalMin, criticalMax
        );
        return ResponseEntity.ok(ApiResponse.success("Threshold set", threshold));
    }

    @GetMapping("/alerts/patient/{patientId}")
    @Operation(summary = "Get patient alerts", description = "Get unacknowledged alerts for a patient")
    public ResponseEntity<ApiResponse<List<VitalsAlert>>> getPatientAlerts(@PathVariable Long patientId) {
        List<VitalsAlert> alerts = vitalsMonitoringService.getUnacknowledgedAlerts(patientId);
        return ResponseEntity.ok(ApiResponse.success("Alerts retrieved", alerts));
    }

    @GetMapping("/alerts/patient/{patientId}/history")
    @Operation(summary = "Get alert history", description = "Get all alerts for a patient (paginated)")
    public ResponseEntity<ApiResponse<Page<VitalsAlert>>> getAlertHistory(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<VitalsAlert> alerts = vitalsMonitoringService.getPatientAlerts(
                patientId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.success("Alert history retrieved", alerts));
    }

    @PostMapping("/alerts/{alertId}/acknowledge")
    @Operation(summary = "Acknowledge alert", description = "Mark an alert as acknowledged")
    public ResponseEntity<ApiResponse<VitalsAlert>> acknowledgeAlert(
            @PathVariable Long alertId,
            @RequestParam String acknowledgedBy
    ) {
        VitalsAlert alert = vitalsMonitoringService.acknowledgeAlert(alertId, acknowledgedBy);
        return ResponseEntity.ok(ApiResponse.success("Alert acknowledged", alert));
    }

    @GetMapping("/alerts/critical")
    @Operation(summary = "Get critical alerts", description = "Get all unacknowledged critical alerts (admin)")
    public ResponseEntity<ApiResponse<List<VitalsAlert>>> getCriticalAlerts() {
        List<VitalsAlert> alerts = vitalsMonitoringService.getCriticalAlerts();
        return ResponseEntity.ok(ApiResponse.success("Critical alerts retrieved", alerts));
    }

    @GetMapping("/alerts/summary")
    @Operation(summary = "Get alerts summary", description = "Count unacknowledged alerts by severity")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getAlertsSummary() {
        Map<String, Long> summary = new HashMap<>();
        for (AlertSeverity severity : AlertSeverity.values()) {
            summary.put(severity.name(), vitalsMonitoringService.countUnacknowledgedBySeverity(severity));
        }
        return ResponseEntity.ok(ApiResponse.success("Alerts summary", summary));
    }

    // ===== AI Health Insights =====

    @PostMapping("/insights")
    @Operation(summary = "Get AI health insights", description = "AI-powered analysis of vitals and recommendations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthInsights(
            @RequestBody Map<String, Double> vitals,
            @RequestParam(required = false, defaultValue = "General patient") String patientInfo
    ) {
        Map<String, Object> result = new HashMap<>();
        result.put("aiEnabled", healthInsightsService.isAiEnabled());
        result.put("insights", healthInsightsService.generateHealthInsights(vitals, patientInfo));
        
        return ResponseEntity.ok(ApiResponse.success("Health insights generated", result));
    }

    @PostMapping("/medication-interactions")
    @Operation(summary = "Check medication interactions", description = "AI-powered medication interaction analysis")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkMedicationInteractions(
            @RequestParam String medications
    ) {
        Map<String, Object> result = new HashMap<>();
        result.put("aiEnabled", healthInsightsService.isAiEnabled());
        result.put("analysis", healthInsightsService.checkMedicationInteractions(medications));
        
        return ResponseEntity.ok(ApiResponse.success("Medication analysis completed", result));
    }

    @RequestMapping(value = "/health-tips", method = {RequestMethod.GET, RequestMethod.POST})
    @Operation(summary = "Get personalized health tips", description = "AI-generated health recommendations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthTips(
            @RequestParam(required = false, defaultValue = "General") String conditions,
            @RequestParam(required = false, defaultValue = "Moderate activity") String lifestyle
    ) {
        Map<String, Object> result = new HashMap<>();
        result.put("aiEnabled", healthInsightsService.isAiEnabled());
        result.put("tips", healthInsightsService.generateHealthTips(conditions, lifestyle));
        
        return ResponseEntity.ok(ApiResponse.success("Health tips generated", result));
    }
    @PostMapping("/chat")
    @Operation(summary = "Chat with AI", description = "Send a message to the AI assistant")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String response = healthInsightsService.chat(message);
        return ResponseEntity.ok(ApiResponse.success("AI response", Map.of("response", response)));
    }

    @PostMapping(value = "/analyze-report", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Analyze health report", description = "Upload a document for AI analysis")
    public ResponseEntity<ApiResponse<Map<String, String>>> analyzeReport(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "query", required = false, defaultValue = "Analyze this report") String query
    ) {
        String analysis = healthInsightsService.analyzeHealthReport(file, query);
        return ResponseEntity.ok(ApiResponse.success("Report analysis", Map.of("response", analysis)));
    }
}
