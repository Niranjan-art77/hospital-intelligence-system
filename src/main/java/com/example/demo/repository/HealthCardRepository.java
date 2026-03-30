package com.example.demo.repository;

import com.example.demo.entity.HealthCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HealthCardRepository extends JpaRepository<HealthCard, Long> {
    Optional<HealthCard> findByPatientId(Long patientId);
}
