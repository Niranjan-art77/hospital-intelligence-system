package com.example.demo.controller;

import com.example.demo.entity.Patient;
import com.example.demo.entity.Vitals;
import com.example.demo.service.PatientService;
import com.example.demo.service.AnalyticsService;
import com.example.demo.analytics.PatientSummaryDto;
import com.example.demo.analytics.TimelineEventDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.example.demo.entity.Appointment;
import com.example.demo.entity.Prescription;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.PrescriptionRepository;
import com.example.demo.repository.BillRepository;
import com.example.demo.repository.MedicalReportRepository;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(originPatterns = "*")
public class PatientController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    @Autowired
    private PatientService patientService;
    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public Patient getPatient(@PathVariable Long id) {
        return patientService.getPatientById(id);
    }

    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        return patientService.createPatient(patient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        Patient updated = patientService.updatePatient(id, patient);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
    }

    @GetMapping("/high-risk")
    public List<Patient> getHighRiskPatients() {
        return patientService.getHighRiskPatients();
    }

    @PostMapping("/{id}/vitals")
    public Vitals addVitals(@PathVariable Long id, @RequestBody Vitals vitals) {
        return patientService.addVitals(id, vitals);
    }

    @GetMapping("/{id}/vitals")
    public List<Vitals> getVitalsHistory(@PathVariable Long id) {
        return patientService.getVitalsByPatientId(id);
    }

    @GetMapping("/{id}/summary")
    public PatientSummaryDto getPatientSummary(@PathVariable Long id) {
        return analyticsService.getPatientSummary(id);
    }

    @GetMapping("/{id}/timeline")
    public List<TimelineEventDto> getPatientTimeline(@PathVariable Long id) {
        return analyticsService.getPatientTimeline(id);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<Map<String, Object>> getPatientHistory(@PathVariable Long id) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(id);
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(id);
        List<com.example.demo.entity.Bill> bills = billRepository.findByPatientId(id);
        List<com.example.demo.entity.MedicalReport> reports = medicalReportRepository.findByPatientId(id);

        Map<String, Object> history = new HashMap<>();
        history.put("appointments", appointments);
        history.put("prescriptions", prescriptions);
        history.put("bills", bills);
        history.put("reports", reports);

        return ResponseEntity.ok(history);
    }
}
