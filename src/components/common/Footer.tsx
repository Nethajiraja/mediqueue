import React from 'react';
import { Activity, Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">MediQueue</span>
            <p className="text-xs text-slate-500">Smart Patient Queue & Medicine Reminder System</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Secure JWT Role Protection
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" /> for Healthcare
          </span>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} MediQueue. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
