import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { DoctorStats } from '../../types';
import { BarChart2, Users, CheckCircle2, Clock, XCircle, Activity, TrendingUp } from 'lucide-react';

export const DoctorStatistics: React.FC = () => {
  const [stats, setStats] = useState<DoctorStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/doctor/statistics');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Analytics & Reports
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Doctor Queue Statistics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time metric breakdown for today's clinic appointments
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold">
          <BarChart2 className="w-6 h-6" />
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-500">Today's Appointments</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalToday}</div>
          <p className="text-[10px] text-blue-600 font-semibold">Total registered tokens</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase text-amber-600">Waiting Patients</span>
          <div className="text-3xl font-black text-amber-600">{stats.waiting}</div>
          <p className="text-[10px] text-slate-500">Active in live queue</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Completed</span>
          <div className="text-3xl font-black text-emerald-600">{stats.completed}</div>
          <p className="text-[10px] text-slate-500">Consultations finished</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase text-rose-500">Cancelled</span>
          <div className="text-3xl font-black text-rose-500">{stats.cancelled}</div>
          <p className="text-[10px] text-slate-500">No-shows / cancelled</p>
        </div>
      </div>

      {/* Additional Visual Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" /> Queue Efficiency Metrics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500">Average Consultation Time</span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              7.0 Minutes / Patient
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Used as the base factor to compute patient wait estimates in real time
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500">Queue Flow Completion Rate</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.totalToday > 0 ? Math.round((stats.completed / stats.totalToday) * 100) : 0}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {stats.completed} of {stats.totalToday} patients served today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
