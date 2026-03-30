package com.example.demo.controller;

import com.example.demo.entity.Appointment;
import com.example.demo.entity.Doctor;
import com.example.demo.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(originPatterns = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    public List<Appointment> getAppointments() {
        return appointmentService.getAllAppointments();
    }

    @PostMapping("/book")
    public Appointment bookAppointment(@RequestBody AppointmentRequest req) {
        return appointmentService.bookAppointment(req.getPatientId(), req.getDoctorId(), req.getAppointmentTime());
    }

    @GetMapping("/patient/{id}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long id) {
        // Find by patient id manually or rely on service if present.
        // AppointmentService already has getAllAppointments(), we'll filter here for
        // simplicity:
        List<Appointment> list = appointmentService.getAllAppointments()
                .stream()
                .filter(a -> a.getPatient() != null && a.getPatient().getId().equals(id))
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/recommendations")
    public List<Doctor> recommendDoctors(@RequestParam(required = false) String symptoms) {
        return appointmentService.recommendDoctors(symptoms);
    }

    @GetMapping("/wait-time/{doctorId}")
    public int getEstimatedWaitTime(@PathVariable Long doctorId) {
        return appointmentService.getEstimatedWaitTime(doctorId);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String diagnosisNotes = body.get("diagnosisNotes");
        Appointment updated = appointmentService.updateStatus(id, status, diagnosisNotes);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Appointment> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        LocalDateTime newTime = LocalDateTime.parse(body.get("appointmentTime"));
        Appointment updated = appointmentService.rescheduleAppointment(id, newTime);
        return ResponseEntity.ok(updated);
    }
}

class AppointmentRequest {
    private Long patientId;
    private Long doctorId;
    private LocalDateTime appointmentTime;

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalDateTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }
}
