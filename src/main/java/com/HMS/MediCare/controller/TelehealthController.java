package com.HMS.MediCare.controller;

import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.PreVisitQuestionnaire;
import com.HMS.MediCare.entity.TelehealthTranscription;
import com.HMS.MediCare.service.TelehealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/telehealth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelehealthController {

    private final TelehealthService telehealthService;
    private final com.HMS.MediCare.service.PatientService patientService;

    @PostMapping("/patient/{id}/acuity")
    public ResponseEntity<com.HMS.MediCare.dto.response.PatientResponse> updateAcuity(
            @PathVariable Long id,
            @RequestParam com.HMS.MediCare.enums.AcuityLevel level,
            @RequestParam String reason) {
        return ResponseEntity.ok(patientService.updateAcuity(id, level, reason));
    }

    @PostMapping("/enable/{appointmentId}")
    public ResponseEntity<Appointment> enableTelehealth(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(telehealthService.enableTelehealth(appointmentId));
    }

    @PostMapping("/questionnaire")
    public ResponseEntity<PreVisitQuestionnaire> saveQuestionnaire(@RequestBody PreVisitQuestionnaire questionnaire) {
        return ResponseEntity.ok(telehealthService.saveQuestionnaire(questionnaire));
    }

    @GetMapping("/questionnaire/{appointmentId}")
    public ResponseEntity<PreVisitQuestionnaire> getQuestionnaire(@PathVariable Long appointmentId) {
        return telehealthService.getQuestionnaireByAppointment(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/transcription/{appointmentId}")
    public ResponseEntity<TelehealthTranscription> updateTranscription(
            @PathVariable Long appointmentId,
            @RequestParam String text,
            @RequestParam(required = false) String highlightedVitals) {
        return ResponseEntity.ok(telehealthService.updateTranscript(appointmentId, text, highlightedVitals));
    }

    @GetMapping("/transcription/{appointmentId}")
    public ResponseEntity<TelehealthTranscription> getTranscription(@PathVariable Long appointmentId) {
        return telehealthService.getTranscriptionByAppointment(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
