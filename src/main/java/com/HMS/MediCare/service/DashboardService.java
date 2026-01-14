package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.response.DashboardStatsResponse;
import com.HMS.MediCare.dto.response.RevenueReportResponse;
import com.HMS.MediCare.enums.AppointmentStatus;
import com.HMS.MediCare.enums.PaymentStatus;
import com.HMS.MediCare.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final PaymentService paymentService;

    public DashboardStatsResponse getDashboardStats() {
        return DashboardStatsResponse.builder()
                .totalPatients(patientRepository.count())
                .totalDoctors(doctorService.countDoctors())
                .totalAppointments(appointmentService.countAppointments())
                .pendingAppointments(appointmentService.countByStatus(AppointmentStatus.PENDING))
                .confirmedAppointments(appointmentService.countByStatus(AppointmentStatus.CONFIRMED))
                .completedAppointments(appointmentService.countByStatus(AppointmentStatus.COMPLETED))
                .cancelledAppointments(appointmentService.countByStatus(AppointmentStatus.CANCELLED))
                .todayAppointments(appointmentService.countTodayAppointments())
                .totalPayments(paymentService.countPayments())
                .paidPayments(paymentService.countByStatus(PaymentStatus.PAID))
                .pendingPayments(paymentService.countByStatus(PaymentStatus.PENDING))
                .totalRevenue(paymentService.getTotalRevenue())
                .build();
    }

    public RevenueReportResponse getRevenueReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        BigDecimal totalRevenue = paymentService.getRevenueByDateRange(startDateTime, endDateTime);
        
        // Generate daily revenue breakdown (simplified)
        List<RevenueReportResponse.DailyRevenue> dailyRevenue = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            LocalDateTime dayStart = current.atStartOfDay();
            LocalDateTime dayEnd = current.atTime(LocalTime.MAX);
            BigDecimal dayRevenue = paymentService.getRevenueByDateRange(dayStart, dayEnd);
            
            if (dayRevenue != null && dayRevenue.compareTo(BigDecimal.ZERO) > 0) {
                dailyRevenue.add(RevenueReportResponse.DailyRevenue.builder()
                        .date(current)
                        .revenue(dayRevenue)
                        .transactionCount(1) // Simplified
                        .build());
            }
            current = current.plusDays(1);
        }

        return RevenueReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalTransactions(paymentService.countByStatus(PaymentStatus.PAID))
                .dailyRevenue(dailyRevenue)
                .build();
    }
}
