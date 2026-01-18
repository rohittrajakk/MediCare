package com.HMS.MediCare.enums;

/**
 * Waitlist status for appointment backfill
 */
public enum WaitlistStatus {
    WAITING,      // In queue
    NOTIFIED,     // Slot available, patient notified
    ACCEPTED,     // Patient accepted the slot
    DECLINED,     // Patient declined the slot
    EXPIRED,      // Notification expired
    CANCELLED     // Waitlist entry cancelled
}
