package com.HMS.MediCare.service;

import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.enums.AppointmentStatus;
import com.HMS.MediCare.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * AI-powered No-Show Risk Prediction Service
 * Uses multiple factors to calculate probability of patient no-show
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NoShowRiskService {

    private final AppointmentRepository appointmentRepository;

    /**
     * Calculate no-show risk score (0.0 to 1.0) using AI/ML-based scoring
     * Factors considered:
     * - Patient's historical no-show rate
     * - Day of week (Mondays have higher no-show rates)
     * - Time of day (early morning has higher no-show)
     * - Lead time (appointments far in advance have higher no-show)
     * - Confirmation status
     */
    public double calculateNoShowRisk(Appointment appointment) {
        double riskScore = 0.0;
        
        Patient patient = appointment.getPatient();
        
        // Factor 1: Historical no-show rate (weight: 40%)
        double historicalRate = calculatePatientNoShowRate(patient.getId());
        riskScore += historicalRate * 0.40;
        
        // Factor 2: Day of week (weight: 15%)
        double dayRisk = calculateDayOfWeekRisk(appointment.getAppointmentDate());
        riskScore += dayRisk * 0.15;
        
        // Factor 3: Time of day (weight: 15%)
        double timeRisk = calculateTimeOfDayRisk(appointment.getTimeSlot());
        riskScore += timeRisk * 0.15;
        
        // Factor 4: Lead time - days until appointment (weight: 20%)
        double leadTimeRisk = calculateLeadTimeRisk(appointment.getCreatedAt().toLocalDate(), 
                                                     appointment.getAppointmentDate());
        riskScore += leadTimeRisk * 0.20;
        
        // Factor 5: Confirmation status (weight: 10%)
        double confirmationRisk = calculateConfirmationRisk(appointment);
        riskScore += confirmationRisk * 0.10;
        
        // Normalize to 0.0 - 1.0 range
        riskScore = Math.min(1.0, Math.max(0.0, riskScore));
        
        log.debug("No-show risk for appointment {}: {} (historical={}, day={}, time={}, lead={}, confirm={})",
                appointment.getId(), riskScore, historicalRate, dayRisk, timeRisk, leadTimeRisk, confirmationRisk);
        
        return Math.round(riskScore * 100) / 100.0; // Round to 2 decimal places
    }

    /**
     * Get risk level category
     */
    public String getRiskLevel(double riskScore) {
        if (riskScore >= 0.7) return "HIGH";
        if (riskScore >= 0.4) return "MEDIUM";
        return "LOW";
    }

    /**
     * Calculate patient's historical no-show rate
     */
    private double calculatePatientNoShowRate(Long patientId) {
        List<Appointment> pastAppointments = appointmentRepository.findByPatientId(patientId);
        
        if (pastAppointments.isEmpty()) {
            return 0.2; // Default moderate risk for new patients
        }
        
        long totalPast = pastAppointments.stream()
                .filter(a -> a.getAppointmentDate().isBefore(LocalDate.now()))
                .count();
        
        if (totalPast == 0) {
            return 0.2; // No history yet
        }
        
        long noShows = pastAppointments.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsNoShow()) || 
                            a.getStatus() == AppointmentStatus.CANCELLED)
                .count();
        
        return (double) noShows / totalPast;
    }

    /**
     * Calculate risk based on day of week
     * Mondays and Fridays typically have higher no-show rates
     */
    private double calculateDayOfWeekRisk(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return switch (day) {
            case MONDAY -> 0.7;    // Highest risk
            case FRIDAY -> 0.6;    // High risk
            case TUESDAY, WEDNESDAY -> 0.3;  // Low risk
            case THURSDAY -> 0.4;  // Medium risk
            case SATURDAY, SUNDAY -> 0.5;  // Medium-high (if open)
        };
    }

    /**
     * Calculate risk based on time of day
     * Early morning and late afternoon have higher no-show rates
     */
    private double calculateTimeOfDayRisk(LocalTime time) {
        int hour = time.getHour();
        
        if (hour < 9) return 0.7;      // Early morning - high risk
        if (hour < 11) return 0.4;     // Mid-morning - low risk
        if (hour < 14) return 0.3;     // Around lunch - low risk
        if (hour < 16) return 0.4;     // Afternoon - low risk
        return 0.6;                     // Late afternoon - high risk
    }

    /**
     * Calculate risk based on lead time
     * Appointments booked far in advance have higher no-show rates
     */
    private double calculateLeadTimeRisk(LocalDate bookedOn, LocalDate appointmentDate) {
        long daysUntil = ChronoUnit.DAYS.between(bookedOn, appointmentDate);
        
        if (daysUntil <= 1) return 0.2;   // Same/next day - low risk
        if (daysUntil <= 3) return 0.3;   // Within 3 days - low risk
        if (daysUntil <= 7) return 0.4;   // Within a week - medium risk
        if (daysUntil <= 14) return 0.5;  // Within 2 weeks - medium risk
        if (daysUntil <= 30) return 0.6;  // Within a month - medium-high risk
        return 0.8;                        // More than a month - high risk
    }

    /**
     * Calculate risk based on confirmation status
     */
    private double calculateConfirmationRisk(Appointment appointment) {
        if (appointment.getConfirmedAt() != null) {
            return 0.1; // Confirmed - very low risk
        }
        
        return switch (appointment.getConfirmationStatus()) {
            case CONFIRMED -> 0.1;
            case PENDING -> 0.5;
            case UNCONFIRMED -> 0.8;
            case RESCHEDULED -> 0.3;
            case CANCELLED -> 1.0;
        };
    }

    /**
     * Identify high-risk appointments for proactive intervention
     */
    public List<Appointment> getHighRiskAppointments(LocalDate date, double threshold) {
        return appointmentRepository.findByAppointmentDate(date).stream()
                .filter(a -> a.getNoShowRiskScore() != null && a.getNoShowRiskScore() >= threshold)
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING || 
                            a.getStatus() == AppointmentStatus.CONFIRMED)
                .toList();
    }
}
