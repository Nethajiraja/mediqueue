import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Appointment } from '../../types';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  Phone,
  QrCode,
  RefreshCw,
  X,
  Send,
  AlertCircle,
  Play,
  Check,
  Search
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState<{
    currentlyServing: Appointment | null;
    waitingPatients: Appointment[];
    completedPatients: Appointment[];
    allAppointments: Appointment[];
  }>({
    currentlyServing: null,
    waitingPatients: [],
    completedPatients: [],
    allAppointments: []
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedApptForPrescription, setSelectedApptForPrescription] = useState<Appointment | null>(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState<string>('');
  const [prescriptionSavedMsg, setPrescriptionSavedMsg] = useState<string>('');

  // QR Check-In Scanner simulator state
  const [showQRCheckIn, setShowQRCheckIn] = useState<boolean>(false);
  const [qrTokenInput, setQrTokenInput] = useState<string>('');
  const [qrVerifyResult, setQrVerifyResult] = useState<any | null>(null);

  const fetchDoctorQueue = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get('/doctor/queue');
      setQueueData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctorQueue();
    // Auto polling every 5s
    const interval = setInterval(fetchDoctorQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async (apptId?: number) => {
    const targetId = apptId || queueData.waitingPatients[0]?.id;
    if (!targetId) return;

    try {
      await api.post(`/doctor/appointments/${targetId}/start`);
      fetchDoctorQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteConsultation = async (apptId: number) => {
    try {
      await api.post(`/doctor/appointments/${apptId}/complete`);
      fetchDoctorQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptForPrescription) return;

    try {
      await api.post(`/doctor/appointments/${selectedApptForPrescription.id}/prescription`, {
        notes: prescriptionNotes
      });
      setPrescriptionSavedMsg('Prescription notes saved successfully!');
      setTimeout(() => {
        setPrescriptionSavedMsg('');
        setSelectedApptForPrescription(null);
        setPrescriptionNotes('');
      }, 1500);
      fetchDoctorQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyQRToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrTokenInput) return;

    try {
      const res = await api.post('/qr/verify', { tokenString: qrTokenInput.trim().toUpperCase() });
      setQrVerifyResult(res.data);
    } catch (err: any) {
      setQrVerifyResult({ valid: false, message: err.response?.data?.message || 'Invalid token string.' });
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-blue-600/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Doctor Dashboard
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {user?.name || 'Dr. Kumar'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage patient queue flow, consultation notes, and live check-ins
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQRCheckIn(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-600" /> Verify QR Token
          </button>
          <button
            onClick={fetchDoctorQueue}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Doctor Queue"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Currently Serving Card */}
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 rounded-3xl border border-blue-500/30 shadow-xl space-y-3 relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 block">
            Currently Serving
          </span>
          <div className="text-4xl font-black text-white">
            {queueData.currentlyServing ? queueData.currentlyServing.tokenNumber : 'A-00'}
          </div>
          <div className="text-xs text-slate-300 font-medium">
            {queueData.currentlyServing
              ? `Patient: ${queueData.currentlyServing.patientName}`
              : 'No patient currently in consultation'}
          </div>

          {queueData.currentlyServing && (
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => handleCompleteConsultation(queueData.currentlyServing!.id)}
                className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Complete Consultation
              </button>
              <button
                onClick={() => {
                  setSelectedApptForPrescription(queueData.currentlyServing!);
                  setPrescriptionNotes(queueData.currentlyServing!.prescriptionNotes || '');
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                title="Add Prescription Notes"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Waiting Patients Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
              Waiting Patients
            </span>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white">
            {queueData.waitingPatients.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Next in line: {queueData.waitingPatients[0]?.tokenNumber || 'None'}
          </p>

          <button
            onClick={() => handleCallNext()}
            disabled={queueData.waitingPatients.length === 0}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Call Next Patient
          </button>
        </div>

        {/* Completed Today Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
              Completed Today
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white">
            {queueData.completedPatients.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Avg consultation time: 7 minutes
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Today's Consultation Queue
          </h3>
          <span className="text-xs text-slate-500">Total Tokens: {queueData.allAppointments.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Token</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {queueData.allAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No appointments scheduled in today's queue.
                  </td>
                </tr>
              ) : (
                queueData.allAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white text-sm">
                      {appt.tokenNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {appt.patientName}
                    </td>
                    <td className="px-4 py-3">{appt.appointmentTime}</td>
                    <td className="px-4 py-3 text-slate-500">{appt.patientPhone || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          appt.status === 'IN_PROGRESS'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 animate-pulse'
                            : appt.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      {appt.status === 'WAITING' && (
                        <button
                          onClick={() => handleCallNext(appt.id)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Call Patient
                        </button>
                      )}
                      {appt.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleCompleteConsultation(appt.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedApptForPrescription(appt);
                          setPrescriptionNotes(appt.prescriptionNotes || '');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-semibold transition-colors"
                      >
                        Notes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Modal */}
      {selectedApptForPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setSelectedApptForPrescription(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Prescription / Consultation Notes
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {selectedApptForPrescription.patientName} (Token {selectedApptForPrescription.tokenNumber})
                </p>
              </div>
            </div>

            {prescriptionSavedMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                ✓ {prescriptionSavedMsg}
              </div>
            )}

            <form onSubmit={handleSavePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Doctor Notes & Instructions
                </label>
                <textarea
                  rows={4}
                  required
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="Take medicines after food. Drink plenty of water and rest..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Save Notes to Patient Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Check-In Verification Modal */}
      {showQRCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => {
                setShowQRCheckIn(false);
                setQrVerifyResult(null);
                setQrTokenInput('');
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">QR Token Check-In Tool</h3>
              <p className="text-xs text-slate-500">Scan or enter token number to verify patient check-in</p>
            </div>

            <form onSubmit={handleVerifyQRToken} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Token String or Identifier
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={qrTokenInput}
                    onChange={(e) => setQrTokenInput(e.target.value)}
                    placeholder="e.g. A-27"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm uppercase font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </form>

            {qrVerifyResult && (
              <div
                className={`p-4 rounded-2xl text-xs ${
                  qrVerifyResult.valid
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {qrVerifyResult.valid ? (
                  <div>
                    <span className="font-extrabold uppercase block text-sm">✓ Valid Token: {qrVerifyResult.appointment.tokenNumber}</span>
                    <p className="mt-1">Patient: <strong>{qrVerifyResult.appointment.patientName}</strong></p>
                    <p>Status: <strong className="uppercase">{qrVerifyResult.appointment.status}</strong></p>
                  </div>
                ) : (
                  <p>{qrVerifyResult.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
