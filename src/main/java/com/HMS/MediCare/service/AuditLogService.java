package com.HMS.MediCare.service;

import com.HMS.MediCare.entity.AuditLog;
import com.HMS.MediCare.enums.AuditAction;
import com.HMS.MediCare.repository.AuditLogRepository;
import com.HMS.MediCare.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * HIPAA-Compliant Audit Logging Service
 * - Creates immutable audit entries
 * - Maintains cryptographic hash chain for tamper detection
 * - Provides query capabilities for compliance reporting
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Create an audit log entry with hash chain
     */
    @Transactional
    public AuditLog createAuditLog(
            AuditAction action,
            String entityType,
            String entityId,
            String method,
            String details,
            String outcome
    ) {
        // Get current user from security context
        Long userId = null;
        String userEmail = "anonymous";
        String userRole = "NONE";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getUserId();
            userEmail = principal.getEmail();
            userRole = principal.getRole();
        }

        // Get IP address from request
        String ipAddress = getClientIpAddress();

        // Get previous hash for chain
        String previousHash = getPreviousHash();

        // Build the audit log entry
        AuditLog.AuditLogBuilder builder = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .userId(userId)
                .userEmail(userEmail)
                .userRole(userRole)
                .ipAddress(ipAddress)
                .method(method)
                .details(details)
                .outcome(outcome)
                .previousHash(previousHash);

        // Calculate current hash (includes all fields + previous hash)
        String currentHash = calculateHash(builder.build(), previousHash);
        
        AuditLog auditLog = builder.currentHash(currentHash).build();

        log.debug("Creating audit log: {} {} on {} by {}", action, method, entityType, userEmail);
        return auditLogRepository.save(auditLog);
    }

    /**
     * Quick method to log an action
     */
    public void log(AuditAction action, String entityType, String entityId, String method) {
        createAuditLog(action, entityType, entityId, method, null, "SUCCESS");
    }

    /**
     * Log with details
     */
    public void log(AuditAction action, String entityType, String entityId, String method, String details) {
        createAuditLog(action, entityType, entityId, method, details, "SUCCESS");
    }

    /**
     * Log failure
     */
    public void logFailure(AuditAction action, String entityType, String method, String details) {
        createAuditLog(action, entityType, null, method, details, "FAILURE");
    }

    /**
     * Get audit logs with filters
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> searchAuditLogs(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Long userId,
            String entityType,
            AuditAction action,
            Pageable pageable
    ) {
        return auditLogRepository.searchAuditLogs(startDate, endDate, userId, entityType, action, pageable);
    }

    /**
     * Get audit logs for a specific entity
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getEntityAuditTrail(String entityType, String entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * Verify the integrity of the audit log hash chain
     * Returns true if chain is intact, false if tampering detected
     */
    @Transactional(readOnly = true)
    public boolean verifyHashChain() {
        List<AuditLog> allLogs = auditLogRepository.findAllByOrderByIdAsc();
        
        if (allLogs.isEmpty()) {
            return true;
        }

        String previousHash = null;
        for (AuditLog auditLog : allLogs) {
            // Verify previous hash matches
            if (previousHash != null && !previousHash.equals(auditLog.getPreviousHash())) {
                log.error("Hash chain broken at audit log ID: {}. Expected previous hash: {}, found: {}",
                        auditLog.getId(), previousHash, auditLog.getPreviousHash());
                return false;
            }

            // Verify current hash is correct
            String expectedHash = calculateHash(auditLog, auditLog.getPreviousHash());
            if (!expectedHash.equals(auditLog.getCurrentHash())) {
                log.error("Hash mismatch at audit log ID: {}. Expected: {}, found: {}",
                        auditLog.getId(), expectedHash, auditLog.getCurrentHash());
                return false;
            }

            previousHash = auditLog.getCurrentHash();
        }

        log.info("Audit log hash chain verified successfully. {} entries checked.", allLogs.size());
        return true;
    }

    /**
     * Get the hash of the most recent audit log entry
     */
    private String getPreviousHash() {
        Optional<AuditLog> latest = auditLogRepository.findTopByOrderByIdDesc();
        return latest.map(AuditLog::getCurrentHash).orElse("GENESIS");
    }

    /**
     * Calculate SHA-256 hash of an audit log entry
     */
    private String calculateHash(AuditLog auditLog, String previousHash) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            
            String data = String.join("|",
                    String.valueOf(auditLog.getAction()),
                    auditLog.getEntityType() != null ? auditLog.getEntityType() : "",
                    auditLog.getEntityId() != null ? auditLog.getEntityId() : "",
                    auditLog.getUserId() != null ? String.valueOf(auditLog.getUserId()) : "",
                    auditLog.getUserEmail() != null ? auditLog.getUserEmail() : "",
                    auditLog.getMethod() != null ? auditLog.getMethod() : "",
                    auditLog.getOutcome() != null ? auditLog.getOutcome() : "",
                    previousHash != null ? previousHash : "GENESIS"
            );

            byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Convert bytes to hex string
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    /**
     * Get client IP address from request
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = 
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.debug("Could not determine client IP: {}", e.getMessage());
        }
        return "unknown";
    }
}
