package com.example.demo.repository;

import com.example.demo.entity.ProcurementOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcurementOrderRepository extends JpaRepository<ProcurementOrder, Long> {
}
