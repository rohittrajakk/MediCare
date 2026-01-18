package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.ApiResponse;
import com.HMS.MediCare.dto.request.AuthRequest;
import com.HMS.MediCare.dto.request.RefreshTokenRequest;
import com.HMS.MediCare.dto.response.AuthResponse;
import com.HMS.MediCare.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller for JWT-based login and token management
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "JWT Authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login/patient")
    @Operation(summary = "Patient login", description = "Authenticate patient and receive JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> loginPatient(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticatePatient(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/login/doctor")
    @Operation(summary = "Doctor login", description = "Authenticate doctor and receive JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> loginDoctor(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticateDoctor(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/login/admin")
    @Operation(summary = "Admin login", description = "Authenticate admin and receive JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> loginAdmin(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticateAdmin(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Get new access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Invalidate current session (client should discard tokens)")
    public ResponseEntity<ApiResponse<String>> logout() {
        // With stateless JWT, logout is handled client-side by discarding tokens
        // For a more robust solution, implement a token blacklist with Redis
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
