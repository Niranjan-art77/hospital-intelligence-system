package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.service.SymptomAnalyzerService;
import java.util.Map;

@RestController
@RequestMapping("/api/symptoms")
@CrossOrigin(originPatterns = "*")
public class SymptomAnalyzerController {

    @Autowired
    private SymptomAnalyzerService symptomAnalyzerService;

    @PostMapping("/analyze")
    public Map<String, Object> analyzeSymptoms(@RequestBody Map<String, String> payload) {
        String symptoms = payload.get("symptoms");
        return symptomAnalyzerService.analyze(symptoms);
    }
}
