package com.example.demo.service;

import com.example.demo.entity.Patient;
import com.example.demo.entity.Vitals;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.VitalsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class LiveMonitoringService {

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private VitalsRepository vitalsRepository;

    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public SseEmitter subscribe(Long patientId) {
        SseEmitter emitter = new SseEmitter(60000L); // 60 seconds timeout
        emitters.computeIfAbsent(patientId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(patientId, emitter));
        emitter.onTimeout(() -> removeEmitter(patientId, emitter));
        emitter.onError((e) -> removeEmitter(patientId, emitter));

        return emitter;
    }

    private void removeEmitter(Long patientId, SseEmitter emitter) {
        if (emitters.containsKey(patientId)) {
            emitters.get(patientId).remove(emitter);
        }
    }

    // Run every 2 seconds to simulate live data bounds
    @Scheduled(fixedRate = 2000)
    public void generateLiveVitals() {
        if (emitters.isEmpty())
            return;

        emitters.forEach((patientId, list) -> {
            if (list.isEmpty())
                return;

            Patient patient = patientRepository.findById(patientId).orElse(null);
            if (patient == null)
                return;

            // Generate simulated baseline or variations based on latest vitals
            List<Vitals> history = vitalsRepository.findByPatientIdOrderByTimestampDesc(patientId);
            double basePulse = 80;
            double baseSys = 120;
            double baseDia = 80;
            double baseO2 = 98;
            double baseTemp = 37.0;
            double baseSugar = 100.0;

            if (!history.isEmpty()) {
                Vitals latest = history.get(0);
                if (latest.getBloodPressure() != null && latest.getBloodPressure().contains("/")) {
                    try {
                        baseSys = Double.parseDouble(latest.getBloodPressure().split("/")[0]);
                        baseDia = Double.parseDouble(latest.getBloodPressure().split("/")[1]);
                    } catch (Exception e) {}
                }
            }

            // Fluctuate
            int pulse = (int) basePulse + random.nextInt(10) - 5;
            int sys = (int) baseSys + random.nextInt(8) - 4;
            int dia = (int) baseDia + random.nextInt(6) - 3;
            int o2 = (int) (baseO2 + random.nextInt(3) - 1);
            if (o2 > 100)
                o2 = 100;
            double temp = baseTemp + (random.nextDouble() * 0.4 - 0.2);
            temp = Math.round(temp * 10.0) / 10.0;
            double sugar = baseSugar + (random.nextDouble() * 10 - 5);
            sugar = Math.round(sugar * 10.0) / 10.0;

            // Construct payload JSON
            String payload = String.format(
                    "{\"pulse\":%d, \"systolic\":%d, \"diastolic\":%d, \"spo2\":%d, \"temperature\":%.1f, \"blood_sugar\":%.1f}",
                    pulse, sys, dia, o2, temp, sugar);

            List<SseEmitter> failedEmitters = new CopyOnWriteArrayList<>();

            for (SseEmitter emitter : list) {
                try {
                    emitter.send(SseEmitter.event().name("vitals").data(payload));
                } catch (Exception e) {
                    emitter.completeWithError(e);
                    failedEmitters.add(emitter);
                }
            }
            list.removeAll(failedEmitters);
        });
    }
}
