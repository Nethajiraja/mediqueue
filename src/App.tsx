import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { NotificationBell } from './components/common/NotificationBell';
import { LandingPage } from './components/landing/LandingPage';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { BookAppointment } from './components/patient/BookAppointment';
import { MedicineReminders } from './components/patient/MedicineReminders';
import { AppointmentHistory } from './components/patient/AppointmentHistory';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { DoctorStatistics } from './components/doctor/DoctorStatistics';

const MainAppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Route redirection based on user login & role
  useEffect(() => {
    if (user) {
      if (user.role === 'DOCTOR') {
        if (activeTab === 'landing' || activeTab === 'login' || activeTab === 'register' || activeTab === 'dashboard') {
          setActiveTab('doctor-queue');
        }
      } else if (user.role === 'PATIENT') {
        if (activeTab === 'landing' || activeTab === 'login' || activeTab === 'register' || activeTab === 'doctor-queue') {
          setActiveTab('dashboard');
        }
      }
    } else {
      if (activeTab !== 'login' && activeTab !== 'register') {
        setActiveTab('landing');
      }
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading MediQueue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Landing Page */}
        {!user && activeTab === 'landing' && (
          <LandingPage
            onLogin={() => setActiveTab('login')}
            onRegister={() => setActiveTab('register')}
            onBookClick={() => setActiveTab('login')}
          />
        )}

        {/* Login Form */}
        {!user && activeTab === 'login' && (
          <LoginForm
            onSuccess={() => {}}
            onSwitchToRegister={() => setActiveTab('register')}
          />
        )}

        {/* Register Form */}
        {!user && activeTab === 'register' && (
          <RegisterForm
            onSuccess={() => {}}
            onSwitchToLogin={() => setActiveTab('login')}
          />
        )}

        {/* Patient Views */}
        {user?.role === 'PATIENT' && (
          <>
            {activeTab === 'dashboard' && (
              <PatientDashboard onNavigate={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'book' && (
              <BookAppointment onSuccess={() => setActiveTab('dashboard')} />
            )}

            {activeTab === 'medicines' && <MedicineReminders />}

            {activeTab === 'history' && <AppointmentHistory />}
          </>
        )}

        {/* Doctor Views */}
        {user?.role === 'DOCTOR' && (
          <>
            {activeTab === 'doctor-queue' && <DoctorDashboard />}
            {activeTab === 'doctor-stats' && <DoctorStatistics />}
          </>
        )}
      </main>

      {/* Global In-App Medicine Reminder Notification Sound & Banner */}
      {user?.role === 'PATIENT' && <NotificationBell />}

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
