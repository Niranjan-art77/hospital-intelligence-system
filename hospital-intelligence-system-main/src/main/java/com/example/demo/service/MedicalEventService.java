package com.example.demo.service;

import com.example.demo.entity.MedicalEvent;
import com.example.demo.entity.Patient;
import com.example.demo.repository.MedicalEventRepository;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MedicalEventService {

    @Autowired
    private MedicalEventRepository medicalEventRepository;

    @Autowired
    private PatientRepository patientRepository;

    public List<MedicalEvent> getEventsByPatientId(Long patientId) {
        return medicalEventRepository.findByPatientIdOrderByEventDateDesc(patientId);
    }

    public MedicalEvent createEvent(Long patientId, String eventType, String description, LocalDateTime eventDate) {
        Patient patient = patientRepository.findById(patientId).orElse(null);
        if (patient != null) {
            MedicalEvent event = new MedicalEvent();
            event.setPatient(patient);
            event.setEventType(eventType);
            event.setDescription(description);
            event.setEventDate(eventDate != null ? eventDate : LocalDateTime.now());
            return medicalEventRepository.save(event);
        }
        return null;
    }
}
