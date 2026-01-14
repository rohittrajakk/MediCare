package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.request.PaymentRequest;
import com.HMS.MediCare.dto.response.PaymentResponse;
import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.Payment;
import com.HMS.MediCare.enums.PaymentStatus;
import com.HMS.MediCare.exception.BadRequestException;
import com.HMS.MediCare.exception.ResourceNotFoundException;
import com.HMS.MediCare.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentService appointmentService;

    public PaymentResponse createPayment(PaymentRequest request) {
        Appointment appointment = appointmentService.getAppointmentEntityById(request.getAppointmentId());

        // Check if payment already exists for this appointment
        if (paymentRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new BadRequestException("Payment already exists for this appointment");
        }

        Payment payment = Payment.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .amount(request.getAmount())
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByAppointmentId(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "appointmentId", appointmentId));
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPatientPayments(Long patientId) {
        return paymentRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponse updatePaymentStatus(Long id, PaymentStatus newStatus, String transactionId) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));

        payment.setPaymentStatus(newStatus);
        
        if (newStatus == PaymentStatus.PAID) {
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionId(transactionId != null ? transactionId : generateTransactionId());
            // Simulate email notification
            sendPaymentConfirmationEmail(payment);
        }

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    public PaymentResponse processPayment(Long id, String paymentMethod) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));

        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Payment already completed");
        }

        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setTransactionId(generateTransactionId());

        // Simulate email notification
        sendPaymentConfirmationEmail(payment);

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    public BigDecimal getTotalRevenue() {
        BigDecimal revenue = paymentRepository.calculateTotalRevenue();
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    public BigDecimal getRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal revenue = paymentRepository.calculateRevenueByDateRange(startDate, endDate);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    public long countPayments() {
        return paymentRepository.count();
    }

    public long countByStatus(PaymentStatus status) {
        return paymentRepository.countByPaymentStatus(status);
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void sendPaymentConfirmationEmail(Payment payment) {
        // Simulate email notification
        log.info("Payment confirmation email sent to: {} for amount: {} with transaction ID: {}",
                payment.getPatient().getEmail(),
                payment.getAmount(),
                payment.getTransactionId());
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .appointmentId(payment.getAppointment().getId())
                .patientId(payment.getPatient().getId())
                .patientName(payment.getPatient().getName())
                .doctorId(payment.getDoctor().getId())
                .doctorName(payment.getDoctor().getName())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
