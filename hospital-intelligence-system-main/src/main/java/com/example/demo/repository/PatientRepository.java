package com.example.demo.repository;

import com.example.demo.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByRiskScoreGreaterThan(Integer score);
}
