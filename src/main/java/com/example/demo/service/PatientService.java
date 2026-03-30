package com.example.demo.service;

import com.example.demo.entity.Patient;
import com.example.demo.entity.Vitals;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.VitalsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private VitalsRepository vitalsRepository;

    @Autowired
    private InsightService insightService;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id).orElse(null);
    }

    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }

    public Patient updatePatient(Long id, Patient updatedData) {
        Patient existing = getPatientById(id);
        if (existing != null) {
            if (updatedData.getBloodGroup() != null) existing.setBloodGroup(updatedData.getBloodGroup());
            if (updatedData.getAllergies() != null) existing.setAllergies(updatedData.getAllergies());
            if (updatedData.getChronicConditions() != null) existing.setChronicConditions(updatedData.getChronicConditions());
            if (updatedData.getInsuranceProvider() != null) existing.setInsuranceProvider(updatedData.getInsuranceProvider());
            if (updatedData.getPhotoUrl() != null) existing.setPhotoUrl(updatedData.getPhotoUrl());
            if (updatedData.getEmergencyContact() != null) existing.setEmergencyContact(updatedData.getEmergencyContact());
            if (updatedData.getMedications() != null) existing.setMedications(updatedData.getMedications());
            if (updatedData.getLifestyleHabits() != null) existing.setLifestyleHabits(updatedData.getLifestyleHabits());
            if (updatedData.getName() != null) existing.setName(updatedData.getName());
            if (updatedData.getAge() != null) existing.setAge(updatedData.getAge());

            return patientRepository.save(existing);
        }
        return null;
    }


    public List<Patient> getHighRiskPatients() {
        return patientRepository.findByRiskScoreGreaterThan(60);
    }

    public List<Vitals> getVitalsByPatientId(Long patientId) {
        return vitalsRepository.findByPatientId(patientId);
    }

    public Vitals addVitals(Long patientId, Vitals vitals) {
        Patient patient = getPatientById(patientId);
        if (patient != null) {
            vitals.setPatient(patient);

            Vitals savedVitals = vitalsRepository.save(vitals);
            recalculatePatientRisk(patient);
            insightService.generateInsights(patient, savedVitals);
            return savedVitals;
        }
        return null;
    }

    private void recalculatePatientRisk(Patient patient) {
        List<Vitals> vitalsRecords = vitalsRepository.findByPatientId(patient.getId());
        if (vitalsRecords.isEmpty())
            return;

        Vitals latest = vitalsRecords.get(vitalsRecords.size() - 1);
        int score = 0;
        StringBuilder complications = new StringBuilder();

        if (latest.getBloodPressure() != null && !latest.getBloodPressure().isEmpty()) {
            try {
                int systolic = Integer.parseInt(latest.getBloodPressure().split("/")[0]);
                if (systolic > 140) {
                    score += 30;
                    complications.append("Hypertensive Crisis risk. ");
                }
            } catch (Exception e) {}
        }
        if (patient.getAge() != null && patient.getAge() > 50) {
            score += 10;
        }

        patient.setRiskScore(score);

        if (score <= 30) {
            patient.setRiskLevel("LOW");
            if (complications.length() == 0)
                complications.append("None");
        } else if (score <= 60) {
            patient.setRiskLevel("MEDIUM");
        } else {
            patient.setRiskLevel("HIGH");
        }

        patient.setPredictedComplications(complications.toString().trim());
        patient.setCriticalAlert(score > 70);
        patientRepository.save(patient);
    }
}
