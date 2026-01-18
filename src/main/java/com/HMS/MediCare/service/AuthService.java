package com.HMS.MediCare.service;

import com.HMS.MediCare.dto.request.AuthRequest;
import com.HMS.MediCare.dto.response.AuthResponse;
import com.HMS.MediCare.entity.Doctor;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.exception.BadRequestException;
import com.HMS.MediCare.repository.DoctorRepository;
import com.HMS.MediCare.repository.PatientRepository;
import com.HMS.MediCare.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authentication Service for handling login and token operations
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${admin.email:admin@medicare.com}")
    private String adminEmail;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    /**
     * Authenticate patient and return JWT tokens
     */
    public AuthResponse authenticatePatient(AuthRequest request) {
        Patient patient = patientRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), patient.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return buildAuthResponse(patient.getId(), patient.getEmail(), patient.getName(), "PATIENT");
    }

    /**
     * Authenticate doctor and return JWT tokens
     */
    public AuthResponse authenticateDoctor(AuthRequest request) {
        Doctor doctor = doctorRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return buildAuthResponse(doctor.getId(), doctor.getEmail(), doctor.getName(), "DOCTOR");
    }

    /**
     * Authenticate admin and return JWT tokens
     */
    public AuthResponse authenticateAdmin(AuthRequest request) {
        // Check against configured admin credentials
        if (!request.getEmail().equals(adminEmail)) {
            throw new BadRequestException("Invalid admin credentials");
        }

        if (!request.getPassword().equals(adminPassword)) {
            throw new BadRequestException("Invalid admin credentials");
        }

        return buildAuthResponse(0L, adminEmail, "Administrator", "ADMIN");
    }

    /**
     * Refresh access token using refresh token
     */
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtService.isValidToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String tokenType = jwtService.extractTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new BadRequestException("Invalid token type. Use refresh token.");
        }

        Long userId = jwtService.extractUserId(refreshToken);
        String email = jwtService.extractUsername(refreshToken);
        String role = jwtService.extractRole(refreshToken);

        // Generate new access token (keep same refresh token until it expires)
        String newAccessToken = jwtService.generateAccessToken(userId, email, role);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Return same refresh token
                .tokenType("Bearer")
                .expiresIn(900L) // 15 minutes
                .id(userId)
                .email(email)
                .role(role)
                .build();
    }

    /**
     * Build auth response with tokens
     */
    private AuthResponse buildAuthResponse(Long userId, String email, String name, String role) {
        String accessToken = jwtService.generateAccessToken(userId, email, role);
        String refreshToken = jwtService.generateRefreshToken(userId, email, role);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900L) // 15 minutes in seconds
                .id(userId)
                .email(email)
                .name(name)
                .role(role)
                .build();
    }
}
