-- ========================================================
-- MediQueue Database Schema for PostgreSQL
-- ========================================================

-- Drop tables if exists
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medicine_reminders CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (PATIENT and DOCTOR roles)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR')),
    specialization VARCHAR(100),
    avg_consultation_time INT DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookup
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Appointments Table
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    token_number VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('BOOKED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_appointments_date_doctor ON appointments(appointment_date, doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- 3. Medicine Reminders Table
CREATE TABLE medicine_reminders (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    reminder_time TIME NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    instructions VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for patient reminders lookup
CREATE INDEX idx_reminders_patient ON medicine_reminders(patient_id);

-- 4. Prescriptions Table
CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notes TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Demo Users
INSERT INTO users (name, email, phone, password, role, specialization, avg_consultation_time) VALUES
('Dr. Kumar', 'doctor@mediqueue.demo', '+1 (555) 019-2831', '$2a$10$e8R6.pY8e89lYmB.7zU4eO4A0C7rP4w2Q3E4R5T6Y7U8I9O0P1Q2', 'DOCTOR', 'Cardiologist & General Physician', 7),
('Dr. Priya Sharma', 'priya@mediqueue.demo', '+1 (555) 019-4820', '$2a$10$e8R6.pY8e89lYmB.7zU4eO4A0C7rP4w2Q3E4R5T6Y7U8I9O0P1Q2', 'DOCTOR', 'Pediatrician', 10),
('Demo Patient', 'patient@mediqueue.demo', '+1 (555) 234-5678', '$2a$10$e8R6.pY8e89lYmB.7zU4eO4A0C7rP4w2Q3E4R5T6Y7U8I9O0P1Q2', 'PATIENT', NULL, NULL);
