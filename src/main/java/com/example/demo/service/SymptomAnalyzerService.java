package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SymptomAnalyzerService {

    public Map<String, Object> analyze(String symptoms) {
        Map<String, Object> response = new HashMap<>();
        String lowerSymptoms = symptoms != null ? symptoms.toLowerCase() : "";

        List<String> conditions = new ArrayList<>();
        List<String> precautions = new ArrayList<>();
        List<String> medicines = new ArrayList<>();
        String severity = "Low Risk";
        String recommendedDoctor = "General Physician";
        boolean isEmergency = false;
        List<String> followUpQuestions = new ArrayList<>();

        // Emergency detection
        if (lowerSymptoms.contains("chest pain") || lowerSymptoms.contains("breathing")
                || lowerSymptoms.contains("shortness of breath") || lowerSymptoms.contains("stroke")
                || lowerSymptoms.contains("heart")) {
            severity = "High Risk";
            isEmergency = true;
            conditions.add("Possible Cardiac Event");
            conditions.add("Severe Respiratory Distress");
            precautions.add("Do not exert yourself.");
            precautions.add("Sit down and rest immediately.");
            medicines.add("Aspirin (if suspected heart attack and no allergy)");
            recommendedDoctor = "Cardiologist / Emergency Medicine";
            followUpQuestions.add("Is the pain radiating to your arm or jaw?");
        } else if (lowerSymptoms.contains("fever") && lowerSymptoms.contains("headache")
                && lowerSymptoms.contains("body pain")) {
            severity = "Moderate Risk";
            conditions.add("Viral Fever");
            conditions.add("Flu (Influenza)");
            conditions.add("Dengue / Malaria (if endemic)");
            precautions.add("Drink plenty of fluids.");
            precautions.add("Get enough rest.");
            precautions.add("Monitor body temperature closely.");
            medicines.add("Paracetamol / Acetaminophen");
            medicines.add("Electrolyte Replenishment (ORS)");
            followUpQuestions.add("How long have you had the fever?");
            followUpQuestions.add("Is your temperature above 102°F (38.9°C)?");
        } else if (lowerSymptoms.contains("stomach")
                && (lowerSymptoms.contains("pain") || lowerSymptoms.contains("vomiting"))) {
            severity = "Moderate Risk";
            conditions.add("Food Poisoning");
            conditions.add("Gastroenteritis");
            conditions.add("Acid Reflux / GERD (if burning sensation)");
            precautions.add("Stay hydrated with small sips of water.");
            precautions.add("Avoid solid food for a few hours.");
            precautions.add("Avoid spicy or fatty foods.");
            medicines.add("Antacids");
            medicines.add("Oral Rehydration Solution (ORS)");
            recommendedDoctor = "Gastroenterologist";
            followUpQuestions.add("How many times have you vomited?");
            followUpQuestions.add("Do you have loose motions as well?");
        } else if (lowerSymptoms.contains("throat") && lowerSymptoms.contains("cough")) {
            severity = "Low Risk";
            conditions.add("Common Cold");
            conditions.add("Pharyngitis / Strep Throat");
            precautions.add("Gargle with warm salt water.");
            precautions.add("Drink warm fluids like tea with honey.");
            medicines.add("Throat Lozenges");
            medicines.add("Cough Syrup (if dry cough)");
            recommendedDoctor = "ENT Specialist / General Physician";
            followUpQuestions.add("Do you also have a fever?");
            followUpQuestions.add("Is the cough producing green or yellow phlegm?");
        } else {
            // Default generic response
            conditions.add("Indeterminate Condition");
            precautions.add("Please consult a doctor for a proper diagnosis.");
            precautions.add("Rest and monitor your symptoms.");
            medicines.add("None without prescription");
            followUpQuestions.add("Are there any other symptoms you haven't mentioned?");
        }

        response.put("conditions", conditions);
        response.put("precautions", precautions);
        response.put("medicines", medicines);
        response.put("severity", severity);
        response.put("recommendedSpecialization", recommendedDoctor);
        response.put("isEmergency", isEmergency);
        response.put("followUpQuestions", followUpQuestions);

        return response;
    }
}
