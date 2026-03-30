package com.example.demo.service;

import com.example.demo.entity.Bed;
import com.example.demo.repository.BedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BedService {

    @Autowired
    private BedRepository bedRepository;

    public List<Bed> getAllBeds() {
        return bedRepository.findAll();
    }

    public Bed addBed(Bed bed) {
        return bedRepository.save(bed);
    }

    public Bed updateBedStatus(Long id, String status) {
        Bed bed = bedRepository.findById(id).orElse(null);
        if (bed != null) {
            bed.setStatus(status);
            return bedRepository.save(bed);
        }
        return null;
    }
}
