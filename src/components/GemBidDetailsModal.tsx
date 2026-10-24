import React from 'react';
import { GEM_BID_NUMBER, INSTITUTION_NAME, INSTITUTION_FULL_NAME, SALARY_MATRIX, APPLICATION_FEE, AGENCY_NAME, AGENCY_ADDRESS } from '../data/assamDistricts';
import { X, Shield, FileText, CheckCircle2, Building, IndianRupee, Clock, AlertCircle } from 'lucide-react';

interface GemBidDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNow: () => void;
}

export const GemBidDetailsModal: React.FC<GemBidDetailsModalProps> = ({
  isOpen,
  onClose,
  onApplyNow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-300 font-bold">
              Government e-Marketplace (GeM) Bid Notification
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              GeM Bid Number: {GEM_BID_NUMBER}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Service Provider: {AGENCY_NAME} ({AGENCY_ADDRESS})
            </p>
            <p className="text-[11px] text-slate-400">
              Deployment Location: {INSTITUTION_NAME}, Assam
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          {/* Key Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Service Provider:</span>
              <span className="font-bold text-slate-900 text-xs">{AGENCY_NAME}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Buyer Department:</span>
              <span className="font-bold text-slate-900 text-xs">Health & FW, Assam</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Deploying Hospital:</span>
              <span className="font-bold text-slate-900 text-xs">BMCH Barpeta</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Application Fee:</span>
              <span className="font-bold text-emerald-800 text-xs">Rs. {APPLICATION_FEE}.00 (Online)</span>
            </div>
          </div>

          {/* Position 1: Security Supervisor */}
          <div className="border border-sky-200 rounded-xl p-4 bg-sky-50/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-900" />
                <h3 className="text-sm font-bold text-slate-900">
                  Position 1: Security Supervisor
                </h3>
              </div>
              <span className="font-mono font-bold text-base text-sky-950 flex items-center">
                <IndianRupee className="w-3.5 h-3.5" /> 26,178 / Month
              </span>
            </div>
            <p className="text-slate-600">
              Salary: {SALARY_MATRIX['Security Supervisor'].monthlySalary} ({SALARY_MATRIX['Security Supervisor'].note})
            </p>
            <div className="text-slate-600">
              <strong>Mandatory Qualification:</strong> Minimum 10th / 12th Pass or Ex-Defense + Prior Supervisory experience + Valid Driving License.
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              {SALARY_MATRIX['Security Supervisor'].responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Position 2: Unarmed Security Guard */}
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-900" />
                <h3 className="text-sm font-bold text-slate-900">
                  Position 2: Unarmed Security Guard
                </h3>
              </div>
              <span className="font-mono font-bold text-base text-emerald-950 flex items-center">
                <IndianRupee className="w-3.5 h-3.5" /> 17,756 / Month
              </span>
            </div>
            <p className="text-slate-600">
              Salary: {SALARY_MATRIX['Unarmed Security Guard'].monthlySalary} ({SALARY_MATRIX['Unarmed Security Guard'].note})
            </p>
            <div className="text-slate-600">
              <strong>Mandatory Qualification:</strong> Minimum 10th Pass (HSLC) + Good physical fitness.
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              {SALARY_MATRIX['Unarmed Security Guard'].responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Duty Shift Guidelines */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <Clock className="w-4 h-4 text-sky-800" />
              <span>Hospital Duty Shift Schedule (24x7 Round-the-Clock)</span>
            </div>
            <p className="text-slate-600">
              All personnel will be deployed across three continuous 8-hour shifts to ensure zero unattended emergency spots at Barpeta Medical College:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-medium">
              <div className="p-2 bg-white rounded border border-slate-200 text-center">
                <strong>Shift A (Morning)</strong>
                <div className="text-slate-500 font-mono">06:00 to 14:00</div>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 text-center">
                <strong>Shift B (Evening)</strong>
                <div className="text-slate-500 font-mono">14:00 to 22:00</div>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 text-center">
                <strong>Shift C (Night)</strong>
                <div className="text-slate-500 font-mono">22:00 to 06:00</div>
              </div>
            </div>
          </div>

          {/* Post-Registration & Interview notice */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Interview Communication Protocol</span>
            </div>
            <p className="text-amber-950 font-medium">
              1. Interview date and details will be communicated soon to your provided phone number via SMS and official call letter.
            </p>
            <p className="text-amber-950 font-medium">
              2. Please bring your payment receipt along with you on the day of the interview, along with original proof of Age, Qualification, and Aadhaar Card.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onApplyNow();
            }}
            className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 bg-sky-900 hover:bg-sky-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
          >
            Proceed to Registration Form →
          </button>
        </div>
      </div>
    </div>
  );
};
