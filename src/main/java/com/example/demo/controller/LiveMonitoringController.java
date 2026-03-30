package com.example.demo.controller;

import com.example.demo.service.LiveMonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/live")
public class LiveMonitoringController {

    @Autowired
    private LiveMonitoringService liveMonitoringService;

    @GetMapping(value = "/vitals/{patientId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamVitals(@PathVariable Long patientId) {
        return liveMonitoringService.subscribe(patientId);
    }
}
