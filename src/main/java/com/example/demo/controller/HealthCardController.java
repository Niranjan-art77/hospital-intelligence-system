package com.example.demo.controller;

import com.example.demo.entity.HealthCard;
import com.example.demo.entity.Patient;
import com.example.demo.repository.HealthCardRepository;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/health-card")
@CrossOrigin(originPatterns = "*")
public class HealthCardController {

    @Autowired
    private HealthCardRepository healthCardRepository;

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/patient/{id}")
    public ResponseEntity<HealthCard> getHealthCard(@PathVariable Long id) {
        Optional<HealthCard> card = healthCardRepository.findByPatientId(id);
        if (card.isPresent()) {
            return ResponseEntity.ok(card.get());
        }

        // Auto-create blank card if checking for the first time
        Optional<Patient> patient = patientRepository.findById(id);
        if (patient.isPresent()) {
            HealthCard newCard = new HealthCard();
            newCard.setPatient(patient.get());
            newCard.setBloodGroup("Unknown");
            newCard.setAllergies("None recorded");
            newCard.setChronicDiseases("None recorded");
            newCard.setInsurance("Not provided");
            healthCardRepository.save(newCard);
            return ResponseEntity.ok(newCard);
        }

        return ResponseEntity.notFound().build();
    }
}
