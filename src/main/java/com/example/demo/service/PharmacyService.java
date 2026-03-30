package com.example.demo.service;

import com.example.demo.entity.Pharmacy;
import com.example.demo.repository.PharmacyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PharmacyService {

    @Autowired
    private PharmacyRepository pharmacyRepository;

    public List<Pharmacy> getAllMedicines() {
        return pharmacyRepository.findAll();
    }

    public Pharmacy addMedicine(Pharmacy pharmacy) {
        return pharmacyRepository.save(pharmacy);
    }
}
