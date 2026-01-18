package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.AuditLog;
import com.HMS.MediCare.enums.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Find by date range
    Page<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Find by user
    Page<AuditLog> findByUserId(Long userId, Pageable pageable);

    // Find by entity type and ID
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, String entityId);

    // Find by action type
    Page<AuditLog> findByAction(AuditAction action, Pageable pageable);

    // Complex search with filters
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR a.timestamp <= :endDate) AND " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:action IS NULL OR a.action = :action)")
    Page<AuditLog> searchAuditLogs(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("userId") Long userId,
            @Param("entityType") String entityType,
            @Param("action") AuditAction action,
            Pageable pageable);

    // Get latest audit log for hash chain
    Optional<AuditLog> findTopByOrderByIdDesc();

    // Count by date range for stats
    long countByTimestampBetween(LocalDateTime start, LocalDateTime end);

    // Get audit logs ordered by ID for chain verification
    List<AuditLog> findAllByOrderByIdAsc();
}
