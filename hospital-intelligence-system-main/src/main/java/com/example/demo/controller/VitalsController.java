package com.example.demo.controller;

import com.example.demo.entity.Vitals;
import com.example.demo.repository.VitalsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/vitals")
@CrossOrigin(originPatterns = "*")
public class VitalsController {

    @Autowired
    private VitalsRepository vitalsRepository;

    @GetMapping("/patient/{patientId}")
    public List<Vitals> getPatientVitals(@PathVariable Long patientId) {
        return vitalsRepository.findByPatientIdOrderByTimestampDesc(patientId);
    }

    @PostMapping("/log/{patientId}")
    public ResponseEntity<Vitals> logVitals(@PathVariable Long patientId, @RequestBody Vitals vitals) {
        vitals.setPatientId(patientId);
        vitals.setTimestamp(LocalDateTime.now());
        Vitals saved = vitalsRepository.save(vitals);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/latest/{patientId}")
    public ResponseEntity<Vitals> getLatestVitals(@PathVariable Long patientId) {
        List<Vitals> list = vitalsRepository.findByPatientIdOrderByTimestampDesc(patientId);
        if (list.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(list.get(0));
    }
}
