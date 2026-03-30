package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer age;
    private String bloodGroup;
    private String chronicConditions;
    private String allergies;
    private String insuranceProvider;
    private String photoUrl;
    private String emergencyContact;
    private String medications;
    private String lifestyleHabits;

    private Integer riskScore = 0;
    private String riskLevel = "LOW";
    private Boolean criticalAlert = false;
    private String predictedComplications = "None";
    private Double recoveryProgress = 100.0;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getChronicConditions() {
        return chronicConditions;
    }

    public void setChronicConditions(String chronicConditions) {
        this.chronicConditions = chronicConditions;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getInsuranceProvider() {
        return insuranceProvider;
    }

    public void setInsuranceProvider(String insuranceProvider) {
        this.insuranceProvider = insuranceProvider;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Boolean getCriticalAlert() {
        return criticalAlert;
    }

    public void setCriticalAlert(Boolean criticalAlert) {
        this.criticalAlert = criticalAlert;
    }

    public String getPredictedComplications() {
        return predictedComplications;
    }

    public void setPredictedComplications(String predictedComplications) {
        this.predictedComplications = predictedComplications;
    }

    public Double getRecoveryProgress() {
        return recoveryProgress;
    }

    public void setRecoveryProgress(Double recoveryProgress) {
        this.recoveryProgress = recoveryProgress;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public String getMedications() {
        return medications;
    }

    public void setMedications(String medications) {
        this.medications = medications;
    }

    public String getLifestyleHabits() {
        return lifestyleHabits;
    }

    public void setLifestyleHabits(String lifestyleHabits) {
        this.lifestyleHabits = lifestyleHabits;
    }
}
