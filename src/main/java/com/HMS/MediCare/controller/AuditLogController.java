package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.ApiResponse;
import com.HMS.MediCare.entity.AuditLog;
import com.HMS.MediCare.enums.AuditAction;
import com.HMS.MediCare.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Audit Log Controller for HIPAA compliance reporting
 * Admin-only access for viewing and verifying audit trails
 */
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "HIPAA-compliant audit log management")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Search audit logs", description = "Query audit logs with optional filters")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> searchAuditLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditLog> logs = auditLogService.searchAuditLogs(startDate, endDate, userId, entityType, action, pageRequest);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get entity audit trail", description = "Get complete audit history for a specific entity")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getEntityAuditTrail(
            @PathVariable String entityType,
            @PathVariable String entityId
    ) {
        List<AuditLog> trail = auditLogService.getEntityAuditTrail(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success("Audit trail retrieved", trail));
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify hash chain", description = "Verify integrity of audit log hash chain for tamper detection")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyHashChain() {
        boolean isValid = auditLogService.verifyHashChain();
        
        Map<String, Object> result = new HashMap<>();
        result.put("chainValid", isValid);
        result.put("verifiedAt", LocalDateTime.now());
        result.put("status", isValid ? "INTACT" : "TAMPERED");
        
        String message = isValid 
                ? "Audit log hash chain integrity verified. No tampering detected."
                : "WARNING: Hash chain integrity check FAILED. Possible tampering detected!";
        
        return ResponseEntity.ok(ApiResponse.success(message, result));
    }

    @GetMapping("/actions")
    @Operation(summary = "Get audit action types", description = "List all available audit action types")
    public ResponseEntity<ApiResponse<AuditAction[]>> getAuditActions() {
        return ResponseEntity.ok(ApiResponse.success("Audit actions", AuditAction.values()));
    }
}
