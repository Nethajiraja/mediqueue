import React from 'react';
import {
  Activity,
  Clock,
  Pill,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Users,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onBookClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onBookClick }) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 md:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Smart Healthcare Management System
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Smart Patient Queue & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Medicine Reminder System
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl leading-relaxed">
            Eliminate long wait times at clinics. Track live queue positions, receive estimated wait times in real-time, and manage daily medicine reminders seamlessly.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <button
              onClick={onRegister}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
            <button
              onClick={onLogin}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700/80 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
            >
              Sign In to Dashboard
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
            <div>
              <div className="text-2xl font-extrabold text-blue-400">7 Mins</div>
              <div className="text-xs text-slate-400 mt-0.5">Avg Wait Calculation</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Real-Time Queue Sync</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-teal-400">Digital QR</div>
              <div className="text-xs text-slate-400 mt-0.5">Instant Check-In</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Queue Demo Banner */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-md">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Live Interactive Demo
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Experience Real-Time Token Queue Tracking
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Patients receive a digital token upon booking (e.g. A-27) and can monitor currently served token (A-23), position (#4), and estimated wait time (28 mins) without manual page refreshes.
            </p>
          </div>

          {/* Card Mockup */}
          <div className="w-full md:w-96 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-800/90 rounded-2xl p-5 border border-blue-200 dark:border-blue-900/50 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-slate-700/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Dr. Kumar • Cardiology</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Consultation Queue</h4>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold animate-pulse">
                LIVE NOW
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-medium text-slate-500">Currently Serving</span>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">A-23</div>
              </div>
              <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-medium text-slate-500">Your Token</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">A-27</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-slate-950 px-4 py-2.5 rounded-xl text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Patients Ahead: 4</span>
              <span className="text-blue-700 dark:text-blue-300">Est. Wait: ~28 Mins</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Queue Tracking</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Automatically calculates exact position in queue and estimated wait time based on average doctor consultation duration.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Medicine Reminders</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Create dosage schedules, receive browser chime notifications, and mark daily medications as taken.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
            <QrCode className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Doctor Consultation</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Doctors can call next patients, complete consultations, write prescription notes, and view daily statistics.
          </p>
        </div>
      </section>
    </div>
  );
};
