package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.request.PaymentRequest;
import com.HMS.MediCare.dto.response.ApiResponse;
import com.HMS.MediCare.dto.response.PaymentResponse;
import com.HMS.MediCare.enums.PaymentStatus;
import com.HMS.MediCare.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment management APIs")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Create a payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(@PathVariable Long id) {
        PaymentResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get payment by appointment ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByAppointment(
            @PathVariable Long appointmentId) {
        PaymentResponse response = paymentService.getPaymentByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get patient payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPatientPayments(
            @PathVariable Long patientId) {
        List<PaymentResponse> response = paymentService.getPatientPayments(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get all payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<PaymentResponse> response = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update payment status")
    public ResponseEntity<ApiResponse<PaymentResponse>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status,
            @RequestParam(required = false) String transactionId) {
        PaymentResponse response = paymentService.updatePaymentStatus(id, status, transactionId);
        return ResponseEntity.ok(ApiResponse.success("Payment status updated successfully", response));
    }

    @PostMapping("/{id}/process")
    @Operation(summary = "Process payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @PathVariable Long id,
            @RequestParam String paymentMethod) {
        PaymentResponse response = paymentService.processPayment(id, paymentMethod);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", response));
    }
}
