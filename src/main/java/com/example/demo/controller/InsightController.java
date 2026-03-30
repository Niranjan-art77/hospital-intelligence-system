package com.example.demo.controller;

import com.example.demo.entity.Insight;
import com.example.demo.service.InsightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@CrossOrigin(originPatterns = "*")
public class InsightController {

    @Autowired
    private InsightService insightService;

    @GetMapping
    public List<Insight> getAllInsights() {
        return insightService.getAllInsights();
    }

    @GetMapping("/patient/{patientId}")
    public List<Insight> getInsightsForPatient(@PathVariable Long patientId) {
        return insightService.getInsightsForPatient(patientId);
    }
}
