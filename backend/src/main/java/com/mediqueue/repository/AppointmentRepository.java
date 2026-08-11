package com.mediqueue.repository;

import com.mediqueue.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Appointment> findByDoctorIdAndAppointmentDateOrderByCreatedAtAsc(Long doctorId, LocalDate appointmentDate);
    Long countByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);
    Long countByDoctorIdAndAppointmentDateAndStatus(Long doctorId, LocalDate appointmentDate, String status);
}
