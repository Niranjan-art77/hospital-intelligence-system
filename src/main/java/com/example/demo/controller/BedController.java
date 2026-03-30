package com.example.demo.controller;

import com.example.demo.entity.Bed;
import com.example.demo.service.BedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
@CrossOrigin(originPatterns = "*")
public class BedController {

    @Autowired
    private BedService bedService;

    @GetMapping
    public List<Bed> getAllBeds() {
        return bedService.getAllBeds();
    }

    @PostMapping
    public Bed addBed(@RequestBody Bed bed) {
        return bedService.addBed(bed);
    }

    @PutMapping("/{id}/status")
    public Bed updateBedStatus(@PathVariable Long id, @RequestParam String status) {
        return bedService.updateBedStatus(id, status);
    }
}
