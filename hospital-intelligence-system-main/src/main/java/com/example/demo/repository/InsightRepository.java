package com.example.demo.repository;

import com.example.demo.entity.Insight;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InsightRepository extends JpaRepository<Insight, Long> {
    List<Insight> findByPatientIdOrderByTimestampDesc(Long patientId);

    List<Insight> findAllByOrderByTimestampDesc();
}
