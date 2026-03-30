package com.example.demo.service;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.example.demo.repository.PatientRepository patientRepository;

    public Map<String, Object> register(Map<String, String> payload) {
        String fullName = payload.get("fullName");
        String email = payload.get("email");
        String password = payload.get("password");
        String roleStr = payload.get("role");

        System.out.println("Processing registration for: " + email);
        Map<String, Object> response = new HashMap<>();

        if (userRepository.existsByEmail(email)) {
            System.out.println("Email already exists: " + email);
            response.put("success", false);
            response.put("message", "Email is already taken!");
            return response;
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        // Normalize role string from frontend
        String normalizedRole = roleStr == null ? "PATIENT" : roleStr.toUpperCase().trim();
        if (normalizedRole.equals("ADMINISTRATOR"))
            normalizedRole = "ADMIN";
        try {
            user.setRole(Role.valueOf(normalizedRole));
        } catch (IllegalArgumentException e) {
            user.setRole(Role.PATIENT);
        }

        User savedUser = userRepository.save(user);

        if (user.getRole() == Role.PATIENT) {
            com.example.demo.entity.Patient patient = new com.example.demo.entity.Patient();
            patient.setName(user.getFullName());
            patient.setBloodGroup(payload.get("bloodGroup"));
            patient.setAllergies(payload.get("allergies"));
            patient.setChronicConditions(payload.get("chronicConditions"));
            patient.setInsuranceProvider(payload.get("insuranceProvider"));
            // id is likely shared or patient has its own id, but here we just create it
            patientRepository.save(patient);
        }

        System.out.println("User saved successfully: " + email);

        response.put("success", true);
        response.put("message", "User registered successfully!");
        return response;
    }

    public Map<String, Object> login(String email, String password) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            User user = userOpt.get();
            String token = jwtUtils.generateJwtToken(user.getEmail());

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("fullName", user.getFullName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());
            userData.put("token", token);

            response.put("success", true);
            response.put("user", userData);
        } else {
            response.put("success", false);
            response.put("message", "Invalid email or password!");
        }

        return response;
    }
}
