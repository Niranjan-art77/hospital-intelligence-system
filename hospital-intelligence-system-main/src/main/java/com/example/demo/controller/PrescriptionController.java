package com.example.demo.controller;

import com.example.demo.entity.Appointment;
import com.example.demo.entity.Doctor;
import com.example.demo.entity.Patient;
import com.example.demo.entity.Prescription;
import com.example.demo.entity.PrescriptionItem;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(originPatterns = "*")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createPrescription(@RequestBody Map<String, Object> payload) {
        Long patientId = Long.valueOf(payload.get("patientId").toString());
        Long doctorId = Long.valueOf(payload.get("doctorId").toString());
        Long appointmentId = Long.valueOf(payload.get("appointmentId").toString());

        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        Optional<Appointment> apptOpt = appointmentRepository.findById(appointmentId);

        if (patientOpt.isEmpty() || doctorOpt.isEmpty() || apptOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid IDs provided");
        }

        Prescription prescription = new Prescription();
        prescription.setPatient(patientOpt.get());
        prescription.setDoctor(doctorOpt.get());
        prescription.setAppointment(apptOpt.get());
        prescription.setCreatedAt(LocalDateTime.now());
        prescription.setStatus("PENDING");

        List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
        List<PrescriptionItem> prescriptionItems = itemsList.stream().map(itemData -> {
            PrescriptionItem item = new PrescriptionItem();
            item.setPrescription(prescription);
            item.setMedicineName(itemData.get("medicineName").toString());
            item.setDosage(itemData.get("dosage").toString());
            item.setDays(Integer.valueOf(itemData.get("days").toString()));

            if (itemData.containsKey("morning"))
                item.setMorning(Boolean.valueOf(itemData.get("morning").toString()));
            if (itemData.containsKey("afternoon"))
                item.setAfternoon(Boolean.valueOf(itemData.get("afternoon").toString()));
            if (itemData.containsKey("night"))
                item.setNight(Boolean.valueOf(itemData.get("night").toString()));
            item.setDays(Integer.valueOf(itemData.get("days").toString()));
            if (itemData.containsKey("notes") && itemData.get("notes") != null) {
                item.setNotes(itemData.get("notes").toString());
            }
            return item;
        }).toList();

        prescription.setItems(prescriptionItems);
        prescriptionRepository.save(prescription);

        return ResponseEntity.ok(prescription);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPatientPrescriptions(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionRepository.findByPatientId(patientId));
    }

    @GetMapping("/recent/{patientId}")
    public ResponseEntity<List<Prescription>> getRecentPrescriptions(@PathVariable Long patientId) {
        // Just return all for now or sort by date. findByPatientId is enough for mock.
        List<Prescription> recent = prescriptionRepository.findByPatientId(patientId)
                .stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .limit(5)
                .toList();
        return ResponseEntity.ok(recent);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Prescription>> getPendingPrescriptions() {
        return ResponseEntity.ok(prescriptionRepository.findByStatus("PENDING"));
    }
}
