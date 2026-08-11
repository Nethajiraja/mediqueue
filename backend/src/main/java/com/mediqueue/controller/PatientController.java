package com.mediqueue.controller;

import com.mediqueue.entity.Appointment;
import com.mediqueue.entity.User;
import com.mediqueue.repository.AppointmentRepository;
import com.mediqueue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping("/doctors")
    public ResponseEntity<?> getDoctors() {
        List<User> doctors = userRepository.findByRole("DOCTOR");
        return ResponseEntity.ok(doctors);
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> req, Authentication authentication) {
        String userEmail = authentication.getName();
        User patient = userRepository.findByEmail(userEmail).orElseThrow();

        Long doctorId = Long.parseLong(req.get("doctorId").toString());
        User doctor = userRepository.findById(doctorId).orElseThrow();

        LocalDate apptDate = LocalDate.parse(req.get("appointmentDate").toString());
        LocalTime apptTime = LocalTime.parse(req.get("appointmentTime").toString());

        Long existingCount = appointmentRepository.countByDoctorIdAndAppointmentDate(doctorId, apptDate);
        String tokenNumber = String.format("A-%02d", existingCount + 1);

        Appointment appt = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(apptDate)
                .appointmentTime(apptTime)
                .tokenNumber(tokenNumber)
                .status("WAITING")
                .build();

        appointmentRepository.save(appt);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Appointment booked successfully!");
        response.put("appointment", appt);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/appointments/my")
    public ResponseEntity<?> getMyAppointments(Authentication authentication) {
        User patient = userRepository.findByEmail(authentication.getName()).orElseThrow();
        List<Appointment> appts = appointmentRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
        return ResponseEntity.ok(appts);
    }

    @GetMapping("/queue/my")
    public ResponseEntity<?> getMyQueueStatus(Authentication authentication) {
        User patient = userRepository.findByEmail(authentication.getName()).orElseThrow();
        LocalDate today = LocalDate.now();

        List<Appointment> patientAppts = appointmentRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
        Appointment activeAppt = patientAppts.stream()
                .filter(a -> !a.getStatus().equals("CANCELLED") && !a.getStatus().equals("COMPLETED"))
                .findFirst().orElse(null);

        Map<String, Object> response = new HashMap<>();
        if (activeAppt == null) {
            response.put("hasActiveAppointment", false);
            response.put("message", "No active appointment in queue.");
            return ResponseEntity.ok(response);
        }

        List<Appointment> doctorQueue = appointmentRepository.findByDoctorIdAndAppointmentDateOrderByCreatedAtAsc(
                activeAppt.getDoctor().getId(), activeAppt.getAppointmentDate()
        );

        Appointment inProgress = doctorQueue.stream().filter(a -> a.getStatus().equals("IN_PROGRESS")).findFirst().orElse(null);
        String currentToken = inProgress != null ? inProgress.getTokenNumber() : "A-01";

        long waitingCount = doctorQueue.stream().filter(a -> a.getStatus().equals("WAITING")).count();
        int patientsAhead = Math.max(0, (int) waitingCount - 1);
        int avgTime = activeAppt.getDoctor().getAvgConsultationTime() != null ? activeAppt.getDoctor().getAvgConsultationTime() : 7;
        int estimatedWait = patientsAhead * avgTime;

        response.put("hasActiveAppointment", true);
        response.put("appointmentId", activeAppt.getId());
        response.put("userToken", activeAppt.getTokenNumber());
        response.put("status", activeAppt.getStatus());
        response.put("doctorName", activeAppt.getDoctor().getName());
        response.put("appointmentDate", activeAppt.getAppointmentDate());
        response.put("appointmentTime", activeAppt.getAppointmentTime());
        response.put("currentToken", currentToken);
        response.put("patientsAhead", patientsAhead);
        response.put("avgConsultationTime", avgTime);
        response.put("estimatedWaitMinutes", estimatedWait);

        return ResponseEntity.ok(response);
    }
}
