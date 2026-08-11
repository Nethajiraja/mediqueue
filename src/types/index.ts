export type UserRole = 'PATIENT' | 'DOCTOR';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  specialization?: string;
  avgConsultationTime?: number;
}

export type AppointmentStatus = 'BOOKED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientPhone?: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: AppointmentStatus;
  createdAt: string;
  prescriptionNotes?: string;
  prescriptionMedicines?: { name: string; dosage: string; timing: string }[];
}

export interface QueueStatus {
  hasActiveAppointment: boolean;
  appointmentId?: number;
  userToken?: string;
  status?: AppointmentStatus;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  currentToken: string;
  patientsAhead: number;
  avgConsultationTime: number;
  estimatedWaitMinutes: number;
  totalWaitingInQueue: number;
  lastAppointment?: Appointment | null;
  message?: string;
}

export interface MedicineReminder {
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

export interface DoctorStats {
  totalToday: number;
  waiting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  avgConsultationTime: number;
}
