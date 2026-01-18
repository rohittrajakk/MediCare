package com.HMS.MediCare.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * AI-powered Health Insights Service using Spring AI with Ollama
 * Provides personalized health recommendations based on patient data
 */
@Service
@Slf4j
public class HealthInsightsService {

    private final ChatClient chatClient;
    private final boolean aiEnabled;

    @Autowired
    public HealthInsightsService(@Autowired(required = false) ChatModel chatModel) {
        if (chatModel != null) {
            this.chatClient = ChatClient.builder(chatModel).build();
            this.aiEnabled = true;
            log.info("AI Health Insights enabled with Ollama");
        } else {
            this.chatClient = null;
            this.aiEnabled = false;
            log.warn("AI Health Insights disabled - Ollama not configured");
        }
    }

    /**
     * Check if AI is available
     */
    public boolean isAiEnabled() {
        return aiEnabled;
    }

    /**
     * Generate health insights based on vitals data
     */
    public String generateHealthInsights(Map<String, Double> vitals, String patientInfo) {
        if (!aiEnabled) {
            return generateFallbackInsights(vitals);
        }

        try {
            String prompt = buildVitalsPrompt(vitals, patientInfo);
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("AI insights generation failed: {}", e.getMessage());
            return generateFallbackInsights(vitals);
        }
    }

    /**
     * Generate medication interaction warning
     */
    public String checkMedicationInteractions(String medications) {
        if (!aiEnabled) {
            return "Please consult with your pharmacist about potential medication interactions.";
        }

        try {
            String prompt = String.format("""
                As a healthcare AI assistant, analyze these medications for potential interactions:
                %s
                
                Provide:
                1. Any known drug interactions
                2. Foods to avoid
                3. Timing recommendations
                
                Keep the response concise and patient-friendly.
                """, medications);

            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Medication interaction check failed: {}", e.getMessage());
            return "Unable to check interactions. Please consult your pharmacist.";
        }
    }

    /**
     * Generate personalized health tips based on conditions
     */
    public String generateHealthTips(String conditions, String lifestyle) {
        if (!aiEnabled) {
            return generateGenericHealthTips();
        }

        try {
            String prompt = String.format("""
                As a healthcare AI assistant, provide personalized health tips for a patient with:
                Conditions: %s
                Lifestyle: %s
                
                Give 3-5 actionable, specific tips. Keep it concise and encouraging.
                """, conditions, lifestyle);

            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Health tips generation failed: {}", e.getMessage());
            return generateGenericHealthTips();
        }
    }

    /**
     * Build prompt for vitals analysis
     */
    private String buildVitalsPrompt(Map<String, Double> vitals, String patientInfo) {
        StringBuilder sb = new StringBuilder();
        sb.append("As a healthcare AI assistant, analyze these vital signs:\n\n");
        vitals.forEach((key, value) -> sb.append(String.format("- %s: %.1f\n", key, value)));
        sb.append("\nPatient Info: ").append(patientInfo);
        sb.append("\n\nProvide:\n");
        sb.append("1. Overall health assessment\n");
        sb.append("2. Any concerns based on the readings\n");
        sb.append("3. 2-3 specific recommendations\n");
        sb.append("\nKeep the response concise, clear, and patient-friendly.");
        return sb.toString();
    }

    /**
     * Fallback insights when AI is not available
     */
    private String generateFallbackInsights(Map<String, Double> vitals) {
        StringBuilder insights = new StringBuilder();
        insights.append("Based on your vital readings:\n\n");

        vitals.forEach((vital, value) -> {
            String status = analyzeVital(vital, value);
            insights.append(String.format("• %s: %s\n", vital.replace("_", " "), status));
        });

        insights.append("\nGeneral recommendations:\n");
        insights.append("• Stay hydrated and maintain regular activity\n");
        insights.append("• Monitor any unusual symptoms and report to your doctor\n");
        insights.append("• Take medications as prescribed\n");

        return insights.toString();
    }

    private String analyzeVital(String vital, Double value) {
        return switch (vital.toUpperCase()) {
            case "BLOOD_PRESSURE_SYSTOLIC" -> value < 90 ? "Low" : value > 140 ? "Elevated" : "Normal";
            case "BLOOD_PRESSURE_DIASTOLIC" -> value < 60 ? "Low" : value > 90 ? "Elevated" : "Normal";
            case "HEART_RATE" -> value < 60 ? "Below normal" : value > 100 ? "Elevated" : "Normal";
            case "TEMPERATURE" -> value < 36 ? "Low" : value > 37.5 ? "Elevated" : "Normal";
            case "OXYGEN_LEVEL" -> value < 95 ? "Low - monitor closely" : "Normal";
            case "GLUCOSE_LEVEL" -> value < 70 ? "Low" : value > 140 ? "Elevated" : "Normal";
            default -> "Within expected range";
        };
    }

    private String generateGenericHealthTips() {
        return """
            **General Health Tips:**
            
            1. **Stay Active**: Aim for 30 minutes of moderate activity daily
            2. **Hydration**: Drink 8 glasses of water per day
            3. **Sleep**: Maintain 7-8 hours of quality sleep
            4. **Nutrition**: Eat balanced meals with plenty of vegetables
            5. **Stress Management**: Practice deep breathing or meditation
            
            Consult your healthcare provider for personalized advice.
            """;
    }
    /**
     * General AI Chat
     */
    public String chat(String message) {
        if (!aiEnabled) return "AI service is currently unavailable.";
        try {
            return chatClient.prompt().user(message).call().content();
        } catch (Exception e) {
            return "I apologize, but I am having trouble processing your request right now.";
        }
    }

    /**
     * Analyze Health Report Document (PDF/Text)
     */
    public String analyzeHealthReport(org.springframework.web.multipart.MultipartFile file, String query) {
        if (!aiEnabled) return "AI service is currently unavailable.";
        
        try {
            String textContent = extractTextFromFile(file);
            if (textContent.isEmpty()) {
                return "I couldn't read any text from this document. Please ensure it's a valid PDF or text file.";
            }

            String prompt = String.format("""
                Analyze this health document content and answer the user's query.
                
                User Query: %s
                
                Document Content:
                %s
                
                Provide a helpful, professional medical summary and recommendations.
                Disclaimer: Remind the user you are an AI and this is not professional medical advice.
                """, query, textContent);

            return chatClient.prompt().user(prompt).call().content();
        } catch (Exception e) {
            log.error("Report analysis failed: {}", e.getMessage());
            return "Failed to analyze the document. Please try again.";
        }
    }

    private String extractTextFromFile(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        String fileName = file.getOriginalFilename();
        if (fileName != null && fileName.toLowerCase().endsWith(".pdf")) {
            try (org.apache.pdfbox.pdmodel.PDDocument document = org.apache.pdfbox.pdmodel.PDDocument.load(file.getInputStream())) {
                org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
                return stripper.getText(document);
            }
        } else {
            // Assume text file
            return new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
        }
    }
}
