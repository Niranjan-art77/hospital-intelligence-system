package com.example.demo.controller;

import com.example.demo.analytics.AnalyticsDto;
import com.example.demo.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public AnalyticsDto getDashboardAnalytics() {
        return analyticsService.getDashboardAnalytics();
    }
}
