package com.HMS.MediCare.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Custom principal object stored in SecurityContext
 * Provides easy access to user details from any controller/service
 */
@Getter
@AllArgsConstructor
public class UserPrincipal {
    private final Long userId;
    private final String email;
    private final String role;
}
