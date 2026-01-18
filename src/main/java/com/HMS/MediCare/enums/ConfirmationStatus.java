package com.HMS.MediCare.enums;

/**
 * Appointment confirmation status for no-show prevention
 */
public enum ConfirmationStatus {
    PENDING,      // Not yet confirmed
    CONFIRMED,    // Patient confirmed attendance
    UNCONFIRMED,  // Reminder sent, no response
    RESCHEDULED,  // Patient rescheduled
    CANCELLED     // Patient cancelled
}
