import React, { useEffect, useState } from 'react';
import { Pill, Bell, Check, X, Volume2 } from 'lucide-react';
import { MedicineReminder } from '../../types';
import api from '../../services/api';

export const NotificationBell: React.FC = () => {
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [activeAlert, setActiveAlert] = useState<MedicineReminder | null>(null);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/medicine-reminders');
      setReminders(res.data);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // AudioContext might be blocked until user gesture
    }
  };

  const triggerTestAlert = (reminder: MedicineReminder) => {
    setActiveAlert(reminder);
    playChime();
  };

  const markTaken = async (id: number) => {
    try {
      await api.put(`/medicine-reminders/${id}`, { takenToday: true });
      setActiveAlert(null);
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const upcomingReminders = reminders.filter(r => r.active && !r.takenToday);

  return (
    <>
      {/* Banner Popup when Medicine Reminder Triggers */}
      {activeAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-teal-500/50 animate-bounce-short">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                <Pill className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-teal-400 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5" /> Medicine Reminder
                </span>
                <h4 className="text-lg font-bold text-white">{activeAlert.medicineName}</h4>
              </div>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 text-sm text-slate-300 space-y-1">
            <p><strong>Dosage:</strong> {activeAlert.dosage}</p>
            <p><strong>Scheduled Time:</strong> {activeAlert.reminderTime}</p>
            {activeAlert.instructions && (
              <p className="text-xs text-teal-300 bg-teal-950/60 p-2 rounded-lg mt-2 border border-teal-800/40">
                💡 {activeAlert.instructions}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <button
              onClick={() => markTaken(activeAlert.id)}
              className="flex-1 py-2 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-teal-500/20"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Mark as Taken
            </button>
            <button
              onClick={playChime}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              title="Play Reminder Sound"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bell Bar for Quick Reminder Testing */}
      {upcomingReminders.length > 0 && !activeAlert && (
        <div className="fixed bottom-6 right-6 z-40 bg-white dark:bg-slate-900 border border-teal-500/30 shadow-xl rounded-2xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {upcomingReminders.length} Pending Medicine{upcomingReminders.length > 1 ? 's' : ''} Today
            </p>
            <p className="text-[10px] text-slate-500">Next: {upcomingReminders[0].medicineName} at {upcomingReminders[0].reminderTime}</p>
          </div>
          <button
            onClick={() => triggerTestAlert(upcomingReminders[0])}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1"
          >
            <Bell className="w-3.5 h-3.5" /> Test Alert
          </button>
        </div>
      )}
    </>
  );
};
