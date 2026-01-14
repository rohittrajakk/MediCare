package com.HMS.MediCare.dto.response;

import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableSlotsResponse {
    private Long doctorId;
    private String doctorName;
    private List<LocalTime> availableSlots;
}
