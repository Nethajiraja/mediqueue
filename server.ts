import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mediqueue_jwt_secret_key_2026_super_secure_32bytes_min';
const DATA_FILE = path.join(process.cwd(), 'mediqueue_db.json');

// Interface types for in-memory / file database
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'PATIENT' | 'DOCTOR';
  specialization?: string;
  avgConsultationTime?: number;
  createdAt: string;
}

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientPhone: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  tokenNumber: string; // A-01, A-02, etc.
  status: 'BOOKED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  prescriptionNotes?: string;
  prescriptionMedicines?: { name: string; dosage: string; timing: string }[];
}

interface MedicineReminder {
  id: number;
  patientId: number;
  medicineName: string;
  dosage: string;
  reminderTime: string; // HH:MM
  startDate: string;
  endDate: string;
  instructions: string;
  active: boolean;
  takenToday?: boolean;
  createdAt: string;
}

interface DB {
  users: User[];
  appointments: Appointment[];
  reminders: MedicineReminder[];
}

// Initial seed helper
function getInitialDB(): DB {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('Demo@123', salt);
  const todayStr = new Date().toISOString().split('T')[0];

  const users: User[] = [
    {
      id: 1,
      name: 'Dr. Kumar',
      email: 'doctor@mediqueue.demo',
      phone: '+1 (555) 019-2831',
      passwordHash: defaultPasswordHash,
      role: 'DOCTOR',
      specialization: 'Cardiologist & General Physician',
      avgConsultationTime: 7,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Dr. Priya Sharma',
      email: 'priya@mediqueue.demo',
      phone: '+1 (555) 019-4820',
      passwordHash: defaultPasswordHash,
      role: 'DOCTOR',
      specialization: 'Pediatrician & Wellness',
      avgConsultationTime: 10,
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Demo Patient',
      email: 'patient@mediqueue.demo',
      phone: '+1 (555) 234-5678',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      phone: '+1 (555) 987-6543',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      createdAt: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Michael Chen',
      email: 'michael@example.com',
      phone: '+1 (555) 876-5432',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      createdAt: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Anita Patel',
      email: 'anita@example.com',
      phone: '+1 (555) 765-4321',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      createdAt: new Date().toISOString()
    },
    {
      id: 7,
      name: 'Robert Taylor',
      email: 'robert@example.com',
      phone: '+1 (555) 654-3210',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      createdAt: new Date().toISOString()
    }
  ];

  const appointments: Appointment[] = [
    {
      id: 101,
      patientId: 4,
      patientName: 'Sarah Jenkins',
      patientPhone: '+1 (555) 987-6543',
      doctorId: 1,
      doctorName: 'Dr. Kumar',
      appointmentDate: todayStr,
      appointmentTime: '09:00',
      tokenNumber: 'A-23',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString()
    },
    {
      id: 102,
      patientId: 5,
      patientName: 'Michael Chen',
      patientPhone: '+1 (555) 876-5432',
      doctorId: 1,
      doctorName: 'Dr. Kumar',
      appointmentDate: todayStr,
      appointmentTime: '09:15',
      tokenNumber: 'A-24',
      status: 'WAITING',
      createdAt: new Date().toISOString()
    },
    {
      id: 103,
      patientId: 6,
      patientName: 'Anita Patel',
      patientPhone: '+1 (555) 765-4321',
      doctorId: 1,
      doctorName: 'Dr. Kumar',
      appointmentDate: todayStr,
      appointmentTime: '09:30',
      tokenNumber: 'A-25',
      status: 'WAITING',
      createdAt: new Date().toISOString()
    },
    {
      id: 104,
      patientId: 7,
      patientName: 'Robert Taylor',
      patientPhone: '+1 (555) 654-3210',
      doctorId: 1,
      doctorName: 'Dr. Kumar',
      appointmentDate: todayStr,
      appointmentTime: '09:45',
      tokenNumber: 'A-26',
      status: 'WAITING',
      createdAt: new Date().toISOString()
    },
    {
      id: 105,
      patientId: 3,
      patientName: 'Demo Patient',
      patientPhone: '+1 (555) 234-5678',
      doctorId: 1,
      doctorName: 'Dr. Kumar',
      appointmentDate: todayStr,
      appointmentTime: '10:00',
      tokenNumber: 'A-27',
      status: 'WAITING',
      createdAt: new Date().toISOString()
    }
  ];

  const reminders: MedicineReminder[] = [
    {
      id: 201,
      patientId: 3,
      medicineName: 'Paracetamol 650mg',
      dosage: '1 tablet',
      reminderTime: '08:00',
      startDate: todayStr,
      endDate: '2026-08-20',
      instructions: 'Take after breakfast with water',
      active: true,
      takenToday: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 202,
      patientId: 3,
      medicineName: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      reminderTime: '14:00',
      startDate: todayStr,
      endDate: '2026-08-15',
      instructions: 'Take after lunch with food',
      active: true,
      takenToday: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 203,
      patientId: 3,
      medicineName: 'Vitamin D3 1000IU',
      dosage: '1 softgel',
      reminderTime: '20:00',
      startDate: todayStr,
      endDate: '2026-09-01',
      instructions: 'Take after dinner',
      active: true,
      takenToday: false,
      createdAt: new Date().toISOString()
    }
  ];

  return { users, appointments, reminders };
}

