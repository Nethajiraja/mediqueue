import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, CheckCircle, Ticket, Stethoscope } from 'lucide-react';
import { Appointment } from '../../types';

interface QRModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ appointment, onClose }) => {
  const qrData = JSON.stringify({
    token: appointment.tokenNumber,
    appointmentId: appointment.id,
    patientName: appointment.patientName,
    doctorName: appointment.doctorName,
    date: appointment.appointmentDate
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Digital Queue Token</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scan at clinic desk or present to doctor on arrival
          </p>
        </div>

        {/* Token Card */}
        <div className="mt-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-6 border border-teal-200 dark:border-teal-900/50 text-center relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            Token Number
          </div>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            {appointment.tokenNumber}
          </div>

          <div className="my-5 flex justify-center bg-white dark:bg-slate-950 p-4 rounded-xl shadow-inner inline-block border border-slate-200 dark:border-slate-800">
            <QRCodeSVG value={qrData} size={160} level="M" includeMargin={true} />
          </div>

          <div className="text-left space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-teal-200/60 dark:border-slate-700/60 pt-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-semibold text-teal-700 dark:text-teal-300">{appointment.doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{appointment.appointmentDate} at {appointment.appointmentTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Queue Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{appointment.status}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Token
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-teal-600/20"
          >
            <CheckCircle className="w-4 h-4" /> Done
          </button>
        </div>
      </div>
    </div>
  );
};
