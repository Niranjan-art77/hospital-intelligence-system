package com.example.demo.analytics;

public class DoctorPerformanceDto {
    private String doctorName;
    private int patientsTreated;
    private double avgConsultationTime;
    private double rating;

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public int getPatientsTreated() {
        return patientsTreated;
    }

    public void setPatientsTreated(int patientsTreated) {
        this.patientsTreated = patientsTreated;
    }

    public double getAvgConsultationTime() {
        return avgConsultationTime;
    }

    public void setAvgConsultationTime(double avgConsultationTime) {
        this.avgConsultationTime = avgConsultationTime;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }
}
