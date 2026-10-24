import React, { useState } from 'react';
import { ApplicationRecord } from '../types';
import { Search, X, FileText, ArrowRight, AlertCircle, Phone, CreditCard } from 'lucide-react';

interface LookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRecords: ApplicationRecord[];
  onSelectRecord: (record: ApplicationRecord) => void;
}

export const LookupModal: React.FC<LookupModalProps> = ({
  isOpen,
  onClose,
  allRecords,
  onSelectRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const filtered = allRecords.filter((rec) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      rec.registrationId.toLowerCase().includes(term) ||
      rec.formData.contactNumber.includes(term) ||
      rec.formData.aadhaarNumber.includes(term) ||
      rec.formData.fullName.toLowerCase().includes(term) ||
      rec.payment.transactionId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto my-0 sm:my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-300 shrink-0" />
            <h3 className="text-sm font-bold truncate">Find Registration & Payment Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-slate-500">
            Enter your 10-digit mobile number, Aadhaar number, candidate name, or Registration ID to retrieve your official receipt.
          </p>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHasSearched(true);
              }}
              placeholder="Search by Mobile, Aadhaar, Name or Reg No..."
              className="w-full pl-10 pr-4 py-3 min-h-[46px] rounded-xl border border-slate-300 text-base sm:text-sm outline-none focus:border-sky-800"
              autoFocus
            />
          </div>

          {/* Results list */}
          <div className="max-h-72 overflow-y-auto space-y-2 pt-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>No matching registrations found.</span>
              </div>
            ) : (
              filtered.map((rec) => (
                <div
                  key={rec.registrationId}
                  onClick={() => {
                    onSelectRecord(rec);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-800 hover:bg-sky-50/40 active:bg-sky-100 transition-all cursor-pointer flex items-center justify-between touch-manipulation"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {rec.formData.fullName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 shrink-0">
                        PAID ₹200
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
                      <span>Post: <strong className="text-slate-700">{rec.formData.position}</strong></span>
                      <span>·</span>
                      <span>Mob: +91 {rec.formData.contactNumber}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Reg ID: {rec.registrationId}
                    </div>
                  </div>

                  <div className="flex items-center text-sky-900 text-xs font-semibold gap-1 shrink-0">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 sm:px-5 py-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
