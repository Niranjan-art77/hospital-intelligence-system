package com.example.demo.repository;

import com.example.demo.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByPatientId(Long patientId);

    Optional<Bill> findByAppointmentId(Long appointmentId);
}
