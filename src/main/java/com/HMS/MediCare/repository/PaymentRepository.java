package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.Payment;
import com.HMS.MediCare.enums.PaymentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Override
    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<Payment> findAll();
    
    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<Payment> findByPatientId(Long patientId);
    
    List<Payment> findByDoctorId(Long doctorId);
    
    Optional<Payment> findByAppointmentId(Long appointmentId);
    
    List<Payment> findByPaymentStatus(PaymentStatus status);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'PAID'")
    BigDecimal calculateTotalRevenue();
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'PAID' AND p.paidAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateRevenueByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = :status")
    long countByPaymentStatus(@Param("status") PaymentStatus status);
}
