import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Stethoscope,
  X,
  Ticket
} from 'lucide-react';

export const AppointmentHistory: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/appointments/my');
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Consultation Records
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Appointment History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review past doctor visits, issued tokens, and prescription consultation notes
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold shadow-sm">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* Appointments Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm font-semibold">No appointment records found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-lg">
                    {appt.tokenNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{appt.doctorName}</h4>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          appt.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : appt.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                      <span>Date: {appt.appointmentDate}</span>
                      <span>•</span>
                      <span>Time: {appt.appointmentTime}</span>
                    </div>
                  </div>
                </div>

                {appt.prescriptionNotes ? (
                  <button
                    onClick={() => setSelectedAppt(appt)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    <FileText className="w-4 h-4" /> View Prescription Notes
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">No notes recorded</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setSelectedAppt(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Doctor Consultation Notes</h3>
                <p className="text-xs text-slate-500">
                  {selectedAppt.doctorName} • {selectedAppt.appointmentDate}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Prescription / Advice:
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedAppt.prescriptionNotes}
              </p>
            </div>

            <button
              onClick={() => setSelectedAppt(null)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow transition-colors"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
