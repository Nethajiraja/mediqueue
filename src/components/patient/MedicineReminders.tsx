import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { MedicineReminder } from '../../types';
import {
  Pill,
  Plus,
  Clock,
  Trash2,
  Edit2,
  Check,
  Volume2,
  X,
  AlertCircle,
  Bell
} from 'lucide-react';

export const MedicineReminders: React.FC = () => {
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingReminder, setEditingReminder] = useState<MedicineReminder | null>(null);

  // Form fields
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');

  const fetchReminders = async () => {
    try {
      const res = await api.get('/medicine-reminders');
      setReminders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const resetForm = () => {
    setMedicineName('');
    setDosage('1 tablet');
    setReminderTime('08:00');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('2026-12-31');
    setInstructions('');
    setEditingReminder(null);
    setError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (rem: MedicineReminder) => {
    setEditingReminder(rem);
    setMedicineName(rem.medicineName);
    setDosage(rem.dosage);
    setReminderTime(rem.reminderTime);
    setStartDate(rem.startDate);
    setEndDate(rem.endDate);
    setInstructions(rem.instructions);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName) {
      setError('Medicine name is required.');
      return;
    }

    try {
      if (editingReminder) {
        await api.put(`/medicine-reminders/${editingReminder.id}`, {
          medicineName,
          dosage,
          reminderTime,
          startDate,
          endDate,
          instructions
        });
      } else {
        await api.post('/medicine-reminders', {
          medicineName,
          dosage,
          reminderTime,
          startDate,
          endDate,
          instructions
        });
      }

      setShowModal(false);
      resetForm();
      fetchReminders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save reminder.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this medicine reminder?')) {
      try {
        await api.delete(`/medicine-reminders/${id}`);
        fetchReminders();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleActive = async (rem: MedicineReminder) => {
    try {
      await api.put(`/medicine-reminders/${rem.id}`, {
        active: !rem.active
      });
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTaken = async (rem: MedicineReminder) => {
    try {
      await api.put(`/medicine-reminders/${rem.id}`, {
        takenToday: !rem.takenToday
      });
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const testChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Medication Tracker
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Medicine Reminders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure daily dosage times, receive audio-visual alerts, and mark medications taken
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={testChime}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Test Reminder Sound Chime"
          >
            <Volume2 className="w-4 h-4 text-blue-600" /> Test Sound
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Add Reminder
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-5 rounded-3xl border transition-all ${
              rem.active
                ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{rem.medicineName}</h4>
                  <p className="text-xs text-slate-500 font-medium">Dosage: {rem.dosage}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleOpenEdit(rem)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(rem.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400">
                  <Clock className="w-3.5 h-3.5" /> Time: {rem.reminderTime}
                </span>
                <span className="text-[10px] text-slate-400">
                  {rem.startDate} → {rem.endDate}
                </span>
              </div>

              {rem.instructions && (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl italic">
                  💡 {rem.instructions}
                </p>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => toggleTaken(rem)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  rem.takenToday
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:scale-105'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {rem.takenToday ? 'Taken Today' : 'Mark as Taken'}
              </button>

              <button
                onClick={() => toggleActive(rem)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                  rem.active
                    ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {rem.active ? 'Active' : 'Deactivated'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingReminder ? 'Edit Reminder' : 'Add Medicine Reminder'}
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Paracetamol 650mg"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="1 tablet"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    required
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Take after meals with water"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all mt-2"
              >
                {editingReminder ? 'Update Reminder' : 'Save Reminder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
