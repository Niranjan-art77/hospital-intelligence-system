package com.example.demo.repository;

import com.example.demo.entity.Vitals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VitalsRepository extends JpaRepository<Vitals, Long> {
    List<Vitals> findByPatientIdOrderByTimestampDesc(Long patientId);
    List<Vitals> findByPatientId(Long patientId);
}
