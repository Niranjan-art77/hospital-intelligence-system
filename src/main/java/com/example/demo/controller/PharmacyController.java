package com.example.demo.controller;

import com.example.demo.entity.Pharmacy;
import com.example.demo.service.PharmacyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.example.demo.entity.Prescription;
import com.example.demo.repository.PrescriptionRepository;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/pharmacy")
@CrossOrigin(originPatterns = "*")
public class PharmacyController {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @GetMapping("/prescriptions")
    public ResponseEntity<List<Prescription>> getPendingPrescriptions() {
        return ResponseEntity.ok(prescriptionRepository.findByStatus("PENDING"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPrescription(@RequestBody java.util.Map<String, Object> payload) {
        Long prescriptionId = Long.valueOf(payload.get("prescriptionId").toString());
        // Verify stock availability logic (in a real app this would lock stock or
        // transition to APPROVED status)
        Prescription p = prescriptionRepository.findById(prescriptionId).orElse(null);
        if (p != null) {
            p.setStatus("APPROVED"); // ready for billing
            prescriptionRepository.save(p);
            return ResponseEntity
                    .ok(java.util.Map.of("success", true, "message", "Prescription verified successfully"));
        }
        return ResponseEntity.badRequest().body("Not found");
    }

    @Autowired
    private PharmacyService pharmacyService;

    @GetMapping
    public List<Pharmacy> getAllMedicines() {
        return pharmacyService.getAllMedicines();
    }

    @PostMapping
    public Pharmacy addMedicine(@RequestBody Pharmacy pharmacy) {
        return pharmacyService.addMedicine(pharmacy);
    }
}
