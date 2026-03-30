package com.example.demo.controller;

import com.example.demo.entity.Medicine;
import com.example.demo.entity.Payment;
import com.example.demo.entity.Prescription;
import com.example.demo.entity.PrescriptionItem;
import com.example.demo.repository.MedicineRepository;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(originPatterns = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> payload) {
        Long prescriptionId = Long.valueOf(payload.get("prescriptionId").toString());
        Double amount = Double.valueOf(payload.get("amount").toString());
        String method = payload.get("paymentMethod").toString();

        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(prescriptionId);
        if (prescriptionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Prescription not found"));
        }

        Prescription prescription = prescriptionOpt.get();

        // Stock deduction upon payment success
        for (PrescriptionItem item : prescription.getItems()) {
            medicineRepository.findByNameIgnoreCase(item.getMedicineName()).ifPresent(med -> {
                int required = item.getDays(); // Let's assume 1 per day to simplify, or maybe logic depends. For
                                               // simplicity stock decreases by `days`
                if (med.getStock() >= required) {
                    med.setStock(med.getStock() - required);
                    medicineRepository.save(med);
                }
            });
        }

        // Update Prescription Status
        prescription.setStatus("COMPLETED");
        prescriptionRepository.save(prescription);

        Payment payment = new Payment();
        payment.setPrescription(prescription);
        payment.setAmount(amount);
        payment.setPaymentMethod(method);
        payment.setPaymentStatus("COMPLETED");
        payment.setCreatedAt(LocalDateTime.now());

        paymentRepository.save(payment);

        return ResponseEntity.ok(Map.of("success", true, "payment", payment));
    }

    @GetMapping("/{prescriptionId}")
    public ResponseEntity<?> getPaymentDetails(@PathVariable Long prescriptionId) {
        Optional<Payment> payment = paymentRepository.findByPrescriptionId(prescriptionId);
        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        }
        return ResponseEntity.notFound().build();
    }
}
