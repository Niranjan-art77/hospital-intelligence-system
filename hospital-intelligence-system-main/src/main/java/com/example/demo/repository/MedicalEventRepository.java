package com.example.demo.repository;

import com.example.demo.entity.MedicalEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicalEventRepository extends JpaRepository<MedicalEvent, Long> {
    List<MedicalEvent> findByPatientIdOrderByEventDateDesc(Long patientId);
}
