package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entity.Prescription;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientId(Long patientId);

    List<Prescription> findByStatus(String status);
}
