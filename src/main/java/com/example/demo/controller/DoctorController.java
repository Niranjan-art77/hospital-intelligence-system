package com.example.demo.controller;

import com.example.demo.entity.Doctor;
import com.example.demo.repository.DoctorRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(originPatterns = "*")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @PostConstruct
    public void seedDoctors() {
        if (doctorRepository.count() == 0) {
            String[] names = {
                    "Dr. Sarah Jenkins", "Dr. Michael Chen", "Dr. Emily Roberts", "Dr. James Wilson",
                    "Dr. Linda Patel", "Dr. Robert Singh", "Dr. Susan Lee", "Dr. William Taylor",
                    "Dr. Barbara Anderson", "Dr. Richard Thomas", "Dr. Jessica Martinez", "Dr. Joseph White",
                    "Dr. Karen Harris", "Dr. Thomas Martin", "Dr. Nancy Thompson", "Dr. Charles Garcia",
                    "Dr. Lisa Rodriguez", "Dr. Christopher Lewis", "Dr. Betty Walker", "Dr. Daniel Hall"
            };
            String[] specializations = {
                    "Cardiologist", "Neurologist", "Pediatrician", "Oncologist",
                    "Dermatologist", "Orthopedic", "Psychiatrist", "Radiologist",
                    "Endocrinologist", "Gastroenterologist", "Ophthalmologist", "Urologist",
                    "Pulmonologist", "Rheumatologist", "General Surgeon", "ENT Specialist",
                    "Gynecologist", "Nephrologist", "Infectious Disease Specialist", "Allergist"
            };

            for (int i = 0; i < 20; i++) {
                Doctor d = new Doctor();
                d.setName(names[i]);
                d.setSpecialization(specializations[i]);
                d.setExperience(5 + (i % 20));
                d.setRating(4.0 + (Math.random() * 1.0)); // 4.0 to 5.0
                d.setAvailability("Mon - Fri, 9 AM - 5 PM");
                d.setProfileImage(
                        "https://ui-avatars.com/api/?name=" + names[i].replace(" ", "+") + "&background=random");
                d.setBio("Experienced " + specializations[i] + " committed to providing excellent patient care.");
                d.setIsOnline(i % 3 == 0);
                doctorRepository.save(d);
            }
        }
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> d = doctorRepository.findById(id);
        return d.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
