package com.example.demo.service;

import com.example.demo.entity.Insight;
import com.example.demo.entity.Patient;
import com.example.demo.entity.Vitals;
import com.example.demo.repository.InsightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InsightService {

    @Autowired
    private InsightRepository insightRepository;

    public void generateInsights(Patient patient, Vitals vitals) {
        if (vitals.getBloodPressure() != null && vitals.getBloodPressure().contains("/")) {
            try {
                int sys = Integer.parseInt(vitals.getBloodPressure().split("/")[0]);
                if (sys > 140) {
                    createInsight(patient,
                            "High blood pressure detected (" + vitals.getBloodPressure() + "). Recommend immediate review.",
                            "WARNING");
                } else if (sys < 90) {
                    createInsight(patient,
                            "Low blood pressure detected (" + vitals.getBloodPressure() + "). Check for signs of hypotension.",
                            "WARNING");
                }
            } catch (Exception e) {}
        }
        if (patient.getRiskScore() != null && patient.getRiskScore() >= 70) {
            createInsight(patient, "Patient risk score is critically high. Escalating priority.", "CRITICAL");
        }
    }

    private void createInsight(Patient patient, String message, String type) {
        Insight insight = new Insight();
        insight.setPatient(patient);
        insight.setMessage(message);
        insight.setType(type);
        insight.setTimestamp(LocalDateTime.now());
        insightRepository.save(insight);
    }

    public List<Insight> getInsightsForPatient(Long patientId) {
        return insightRepository.findByPatientIdOrderByTimestampDesc(patientId);
    }

    public List<Insight> getAllInsights() {
        return insightRepository.findAllByOrderByTimestampDesc();
    }
}
