import React from 'react';
import { SecurityPosition } from '../types';
import { SALARY_MATRIX, APPLICATION_FEE } from '../data/assamDistricts';
import { Shield, UserCheck, CheckCircle2, IndianRupee, AlertCircle } from 'lucide-react';

interface PositionSalarySelectorProps {
  selectedPosition: SecurityPosition;
  onChangePosition: (pos: SecurityPosition) => void;
}

export const PositionSalarySelector: React.FC<PositionSalarySelectorProps> = ({
  selectedPosition,
  onChangePosition
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <label className="block text-sm font-bold text-slate-900">
            Select Post / Position Applied For <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500">
            Please choose either Security Supervisor or Unarmed Security Guard as per eligibility.
          </p>
        </div>
        <div className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Non-refundable Application Fee: <strong>Rs. {APPLICATION_FEE}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security Supervisor Card */}
        <div
          onClick={() => onChangePosition('Security Supervisor')}
          className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer bg-white ${
            selectedPosition === 'Security Supervisor'
              ? 'border-sky-800 ring-2 ring-sky-800/10 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedPosition === 'Security Supervisor'
                    ? 'bg-sky-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Security Supervisor
                </h3>
                <span className="text-xs text-sky-800 font-semibold">
                  Officer / Supervisory Grade
                </span>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                selectedPosition === 'Security Supervisor'
                  ? 'bg-sky-800 text-white'
                  : 'border border-slate-300'
              }`}
            >
              {selectedPosition === 'Security Supervisor' && (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Salary Highlight Box */}
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-600">Monthly Remuneration:</span>
              <span className="text-lg font-bold text-slate-900 font-mono flex items-center">
                <IndianRupee className="w-4 h-4 inline" /> 26,178/-
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {SALARY_MATRIX['Security Supervisor'].note}
            </p>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-700"></span>
              <span>Driving License mandatory for this role</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>Duty: 3 Rotating Shifts (24x7 Coverage) at BMCH</span>
            </div>
          </div>
        </div>

        {/* Unarmed Security Guard Card */}
        <div
          onClick={() => onChangePosition('Unarmed Security Guard')}
          className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer bg-white ${
            selectedPosition === 'Unarmed Security Guard'
              ? 'border-sky-800 ring-2 ring-sky-800/10 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedPosition === 'Unarmed Security Guard'
                    ? 'bg-sky-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Unarmed Security Guard
                </h3>
                <span className="text-xs text-emerald-800 font-semibold">
                  Field Guarding Grade
                </span>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                selectedPosition === 'Unarmed Security Guard'
                  ? 'bg-sky-800 text-white'
                  : 'border border-slate-300'
              }`}
            >
              {selectedPosition === 'Unarmed Security Guard' && (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Salary Highlight Box */}
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-600">Monthly Remuneration:</span>
              <span className="text-lg font-bold text-slate-900 font-mono flex items-center">
                <IndianRupee className="w-4 h-4 inline" /> 17,756/-
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {SALARY_MATRIX['Unarmed Security Guard'].note}
            </p>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
              <span>Open to 10th Pass candidates with good physical fitness</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>Duty: 3 Rotating Shifts (24x7 Coverage) at BMCH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
