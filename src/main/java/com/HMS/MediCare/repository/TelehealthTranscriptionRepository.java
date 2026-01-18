package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.TelehealthTranscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TelehealthTranscriptionRepository extends JpaRepository<TelehealthTranscription, Long> {
    Optional<TelehealthTranscription> findByAppointmentId(Long appointmentId);
}
