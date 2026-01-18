package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.PreVisitQuestionnaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PreVisitQuestionnaireRepository extends JpaRepository<PreVisitQuestionnaire, Long> {
    Optional<PreVisitQuestionnaire> findByAppointmentId(Long appointmentId);
}
