package com.HMS.MediCare.controller;

import com.HMS.MediCare.dto.response.ApiResponse;
import com.HMS.MediCare.dto.response.MedicalRecordResponse;
import com.HMS.MediCare.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
@Tag(name = "Medical Record", description = "Medical record management APIs")
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping("/{id}")
    @Operation(summary = "Get medical record by ID")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getRecord(@PathVariable Long id) {
        MedicalRecordResponse response = medicalRecordService.getRecordById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/prescription/download")
    @Operation(summary = "Download prescription as text file")
    public ResponseEntity<byte[]> downloadPrescription(@PathVariable Long id) {
        String prescriptionContent = medicalRecordService.getPrescriptionContent(id);
        
        byte[] content = prescriptionContent.getBytes();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "prescription_" + id + ".txt");
        headers.setContentLength(content.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }

    @GetMapping("/{id}/prescription/view")
    @Operation(summary = "View prescription content")
    public ResponseEntity<ApiResponse<String>> viewPrescription(@PathVariable Long id) {
        String prescriptionContent = medicalRecordService.getPrescriptionContent(id);
        return ResponseEntity.ok(ApiResponse.success(prescriptionContent));
    }
}
