import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { QueueStatus, MedicineReminder, Appointment } from '../../types';
import { QRModal } from '../common/QRModal';
import {
  Clock,
  Ticket,
  Users,
  Hourglass,
  Calendar,
  Pill,
  CheckCircle2,
  QrCode,
  RefreshCw,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

interface PatientDashboardProps {
  onNavigate: (tab: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchQueueAndData = async () => {
    try {
      setIsRefreshing(true);
      const [queueRes, remindersRes] = await Promise.all([
        api.get('/queue/my'),
        api.get('/medicine-reminders')
      ]);
      setQueueStatus(queueRes.data);
      setReminders(remindersRes.data);
    } catch (err) {
      console.error('Error fetching patient dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueueAndData();
    // Auto polling every 5 seconds for live queue updates
    const interval = setInterval(fetchQueueAndData, 5000);
    return () => clearInterval(interval);
  }, []);

  const openQRModal = async () => {
    if (queueStatus?.appointmentId) {
      try {
        const res = await api.get(`/appointments/${queueStatus.appointmentId}`);
        setSelectedAppointment(res.data);
        setShowQR(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Patient Portal
          </span>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Welcome, {user?.name || 'Patient'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {queueStatus?.hasActiveAppointment
              ? `Your next appointment starts in approximately ${queueStatus.estimatedWaitMinutes} minutes.`
              : 'Track your live appointment queue, estimated wait time, and daily medications.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchQueueAndData}
            disabled={isRefreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Queue Status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('book')}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Calendar className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Main Queue Dashboard Grid */}
      {queueStatus?.hasActiveAppointment ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Token Card & Upcoming Visit */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Digital Token Hero Display (2 cols) */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-100 dark:border-amber-900/50 uppercase tracking-wider">
                    {queueStatus.status}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Your Digital Token</p>
                <div className="text-[100px] sm:text-[120px] font-black text-blue-600 dark:text-blue-500 leading-none mb-4 tracking-tight">
                  {queueStatus.userToken}
                </div>

                {/* Sleek Line Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width:
                        queueStatus.status === 'IN_PROGRESS'
                          ? '100%'
                          : `${Math.max(15, 100 - queueStatus.patientsAhead * 20)}%`
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md transition-all duration-500"
                    style={{
                      left:
                        queueStatus.status === 'IN_PROGRESS'
                          ? 'calc(100% - 16px)'
                          : `calc(${Math.max(15, 100 - queueStatus.patientsAhead * 20)}% - 8px)`
                    }}
                  />
                </div>

                <div className="flex justify-between w-full text-center">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase">Queue Position</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                      {queueStatus.status === 'IN_PROGRESS' ? 'NOW' : `#${queueStatus.patientsAhead}`}
                    </p>
                  </div>
                  <div className="px-6 sm:px-8 border-x border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-400 uppercase">Currently Serving</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{queueStatus.currentToken}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase">Estimated Wait</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {queueStatus.estimatedWaitMinutes}m
                    </p>
                  </div>
                </div>
              </div>

              {/* Upcoming Visit Blue Card (1 col) */}
              <div className="bg-blue-600 rounded-3xl p-8 shadow-lg flex flex-col text-white">
                <p className="text-sm font-semibold opacity-80 mb-2">Upcoming Visit</p>
                <h3 className="text-xl font-bold mb-6">General Consultation</h3>

                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 opacity-80">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs opacity-70">Primary Doctor</p>
                      <p className="font-semibold text-sm">{queueStatus.doctorName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 opacity-80">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs opacity-70">Date & Time</p>
                      <p className="font-semibold text-sm">{queueStatus.appointmentDate}, {queueStatus.appointmentTime}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={openQRModal}
                  className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl mt-6 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
                >
                  <QrCode className="w-4 h-4" /> View Digital QR
                </button>
              </div>
            </div>

            {/* Recent Doctor Notes Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Doctor Consultation Notes</h2>
                <button
                  onClick={() => onNavigate('history')}
                  className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
                >
                  View All Records
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60 italic text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                "Please arrive 10 minutes prior to your token call time. Stay hydrated and present your digital QR token at the reception check-in counter upon arrival."
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Medicine Reminders */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Medicine Reminders</h2>
                <button
                  onClick={() => onNavigate('medicines')}
                  className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full hover:scale-105 transition-transform"
                  title="Add Medicine"
                >
                  <Pill className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                {reminders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No medicine reminders set for today.</p>
                ) : (
                  reminders.map((rem, idx) => (
                    <div
                      key={rem.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        rem.takenToday
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'
                          : idx === 0
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50'
                          : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-80'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                          rem.takenToday
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300'
                            : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        }`}
                      >
                        {rem.takenToday ? '✓' : <Clock className="w-5 h-5" />}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{rem.medicineName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{rem.dosage}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{rem.reminderTime}</p>
                        <p
                          className={`text-[10px] font-bold uppercase ${
                            rem.takenToday
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {rem.takenToday ? 'Taken' : 'Scheduled'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => onNavigate('book')}
                className="w-full mt-6 py-4 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-all text-sm"
              >
                Book New Appointment
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* No Active Queue Banner */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No Active Queue Token Today</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              You don't have an active appointment token in today's doctor queue. Select a specialist to book your token now.
            </p>
          </div>
          <button
            onClick={() => onNavigate('book')}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/25 inline-flex items-center gap-2 transition-all hover:scale-105"
          >
            <Calendar className="w-4 h-4" /> Book Appointment Now
          </button>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('book')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer group transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Book Appointment</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select doctor & generate queue token</p>
        </div>

        <div
          onClick={() => onNavigate('medicines')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer group transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Pill className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Medicine Reminders</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {reminders.length} schedule{reminders.length !== 1 ? 's' : ''} active
          </p>
        </div>

        <div
          onClick={() => onNavigate('history')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 cursor-pointer group transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Appointment History</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View past visits & doctor notes</p>
        </div>
      </div>

      {/* Today's Medicine Reminders Timeline */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Medicine Schedule</h3>
          </div>
          <button
            onClick={() => onNavigate('medicines')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            Manage Reminders <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {reminders.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No medicine reminders configured for today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                    ⏰ {rem.reminderTime}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{rem.medicineName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dosage: {rem.dosage}</p>
                  {rem.instructions && (
                    <p className="text-[10px] text-slate-400 mt-1 italic">"{rem.instructions}"</p>
                  )}
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                    rem.takenToday
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {rem.takenToday ? '✓ Taken' : '⏰ Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal if triggered */}
      {showQR && selectedAppointment && (
        <QRModal appointment={selectedAppointment} onClose={() => setShowQR(false)} />
      )}
    </div>
  );
};
