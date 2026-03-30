package com.example.demo.controller;

import com.example.demo.entity.Bill;
import com.example.demo.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(originPatterns = "*")
public class BillingController {

    @Autowired
    private BillRepository billRepository;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Bill>> getPatientBills(@PathVariable Long patientId) {
        return ResponseEntity.ok(billRepository.findByPatientId(patientId));
    }

    @PostMapping("/pay/{billId}")
    public ResponseEntity<?> payBill(@PathVariable Long billId, @RequestBody java.util.Map<String, String> payload) {
        Optional<Bill> billOpt = billRepository.findById(billId);
        if (billOpt.isEmpty())
            return ResponseEntity.badRequest().body("Bill not found");

        Bill bill = billOpt.get();
        bill.setStatus("PAID");
        billRepository.save(bill);

        return ResponseEntity.ok(bill);
    }
}
