package com.HMS.MediCare.service;

import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.PreVisitQuestionnaire;
import com.HMS.MediCare.entity.TelehealthTranscription;
import com.HMS.MediCare.repository.AppointmentRepository;
import com.HMS.MediCare.repository.PreVisitQuestionnaireRepository;
import com.HMS.MediCare.repository.TelehealthTranscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TelehealthService {

    private final PreVisitQuestionnaireRepository questionnaireRepository;
    private final TelehealthTranscriptionRepository transcriptionRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public Appointment enableTelehealth(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setIsTelehealth(true);
        if (appointment.getTelehealthRoomName() == null) {
            appointment.setTelehealthRoomName("MediCare-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public PreVisitQuestionnaire saveQuestionnaire(PreVisitQuestionnaire questionnaire) {
        return questionnaireRepository.save(questionnaire);
    }

    public Optional<PreVisitQuestionnaire> getQuestionnaireByAppointment(Long appointmentId) {
        return questionnaireRepository.findByAppointmentId(appointmentId);
    }

    @Transactional
    public TelehealthTranscription saveTranscription(TelehealthTranscription transcription) {
        return transcriptionRepository.save(transcription);
    }

    public Optional<TelehealthTranscription> getTranscriptionByAppointment(Long appointmentId) {
        return transcriptionRepository.findByAppointmentId(appointmentId);
    }

    @Transactional
    public TelehealthTranscription updateTranscript(Long appointmentId, String text, String highlightedVitals) {
        TelehealthTranscription transcription = transcriptionRepository.findByAppointmentId(appointmentId)
                .orElse(TelehealthTranscription.builder()
                        .appointment(appointmentRepository.findById(appointmentId)
                                .orElseThrow(() -> new RuntimeException("Appointment not found")))
                        .build());
        
        transcription.setFullTranscript(text);
        if (highlightedVitals != null) {
            transcription.setHighlightedVitals(highlightedVitals);
        }
        return transcriptionRepository.save(transcription);
    }
}
