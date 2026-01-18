package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    Optional<Doctor> findByEmail(String email);
    
    Optional<Doctor> findByDoctorUniqueId(String doctorUniqueId);
    boolean existsByDoctorUniqueId(String doctorUniqueId);
    
    boolean existsByEmail(String email);
    
    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);
    
    List<Doctor> findByActiveTrue();
}