// Database Persistence Engine
let db: DB;
try {
  if (fs.existsSync(DATA_FILE)) {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    db = JSON.parse(content);
  } else {
    db = getInitialDB();
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  }
} catch (e) {
  db = getInitialDB();
}

function saveDB() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to write database file', err);
  }
}

// Auth Middleware
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'PATIENT' | 'DOCTOR';
    name: string;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: 'PATIENT' | 'DOCTOR';
      name: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ==========================================
  // REST API ROUTES
  // ==========================================

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'MediQueue API', timestamp: new Date().toISOString() });
  });

  // 2. Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const userRole = role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: Date.now(),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      role: userRole,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  });

  // 3. Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        specialization: user.specialization
      }
    });
  });

  // 4. Auth: Get current user profile
  app.get('/api/auth/me', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    const user = db.users.find(u => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        specialization: user.specialization,
        avgConsultationTime: user.avgConsultationTime
      }
    });
  });

  // 5. Doctors: Get list
  app.get('/api/doctors', (req, res) => {
    const doctors = db.users
      .filter(u => u.role === 'DOCTOR')
      .map(d => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        specialization: d.specialization || 'General Physician',
        avgConsultationTime: d.avgConsultationTime || 7
      }));

    res.json(doctors);
  });

  // 6. Appointments: Book Appointment & Generate Token
  app.post('/api/appointments', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    const { doctorId, appointmentDate, appointmentTime } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Doctor ID, appointment date, and time are required.' });
    }

    const patient = db.users.find(u => u.id === req.user?.id);
    const doctor = db.users.find(u => u.id === Number(doctorId) && u.role === 'DOCTOR');

    if (!patient) {
      return res.status(404).json({ message: 'Patient user record not found.' });
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Selected doctor not found.' });
    }

    // Generate token for doctor on this appointmentDate
    const existingDoctorApps = db.appointments.filter(
      a => a.doctorId === doctor.id && a.appointmentDate === appointmentDate
    );

    // e.g. Token sequence A-01, A-02, A-03...
    const nextSeq = existingDoctorApps.length + 1;
    const tokenNumber = `A-${nextSeq.toString().padStart(2, '0')}`;

    const newAppointment: Appointment = {
      id: Date.now(),
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone || '',
      doctorId: doctor.id,
      doctorName: doctor.name,
      appointmentDate,
      appointmentTime,
      tokenNumber,
      status: 'WAITING',
      createdAt: new Date().toISOString()
    };

    db.appointments.push(newAppointment);
    saveDB();

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointment: newAppointment
    });
  });

  // 7. Appointments: Get My Appointments (Patient)
  app.get('/api/appointments/my', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    const patientApps = db.appointments
      .filter(a => a.patientId === req.user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(patientApps);
  });

  // 8. Appointments: Get Appointment Details by ID
  app.get('/api/appointments/:id', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    const appt = db.appointments.find(a => a.id === Number(req.params.id));
    if (!appt) {
      return res.status(404).json({ message: 'Appointment record not found.' });
    }
    res.json(appt);
  });

  // 9. Live Queue Status for Patient
  app.get('/api/queue/my', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = req.user?.id;

    // Find patient's latest active/today appointment
    const userAppt = db.appointments
      .filter(a => a.patientId === userId && a.status !== 'CANCELLED' && a.status !== 'COMPLETED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (!userAppt) {
      // Find latest completed appointment if any
      const completedAppt = db.appointments
        .filter(a => a.patientId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      return res.json({
        hasActiveAppointment: false,
        lastAppointment: completedAppt || null,
        message: 'No active appointment in queue for today.'
      });
    }

    const doctor = db.users.find(u => u.id === userAppt.doctorId);
    const avgConsultationTime = doctor?.avgConsultationTime || 7;

    // Fetch all doctor appointments for that date
    const doctorQueue = db.appointments.filter(
      a => a.doctorId === userAppt.doctorId && a.appointmentDate === userAppt.appointmentDate && a.status !== 'CANCELLED'
    );

    // Current token serving or last served
    const inProgress = doctorQueue.find(a => a.status === 'IN_PROGRESS');
    const waitingList = doctorQueue.filter(a => a.status === 'WAITING');

    let currentToken = inProgress ? inProgress.tokenNumber : (waitingList[0]?.tokenNumber || 'A-00');

    // Calculate position
    // Patients ahead: waiting patients created before or with smaller token before user
    let patientsAhead = 0;
    if (userAppt.status === 'IN_PROGRESS') {
      patientsAhead = 0;
    } else {
      // Count waiting appointments prior to this user's token
      patientsAhead = waitingList.findIndex(a => a.id === userAppt.id);
      if (patientsAhead < 0) patientsAhead = 0;
      // If there is an IN_PROGRESS patient ahead, add 1
      if (inProgress && inProgress.id !== userAppt.id) {
        patientsAhead += 1;
      }
    }

    const estimatedWaitMinutes = patientsAhead * avgConsultationTime;

    res.json({
      hasActiveAppointment: true,
      appointmentId: userAppt.id,
      userToken: userAppt.tokenNumber,
      status: userAppt.status,
      doctorName: userAppt.doctorName,
      appointmentDate: userAppt.appointmentDate,
      appointmentTime: userAppt.appointmentTime,
      currentToken: currentToken,
      patientsAhead: patientsAhead,
      avgConsultationTime: avgConsultationTime,
      estimatedWaitMinutes: estimatedWaitMinutes,
      totalWaitingInQueue: waitingList.length
    });
  });

  // 10. Doctor: Queue List
  app.get('/api/doctor/queue', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Access denied. Doctor authorization required.' });
    }

    const doctorId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    const todayAppointments = db.appointments
      .filter(a => a.doctorId === doctorId && a.appointmentDate === todayStr)
      .sort((a, b) => a.id - b.id);

    const currentlyServing = todayAppointments.find(a => a.status === 'IN_PROGRESS') || null;
    const waitingPatients = todayAppointments.filter(a => a.status === 'WAITING');
    const completedPatients = todayAppointments.filter(a => a.status === 'COMPLETED');

    res.json({
      doctorId,
      date: todayStr,
      currentlyServing,
      waitingPatients,
      completedPatients,
      allAppointments: todayAppointments
    });
  });

  // 11. Doctor: Call Next Patient (WAITING -> IN_PROGRESS)
  app.post('/api/doctor/appointments/:id/start', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Access denied. Doctor authorization required.' });
    }

    const appointmentId = Number(req.params.id);
    const doctorId = req.user.id;

    // Mark any existing IN_PROGRESS for this doctor to COMPLETED or WAITING if needed
    db.appointments.forEach(a => {
      if (a.doctorId === doctorId && a.status === 'IN_PROGRESS' && a.id !== appointmentId) {
        a.status = 'COMPLETED';
      }
    });

    const targetAppt = db.appointments.find(a => a.id === appointmentId);
    if (!targetAppt) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    targetAppt.status = 'IN_PROGRESS';
    saveDB();

    res.json({
      message: `Patient ${targetAppt.patientName} (Token ${targetAppt.tokenNumber}) is now IN_PROGRESS.`,
      appointment: targetAppt
    });
  });

  // 12. Doctor: Complete Consultation (IN_PROGRESS -> COMPLETED)
  app.post('/api/doctor/appointments/:id/complete', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Access denied. Doctor authorization required.' });
    }

    const appointmentId = Number(req.params.id);
    const targetAppt = db.appointments.find(a => a.id === appointmentId);

    if (!targetAppt) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    targetAppt.status = 'COMPLETED';
    saveDB();

    // Auto-advance option check
    const todayStr = targetAppt.appointmentDate;
    const nextWaiting = db.appointments.find(
      a => a.doctorId === req.user?.id && a.appointmentDate === todayStr && a.status === 'WAITING'
    );

    res.json({
      message: `Consultation for Token ${targetAppt.tokenNumber} marked as COMPLETED.`,
      appointment: targetAppt,
      nextWaiting: nextWaiting || null
    });
  });

  // 13. Doctor: Add Prescription Notes
  app.post('/api/doctor/appointments/:id/prescription', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Access denied. Doctor authorization required.' });
    }

    const appointmentId = Number(req.params.id);
    const { notes, medicines } = req.body;

    const targetAppt = db.appointments.find(a => a.id === appointmentId);
    if (!targetAppt) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    targetAppt.prescriptionNotes = notes || '';
    if (medicines) {
      targetAppt.prescriptionMedicines = medicines;
    }
    saveDB();

    res.json({
      message: 'Prescription notes saved successfully!',
      appointment: targetAppt
    });
  });

  // 14. Doctor: Statistics
  app.get('/api/doctor/statistics', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Access denied. Doctor authorization required.' });
    }

    const doctorId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    const doctorApps = db.appointments.filter(a => a.doctorId === doctorId && a.appointmentDate === todayStr);

    const totalToday = doctorApps.length;
    const waiting = doctorApps.filter(a => a.status === 'WAITING').length;
    const inProgress = doctorApps.filter(a => a.status === 'IN_PROGRESS').length;
    const completed = doctorApps.filter(a => a.status === 'COMPLETED').length;
    const cancelled = doctorApps.filter(a => a.status === 'CANCELLED').length;

    res.json({
      totalToday,
      waiting,
      inProgress,
      completed,
      cancelled,
      avgConsultationTime: 7
    });
  });

  // 15. Medicine Reminders: Get Reminders
  app.get('/api/medicine-reminders', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    const patientId = req.user?.id;
    const patientReminders = db.reminders.filter(r => r.patientId === patientId);
    res.json(patientReminders);
  });

  // 16. Medicine Reminders: Add Reminder
  app.post('/api/medicine-reminders', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    const { medicineName, dosage, reminderTime, startDate, endDate, instructions } = req.body;

    if (!medicineName || !reminderTime || !startDate || !endDate) {
      return res.status(400).json({ message: 'Medicine name, time, start date, and end date are required.' });
    }

    const newReminder: MedicineReminder = {
      id: Date.now(),
      patientId: req.user!.id,
      medicineName,
      dosage: dosage || '1 dose',
      reminderTime,
      startDate,
      endDate,
      instructions: instructions || '',
      active: true,
      takenToday: false,
      createdAt: new Date().toISOString()
    };

    db.reminders.push(newReminder);
    saveDB();

    res.status(201).json({
      message: 'Medicine reminder created successfully!',
      reminder: newReminder
    });
  });

  // 17. Medicine Reminders: Update or Toggle Taken
  app.put('/api/medicine-reminders/:id', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    const reminderId = Number(req.params.id);
    const reminder = db.reminders.find(r => r.id === reminderId && r.patientId === req.user?.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Medicine reminder not found.' });
    }

    const { medicineName, dosage, reminderTime, startDate, endDate, instructions, active, takenToday } = req.body;

    if (medicineName !== undefined) reminder.medicineName = medicineName;
    if (dosage !== undefined) reminder.dosage = dosage;
    if (reminderTime !== undefined) reminder.reminderTime = reminderTime;
    if (startDate !== undefined) reminder.startDate = startDate;
    if (endDate !== undefined) reminder.endDate = endDate;
    if (instructions !== undefined) reminder.instructions = instructions;
    if (active !== undefined) reminder.active = active;
    if (takenToday !== undefined) reminder.takenToday = takenToday;

    saveDB();

    res.json({
      message: 'Medicine reminder updated successfully.',
      reminder
    });
  });

  // 18. Medicine Reminders: Delete
  app.delete('/api/medicine-reminders/:id', authenticateToken as express.RequestHandler, (req: AuthRequest, res: Response) => {
    const reminderId = Number(req.params.id);
    const index = db.reminders.findIndex(r => r.id === reminderId && r.patientId === req.user?.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Medicine reminder not found.' });
    }

    db.reminders.splice(index, 1);
    saveDB();

    res.json({ message: 'Medicine reminder deleted successfully.' });
  });

  // 19. QR Check-In Verification API
  app.post('/api/qr/verify', (req, res) => {
    const { tokenString } = req.body;
    if (!tokenString) {
      return res.status(400).json({ message: 'Token string is required.' });
    }

    const appt = db.appointments.find(a => a.tokenNumber === tokenString || `MEDIQUEUE-${a.tokenNumber}` === tokenString);

    if (!appt) {
      return res.status(404).json({ message: 'Invalid token or appointment not found.' });
    }

    res.json({
      valid: true,
      appointment: appt
    });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediQueue Full Stack App running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start MediQueue server:', err);
});
