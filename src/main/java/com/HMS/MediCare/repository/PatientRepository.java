package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.enums.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {
    
    Optional<Patient> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    // Search by name (case-insensitive, partial match)
    List<Patient> findByNameContainingIgnoreCase(String name);
    
    Page<Patient> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    // Search by email (case-insensitive, partial match)
    List<Patient> findByEmailContainingIgnoreCase(String email);
    
    // Search by phone (partial match)
    List<Patient> findByPhoneContaining(String phone);
    
    // Search by gender
    List<Patient> findByGender(Gender gender);
    
    Page<Patient> findByGender(Gender gender, Pageable pageable);
    
    // Search by blood group
    List<Patient> findByBloodGroup(String bloodGroup);
    
    Page<Patient> findByBloodGroup(String bloodGroup, Pageable pageable);
    
    // Search by age range
    List<Patient> findByAgeBetween(Integer minAge, Integer maxAge);
    
    Page<Patient> findByAgeBetween(Integer minAge, Integer maxAge, Pageable pageable);
    
    // Quick search - searches across multiple fields
    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "p.phone LIKE CONCAT('%', :query, '%') OR " +
           "CAST(p.id AS string) LIKE CONCAT('%', :query, '%')")
    List<Patient> quickSearch(@Param("query") String query);
    
    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "p.phone LIKE CONCAT('%', :query, '%') OR " +
           "CAST(p.id AS string) LIKE CONCAT('%', :query, '%')")
    Page<Patient> quickSearch(@Param("query") String query, Pageable pageable);
    
    // Search by creation date range
    List<Patient> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    Page<Patient> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
