package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Insight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private String type; // e.g., "WARNING", "INFO", "CRITICAL"
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    public Insight() {
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
}
