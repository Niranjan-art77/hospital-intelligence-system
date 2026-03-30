package com.example.demo.controller;

import com.example.demo.entity.MedicalEvent;
import com.example.demo.service.MedicalEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-events")
@CrossOrigin(originPatterns = "*")
public class MedicalEventController {

    @Autowired
    private MedicalEventService medicalEventService;

    @GetMapping("/patient/{patientId}")
    public List<MedicalEvent> getEventsByPatientId(@PathVariable Long patientId) {
        return medicalEventService.getEventsByPatientId(patientId);
    }

    @PostMapping("/patient/{patientId}")
    public MedicalEvent createEvent(@PathVariable Long patientId, @RequestBody MedicalEvent event) {
        return medicalEventService.createEvent(patientId, event.getEventType(), event.getDescription(),
                event.getEventDate());
    }
}
