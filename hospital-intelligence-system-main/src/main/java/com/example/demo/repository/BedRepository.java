package com.example.demo.repository;

import com.example.demo.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BedRepository extends JpaRepository<Bed, Long> {
}
