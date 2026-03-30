package com.example.demo.analytics;

public class PatientSummaryDto {
    private String name;
    private int age;
    private double averageBmi;
    private double averageSugar;
    private int totalVitalsCount;
    private String riskLevel;
    private String healthStatus;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public double getAverageBmi() {
        return averageBmi;
    }

    public void setAverageBmi(double averageBmi) {
        this.averageBmi = averageBmi;
    }

    public double getAverageSugar() {
        return averageSugar;
    }

    public void setAverageSugar(double averageSugar) {
        this.averageSugar = averageSugar;
    }

    public int getTotalVitalsCount() {
        return totalVitalsCount;
    }

    public void setTotalVitalsCount(int totalVitalsCount) {
        this.totalVitalsCount = totalVitalsCount;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }
}
