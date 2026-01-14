package com.HMS.MediCare.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long todayAppointments;
    private long totalPayments;
    private long paidPayments;
    private long pendingPayments;
    private BigDecimal totalRevenue;
}
