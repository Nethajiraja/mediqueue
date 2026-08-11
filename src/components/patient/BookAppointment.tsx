import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { User, Appointment } from '../../types';
import { QRModal } from '../common/QRModal';
import {
  Calendar,
  Clock,
  User as UserIcon,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Ticket,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface BookAppointmentProps {
  onSuccess: () => void;
}

export const BookAppointment: React.FC<BookAppointmentProps> = ({ onSuccess }) => {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        setDoctors(res.data);
        if (res.data.length > 0) {
          setSelectedDoctorId(res.data[0].id);
        }
      } catch (err) {
        setError('Failed to fetch doctor list.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/appointments', {
        doctorId: selectedDoctorId,
        appointmentDate,
        appointmentTime
      });

      setConfirmedAppt(res.data.appointment);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '14:00',
    '14:30', '15:00', '15:30', '16:00'
  ];

  return (
    <div className="max-w-3xl mx-auto my-8 space-y-8">
      {/* Page Title */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Appointment Booking
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Book Consultation & Get Token
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose your specialist doctor, select date & time, and generate your live digital queue token
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold shadow-sm">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleBooking} className="space-y-6">
        {/* Doctor Selection */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" /> Select Specialist Doctor
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedDoctorId === doc.id
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{doc.specialization}</p>
                    </div>
                  </div>
                  {selectedDoctorId === doc.id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-600/20" />
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Avg Duration: ~{doc.avgConsultationTime || 7} mins</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Available Today</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Select Date & Time Slot
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Appointment Date
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Time Slot
              </label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-extrabold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          {isSubmitting ? 'Generating Digital Token...' : 'Confirm Appointment & Generate Token'} <Ticket className="w-5 h-5" />
        </button>
      </form>

      {/* Confirmation Modal */}
      {confirmedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Booking Confirmed!
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Token Issued Successfully
              </h3>
            </div>

            <div className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-teal-200 dark:border-teal-900/50">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Your Queue Token</span>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white my-1">
                {confirmedAppt.tokenNumber}
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mt-3 pt-3 border-t border-teal-200/60 dark:border-slate-700">
                <p><strong>Doctor:</strong> {confirmedAppt.doctorName}</p>
                <p><strong>Date & Time:</strong> {confirmedAppt.appointmentDate} at {confirmedAppt.appointmentTime}</p>
                <p><strong>Status:</strong> <span className="text-emerald-600 font-bold uppercase">{confirmedAppt.status}</span></p>
              </div>
            </div>

            <button
              onClick={() => {
                setConfirmedAppt(null);
                onSuccess();
              }}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              Go to Live Queue Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
