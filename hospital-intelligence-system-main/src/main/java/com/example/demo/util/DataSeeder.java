package com.example.demo.util;

import com.example.demo.entity.Doctor;
import com.example.demo.entity.Patient;
import com.example.demo.entity.Vitals;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.*;
import com.example.demo.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private PatientService patientService;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PharmacyRepository pharmacyRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private VitalsRepository vitalsRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // ── Seed admin ──────────────────────────────────────────────────────────
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User admin = new User();
            admin.setFullName("Admin User");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Seeded admin user: admin@gmail.com");
        }

        // ── Seed a demo patient login ─────────────────────────────────────────
        if (!userRepository.existsByEmail("patient@gmail.com")) {
            User patientUser = new User();
            patientUser.setFullName("John Doe");
            patientUser.setEmail("patient@gmail.com");
            patientUser.setPassword(passwordEncoder.encode("patient123"));
            patientUser.setRole(Role.PATIENT);
            userRepository.save(patientUser);
            System.out.println("Seeded demo patient: patient@gmail.com / patient123");
        }

        // ── Seed a demo doctor login ──────────────────────────────────────────
        if (!userRepository.existsByEmail("doctor@gmail.com")) {
            User doctorUser = new User();
            doctorUser.setFullName("Dr. Sarah Jenkins");
            doctorUser.setEmail("doctor@gmail.com");
            doctorUser.setPassword(passwordEncoder.encode("doctor123"));
            doctorUser.setRole(Role.DOCTOR);
            userRepository.save(doctorUser);
            System.out.println("Seeded demo doctor: doctor@gmail.com / doctor123");
        }

        // ── Seed doctors ─────────────────────────────────────────────────────
        if (doctorRepository.count() < 8) {
            Object[][] doctors = {
                {"Dr. Sarah Jenkins",   "Cardiologist",       12, "Renowned cardiologist with 12+ years treating heart conditions."},
                {"Dr. Mark O'Connell",  "Endocrinologist",     8, "Specialist in metabolic & diabetes management."},
                {"Dr. Priya Nair",      "Neurologist",         10, "Expert in neurological disorders and stroke rehabilitation."},
                {"Dr. Alan Zhang",      "Orthopedic Surgeon",  15, "Top orthopedic surgeon, specializes in joint replacement."},
                {"Dr. Susan Lee",       "Psychiatrist",         7, "Provides holistic mental health care and therapy."},
                {"Dr. James Okoye",     "Pulmonologist",       11, "Specialist in respiratory diseases and critical care."},
                {"Dr. Amina Hussain",   "Dermatologist",        5, "Expert in skin disorders, cosmetic and medical dermatology."},
                {"Dr. Raj Patel",       "General Physician",    9, "Family medicine specialist with a patient-centered approach."}
            };
            for (Object[] d : doctors) {
                Doctor doc = new Doctor();
                doc.setName((String) d[0]);
                doc.setSpecialization((String) d[1]);
                doc.setExperience((int) d[2]);
                doc.setBio((String) d[3]);
                doctorRepository.save(doc);
            }
            System.out.println("Seeded 8 doctors");
        }

        // ── Seed 30 patients ────────────────────────────────────────────────
        if (patientRepository.count() < 30) {
            Object[][] patientsData = {
                {"John Doe",           45, "O+",  "None",                            90.0, 130.0,  82.0, 1.80},
                {"Alice Smith",        55, "A-",  "Hypertension, Type 2 Diabetes",  150.0, 180.0,  88.0, 1.60},
                {"Robert Johnson",     62, "B+",  "Chronic Heart Disease",           160.0, 115.0,  95.0, 1.75},
                {"Maria Garcia",       38, "AB+", "Asthma",                         110.0,  95.0,  65.0, 1.63},
                {"David Wilson",       71, "O-",  "Hypertension, Arthritis",        155.0, 130.0,  80.0, 1.70},
                {"Linda Brown",        48, "A+",  "Hypothyroidism",                 120.0, 100.0,  72.0, 1.65},
                {"James Martinez",     33, "B-",  "None",                            95.0,  88.0,  78.0, 1.82},
                {"Patricia Davis",     59, "O+",  "Type 2 Diabetes",                130.0, 195.0,  90.0, 1.62},
                {"Charles Anderson",   65, "AB-", "COPD, Hypertension",             165.0, 125.0,  85.0, 1.68},
                {"Barbara Thomas",     42, "B+",  "Lupus",                          115.0, 105.0,  60.0, 1.60},
                {"Michael Jackson",    50, "A+",  "Hypertension",                   145.0, 110.0,  88.0, 1.78},
                {"Jessica White",      29, "O+",  "Anxiety Disorder",               105.0,  90.0,  58.0, 1.68},
                {"William Harris",     77, "A-",  "Alzheimer's, Hypertension",      150.0, 135.0,  70.0, 1.65},
                {"Susan Martin",       58, "B+",  "Osteoporosis, Type 2 Diabetes",  135.0, 175.0,  76.0, 1.58},
                {"Richard Garcia",     43, "O-",  "None",                           115.0,  95.0,  82.0, 1.80},
                {"Nancy Thompson",     66, "AB+", "Parkinson's Disease",            140.0, 120.0,  65.0, 1.62},
                {"Joseph Robinson",    35, "A+",  "Asthma",                         108.0,  92.0,  74.0, 1.75},
                {"Karen Lewis",        52, "O+",  "Fibromyalgia, Hypothyroidism",   125.0, 115.0,  78.0, 1.65},
                {"Thomas Lee",         68, "B-",  "Chronic Kidney Disease",         158.0, 140.0,  80.0, 1.72},
                {"Lisa Walker",        39, "A+",  "Migraine",                       112.0,  98.0,  63.0, 1.70},
                {"Daniel Hall",        73, "O+",  "Heart Failure, Atrial Flutter",  170.0, 130.0,  90.0, 1.68},
                {"Betty Allen",        47, "AB-", "Rheumatoid Arthritis",           118.0, 108.0,  69.0, 1.60},
                {"Matthew Young",      28, "B+",  "None",                            98.0,  85.0,  70.0, 1.77},
                {"Dorothy Hernandez",  60, "O-",  "Cervical Spondylosis",           130.0, 118.0,  74.0, 1.60},
                {"Anthony King",       55, "A+",  "Sleep Apnea, Obesity",           142.0, 122.0, 110.0, 1.72},
                {"Sandra Wright",      44, "B-",  "Celiac Disease",                 118.0, 100.0,  60.0, 1.63},
                {"Andrew Scott",       70, "O+",  "Prostate Cancer",                148.0, 125.0,  75.0, 1.70},
                {"Cynthia Green",      36, "A-",  "None",                           102.0,  90.0,  62.0, 1.67},
                {"Joshua Adams",       53, "AB+", "Type 2 Diabetes, Obesity",       138.0, 185.0,  98.0, 1.74},
                {"Ashley Baker",       31, "O+",  "Endometriosis",                  108.0,  92.0,  58.0, 1.64}
            };

            for (Object[] p : patientsData) {
                String name = (String) p[0];
                boolean alreadyExists = patientRepository.findAll().stream()
                        .anyMatch(pt -> pt.getName().equals(name));
                if (alreadyExists) continue;

                Patient patient = new Patient();
                patient.setName(name);
                patient.setAge((int) p[1]);
                patient.setBloodGroup((String) p[2]);
                patient.setChronicConditions((String) p[3]);
                Patient saved = patientService.createPatient(patient);

                Vitals vitals = new Vitals();
                vitals.setBloodPressure(String.format("%.0f/80", (Double) p[4]));
                vitals.setTemperature(98.6);
                patientService.addVitals(saved.getId(), vitals);
            }
            System.out.println("Seeded 30 patients with risk scores");
        }

        // ── Seed pharmacy ────────────────────────────────────────────────────
        if (pharmacyRepository.count() == 0) {
            Object[][] medicines = {
                {"Amoxicillin 500mg",   150, 12.50, "Antibiotic for bacterial infections.",         "IN STOCK"},
                {"Lisinopril 10mg",       0,  8.00, "Treats high blood pressure and heart failure.","OUT OF STOCK"},
                {"Metformin 850mg",      40,  5.50, "First-line treatment for Type 2 Diabetes.",    "LOW STOCK"},
                {"Atorvastatin 20mg",   200,  9.25, "Lowers cholesterol levels.",                   "IN STOCK"},
                {"Amlodipine 5mg",       30, 11.00, "Treats hypertension and angina.",              "LOW STOCK"},
                {"Omeprazole 20mg",     180,  6.75, "Reduces stomach acid.",                        "IN STOCK"},
                {"Paracetamol 500mg",   500,  2.00, "Analgesic and antipyretic.",                   "IN STOCK"},
                {"Azithromycin 250mg",   20, 18.00, "Broad-spectrum antibiotic.",                   "LOW STOCK"},
                {"Ibuprofen 400mg",     300,  3.50, "NSAID for pain and inflammation.",             "IN STOCK"},
                {"Cetirizine 10mg",     250,  4.00, "Antihistamine for allergies.",                 "IN STOCK"}
            };
            for (Object[] m : medicines) {
                com.example.demo.entity.Pharmacy ph = new com.example.demo.entity.Pharmacy();
                ph.setMedicineName((String) m[0]);
                ph.setStock((int) m[1]);
                ph.setPrice((double) m[2]);
                ph.setDescription((String) m[3]);
                ph.setStatus((String) m[4]);
                pharmacyRepository.save(ph);
            }
            System.out.println("Seeded 10 pharmacy items");
        }
    }
}
