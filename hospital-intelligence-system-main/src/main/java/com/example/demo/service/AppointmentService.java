package com.example.demo.service;

import com.example.demo.entity.Appointment;
import com.example.demo.entity.Doctor;
import com.example.demo.entity.Patient;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private BillRepository billRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment bookAppointment(Long patientId, Long doctorId, LocalDateTime time) {
        List<Appointment> conflicts = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                doctorId, time.minusMinutes(29), time.plusMinutes(29));

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Doctor already has an appointment at this time.");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentTime(time);
        appointment.setStatus("BOOKED");

        return appointmentRepository.save(appointment);
    }

    public List<Doctor> recommendDoctors(String symptoms) {
        List<Doctor> allDoctors = doctorRepository.findAll();
        if (symptoms == null || symptoms.isEmpty()) {
            return allDoctors;
        }

        String lowerSymptoms = symptoms.toLowerCase();
        return allDoctors.stream()
                .filter(d -> {
                    String spec = d.getSpecialization().toLowerCase();
                    if (lowerSymptoms.contains("heart")
                            || lowerSymptoms.contains("chest") && spec.contains("cardiolog"))
                        return true;
                    if (lowerSymptoms.contains("brain")
                            || lowerSymptoms.contains("headache") && spec.contains("neurolog"))
                        return true;
                    if (lowerSymptoms.contains("bone")
                            || lowerSymptoms.contains("fracture") && spec.contains("orthoped"))
                        return true;
                    if (lowerSymptoms.contains("skin") || lowerSymptoms.contains("rash") && spec.contains("dermatolog"))
                        return true;
                    if (lowerSymptoms.contains("child") || lowerSymptoms.contains("baby") && spec.contains("pediatric"))
                        return true;
                    if (lowerSymptoms.contains("tooth") || lowerSymptoms.contains("teeth") && spec.contains("dentist"))
                        return true;
                    // Generic fallback: if specialization is mentioned in symptoms
                    return lowerSymptoms.contains(spec);
                })
                .toList();
    }

    public int getEstimatedWaitTime(Long doctorId) {
        List<Appointment> todayAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getDoctor() != null && a.getDoctor().getId().equals(doctorId))
                .filter(a -> a.getAppointmentTime().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
                .filter(a -> a.getStatus().equals("BOOKED"))
                .toList();
        return todayAppointments.size() * 15;
    }

    public Appointment updateStatus(Long id, String status, String diagnosisNotes) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + id));
        if (status != null && !status.isEmpty()) {
            appointment.setStatus(status);
        }
        if (diagnosisNotes != null && !diagnosisNotes.isEmpty()) {
            appointment.setDiagnosisNotes(diagnosisNotes);
        }

        appointment = appointmentRepository.save(appointment);

        // Auto-generate Bill
        if ("COMPLETED".equalsIgnoreCase(appointment.getStatus())
                && billRepository.findByAppointmentId(appointment.getId()).isEmpty()) {
            com.example.demo.entity.Bill bill = new com.example.demo.entity.Bill();
            bill.setPatient(appointment.getPatient());
            bill.setDoctor(appointment.getDoctor());
            bill.setAppointment(appointment);
            bill.setConsultationFee(500.0);
            bill.setPlatformFee(50.0);
            bill.setTotalAmount(550.0);
            bill.setStatus("PENDING");
            bill.setCreatedAt(LocalDateTime.now());
            billRepository.save(bill);
        }

        return appointment;
    }

    public Appointment rescheduleAppointment(Long id, LocalDateTime newTime) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + id));
        List<Appointment> conflicts = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                appointment.getDoctor().getId(), newTime.minusMinutes(29), newTime.plusMinutes(29));

        if (!conflicts.isEmpty() && conflicts.stream().noneMatch(a -> a.getId().equals(id))) {
            throw new RuntimeException("Doctor already has an appointment at this time.");
        }
        appointment.setAppointmentTime(newTime);
        return appointmentRepository.save(appointment);
    }
}
