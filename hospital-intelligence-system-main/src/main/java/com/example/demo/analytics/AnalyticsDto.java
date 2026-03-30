package com.example.demo.analytics;

import java.util.List;
import java.util.Map;

public class AnalyticsDto {
    private long totalPatients;
    private long highRiskCount;
    private double averageBmi;
    private double averageSugar;

    private long totalBeds;
    private long availableBeds;

    private List<ChartDataDto> diseaseDistribution;
    private List<DoctorPerformanceDto> doctorPerformance;
    private List<ChartDataDto> monthlyTrends;

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getHighRiskCount() {
        return highRiskCount;
    }

    public void setHighRiskCount(long highRiskCount) {
        this.highRiskCount = highRiskCount;
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

    public long getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(long totalBeds) {
        this.totalBeds = totalBeds;
    }

    public long getAvailableBeds() {
        return availableBeds;
    }

    public void setAvailableBeds(long availableBeds) {
        this.availableBeds = availableBeds;
    }

    public List<ChartDataDto> getDiseaseDistribution() {
        return diseaseDistribution;
    }

    public void setDiseaseDistribution(List<ChartDataDto> diseaseDistribution) {
        this.diseaseDistribution = diseaseDistribution;
    }

    public List<DoctorPerformanceDto> getDoctorPerformance() {
        return doctorPerformance;
    }

    public void setDoctorPerformance(List<DoctorPerformanceDto> doctorPerformance) {
        this.doctorPerformance = doctorPerformance;
    }

    public List<ChartDataDto> getMonthlyTrends() {
        return monthlyTrends;
    }

    public void setMonthlyTrends(List<ChartDataDto> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }
}
