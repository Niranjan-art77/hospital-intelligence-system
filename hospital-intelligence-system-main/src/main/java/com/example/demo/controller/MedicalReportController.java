package com.example.demo.controller;

import com.example.demo.entity.MedicalReport;
import com.example.demo.entity.Patient;
import com.example.demo.repository.MedicalReportRepository;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(originPatterns = "*")
public class MedicalReportController {

    @Autowired
    private MedicalReportRepository reportRepository;

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/patient/{id}")
    public ResponseEntity<List<MedicalReport>> getReportsByPatient(@PathVariable Long id) {
        return ResponseEntity.ok(reportRepository.findByPatientId(id));
    }

    @PostMapping("/upload/{patientId}")
    public ResponseEntity<?> uploadReport(@PathVariable Long patientId, @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("reportName") String reportName,
            @RequestParam(value = "fileUrl", required = false) String fileUrl,
            @RequestParam(value = "fileType", required = false) String fileType) {
        try {
            Patient patient = patientRepository.findById(patientId).orElse(null);
            if (patient == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Patient not found");
            }

            MedicalReport report = new MedicalReport();
            report.setPatient(patient);
            report.setReportName(reportName);
            report.setCreatedAt(LocalDateTime.now());
            
            if (fileUrl != null) {
                report.setFileUrl(fileUrl);
                report.setFileType(fileType);
            } else if (file != null) {
                report.setFileData(file.getBytes());
                report.setFileType(file.getContentType());
            } else {
                return ResponseEntity.badRequest().body("Either file or fileUrl must be provided");
            }

            MedicalReport savedReport = reportRepository.save(report);

            if (file == null && fileUrl == null) {
                 // Finalize URL if it was a local upload
                 String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/reports/download/")
                        .path(savedReport.getId().toString())
                        .toUriString();
                savedReport.setFileUrl(fileDownloadUri);
                reportRepository.save(savedReport);
            }

            return ResponseEntity.ok(savedReport);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not upload the file: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) {
        MedicalReport report = reportRepository.findById(id).orElse(null);
        if (report == null || report.getFileData() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        report.getFileType() != null ? report.getFileType() : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + report.getReportName() + "\"")
                .body(report.getFileData());
    }
}
