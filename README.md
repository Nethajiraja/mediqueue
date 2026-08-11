# MediQueue – Smart Patient Queue & Medicine Reminder System

MediQueue is a production-style, responsive full-stack healthcare web application designed to eliminate clinic wait time ambiguity and automate patient medicine management.

## 🚀 Key Features

### For Patients
- **Registration & Authentication**: JWT-secured login & account registration.
- **Appointment Booking**: Select specialist doctors, choose date/time, and generate unique digital queue tokens (e.g. `A-27`).
- **Live Queue Monitoring**: Real-time auto-polling queue monitor displaying current serving token (`A-23`), queue position (`#4`), and calculated estimated wait time (`28 mins`).
- **Digital Token QR Code**: View, download, and print QR tokens for clinic check-in.
- **Medicine Reminder System**: Configure medication dosage schedules, receive browser chime alerts, and toggle daily compliance (`✓ Taken`).
- **Appointment History**: Review past visits and doctor prescription/consultation notes.

### For Doctors & Clinic Staff
- **Doctor Queue Dashboard**: Today's live patient queue overview with instant status filters (`WAITING`, `IN_PROGRESS`, `COMPLETED`).
- **Call Next Patient**: One-click advance advancing the queue seamlessly.
- **Complete Consultation**: Mark patient visits completed and auto-notify waiting patients.
- **Prescription Notes**: Record and attach consultation advice directly to the patient's record.
- **QR Token Check-In Tool**: Verify patient tokens at clinic desks.
- **Analytics & Statistics**: Real-time consultation metrics and completion breakdown.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide React Icons, Motion
- **Backend (Express / Live Preview)**: Express.js, TypeScript, BCryptJS, JSONWebToken, QR Code Generator
- **Backend (Spring Boot Reference)**: Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, JWT, PostgreSQL Driver
- **Database**: PostgreSQL (`database/schema.sql`)

---

## 📁 Project Structure

```text
mediqueue/
├── database/
│   └── schema.sql              # Complete PostgreSQL database schema and seed data
├── backend/
│   ├── pom.xml                 # Spring Boot Maven configuration
│   ├── src/
│   │   └── main/
│   │       ├── java/com/mediqueue/...
│   │       └── resources/application.properties
├── src/                        # React Frontend application
│   ├── components/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── doctor/
│   │   ├── landing/
│   │   └── patient/
│   ├── context/
│   ├── services/
│   └── types/
├── server.ts                   # Full-stack Node/Express live server
├── .env.example                # Environment variables template
├── package.json
└── README.md
```

---

## 💻 Local Setup & Execution

### Option A: Run Full-Stack Express Server (Live Preview)

1. Clone repository:
   ```bash
   git clone https://github.com/your-username/mediqueue.git
   cd mediqueue
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

### Option B: Run Spring Boot Backend & PostgreSQL

1. **PostgreSQL Database Setup**:
   Create a database named `mediqueue` in PostgreSQL:
   ```sql
   CREATE DATABASE mediqueue;
   ```
   Execute `database/schema.sql` to initialize tables and demo seed data.

2. **Configure Environment Variables**:
   Set database credentials in `backend/src/main/resources/application.properties` or `.env`:
   ```properties
   DATABASE_URL=jdbc:postgresql://localhost:5432/mediqueue
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=mediqueue_jwt_secret_key_2026_super_secure_32bytes_min
   ```

3. **Start Spring Boot Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   API runs on `http://localhost:8080`.

---

## 🔐 Seed Demo Accounts

### Doctor Account
- **Name**: Dr. Kumar
- **Email**: `doctor@mediqueue.demo`
- **Password**: `Demo@123`
- **Role**: `DOCTOR`

### Patient Account
- **Name**: Demo Patient
- **Email**: `patient@mediqueue.demo`
- **Password**: `Demo@123`
- **Role**: `PATIENT`

---

## 📄 License
Apache 2.0 License. Built for Healthcare Applications.
