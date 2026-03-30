package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Vitals {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;
    private Integer heartRate;
    private String bloodPressure;
    private Double temperature;
    private Integer oxygenLevel;
    private Double bmi;
    private Double glucose;
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "patient_id_ref", insertable = false, updatable = false)
    private Patient patient;
}
