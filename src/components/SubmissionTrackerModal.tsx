import React, { useState } from 'react';
import { ApplicationRecord } from '../types';
import {
  Users,
  Search,
  X,
  Shield,
  Download,
  Printer,
  FileText,
  IndianRupee,
  CheckCircle2,
  Calendar,
  Phone,
  ArrowRight,
  Filter,
  BarChart3,
  Hash
} from 'lucide-react';
import { GEM_BID_NUMBER, AGENCY_NAME, INSTITUTION_NAME } from '../data/assamDistricts';

interface SubmissionTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRecords: ApplicationRecord[];
  onSelectRecord: (record: ApplicationRecord) => void;
}

export const SubmissionTrackerModal: React.FC<SubmissionTrackerModalProps> = ({
  isOpen,
  onClose,
  allRecords,
  onSelectRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'Guard' | 'Supervisor'>('ALL');

  if (!isOpen) return null;

  // Filter calculations
  const totalSubmissions = allRecords.length;
  const guardCount = allRecords.filter((r) => r.formData.position === 'Unarmed Security Guard').length;
  const supervisorCount = allRecords.filter((r) => r.formData.position === 'Security Supervisor').length;
  const totalFeeCollected = totalSubmissions * 200;

  // Search and filtered list
  const filteredList = allRecords.filter((rec) => {
    const term = searchTerm.trim().toLowerCase();
    const receiptNo = rec.receiptNumber || `BMCH-REC-2026-${rec.registrationId.replace(/[^0-9]/g, '').slice(-5) || '10294'}`;
    const matchesSearch =
      !term ||
      receiptNo.toLowerCase().includes(term) ||
      rec.registrationId.toLowerCase().includes(term) ||
      rec.formData.fullName.toLowerCase().includes(term) ||
      rec.formData.contactNumber.includes(term) ||
      rec.formData.district.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (selectedFilter === 'Guard') {
      return rec.formData.position === 'Unarmed Security Guard';
    }
    if (selectedFilter === 'Supervisor') {
      return rec.formData.position === 'Security Supervisor';
    }
    return true;
  });

  // Export CSV of all submissions
  const handleExportCsv = () => {
    if (allRecords.length === 0) return;

    const headers = [
      'Sl No',
      'Receipt Number',
      'Registration ID',
      'Candidate Name',
      'Father Name',
      'Mobile Number',
      'Position',
      'District',
      'Submission Date',
      'Cashfree Txn ID',
      'Bank Ref UTR',
      'Fee Paid'
    ];

    const rows = allRecords.map((rec, index) => {
      const receiptNo = rec.receiptNumber || `BMCH-REC-2026-${rec.registrationId.replace(/[^0-9]/g, '').slice(-5) || '10294'}`;
      return [
        index + 1,
        `"${receiptNo}"`,
        `"${rec.registrationId}"`,
        `"${rec.formData.fullName}"`,
        `"${rec.formData.fatherName}"`,
        `"${rec.formData.contactNumber}"`,
        `"${rec.formData.position}"`,
        `"${rec.formData.district}"`,
        `"${new Date(rec.createdAt).toLocaleString('en-IN')}"`,
        `"${rec.payment.transactionId}"`,
        `"${rec.payment.bankRefNo}"`,
        `"200.00"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BMCH_Security_Applicants_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs no-print overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-4 sm:p-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Application Track Record & Roster
                  </h2>
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-sky-200">
                  {AGENCY_NAME} · {INSTITUTION_NAME} (GeM: {GEM_BID_NUMBER})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metric KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-2 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-[11px] font-bold text-sky-200 uppercase tracking-wider">
                মুঠ আবেদন (Total)
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono mt-0.5">
                {totalSubmissions}
              </div>
              <div className="text-[10px] text-slate-300">Candidates Applied</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-[11px] font-bold text-sky-200 uppercase tracking-wider">
                নিৰাপত্তা ৰক্ষী (Guards)
              </div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {guardCount}
              </div>
              <div className="text-[10px] text-slate-300">₹17,756/Month Post</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-[11px] font-bold text-sky-200 uppercase tracking-wider">
                অধীক্ষক (Supervisors)
              </div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {supervisorCount}
              </div>
              <div className="text-[10px] text-slate-300">₹26,178/Month Post</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-[11px] font-bold text-sky-200 uppercase tracking-wider">
                Fee Collection
              </div>
              <div className="text-2xl font-black text-emerald-300 font-mono mt-0.5">
                ₹{totalFeeCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-200">Cashfree Verified</div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Receipt No, Reg ID, Name, Phone or District..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-800 focus:border-transparent text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSelectedFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedFilter === 'ALL'
                    ? 'bg-sky-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalSubmissions})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('Guard')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedFilter === 'Guard'
                    ? 'bg-sky-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Guards ({guardCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('Supervisor')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedFilter === 'Supervisor'
                    ? 'bg-sky-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Supervisors ({supervisorCount})
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={totalSubmissions === 0}
              className="px-3 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Download Master Roster CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Candidate List Roster */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">
                {totalSubmissions === 0 ? 'No applications submitted yet' : 'No matching candidates found'}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {totalSubmissions === 0
                  ? 'As candidates complete the application and fee payment, their records will appear here in real-time.'
                  : 'Try searching with a different mobile number, name, or receipt number.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredList.map((rec, idx) => {
                const receiptNo = rec.receiptNumber || `BMCH-REC-2026-${rec.registrationId.replace(/[^0-9]/g, '').slice(-5) || '10294'}`;
                return (
                  <div
                    key={rec.registrationId}
                    className="p-3.5 bg-white hover:bg-sky-50/40 rounded-xl border border-slate-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded">
                          #{idx + 1}
                        </span>
                        <span className="font-extrabold text-sm text-slate-950">
                          {rec.formData.fullName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          FEE PAID ₹200
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {rec.formData.gender} · {rec.formData.district}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Post:</span>
                          <strong className="text-slate-800">{rec.formData.position}</strong>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>+91 {rec.formData.contactNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(rec.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Receipt & Reg ID Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span>Receipt: {receiptNo}</span>
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                          Reg: {rec.registrationId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                          Txn: {rec.payment.transactionId}
                        </span>
                      </div>
                    </div>

                    {/* Action to view / print that receipt */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRecord(rec);
                        onClose();
                      }}
                      className="w-full sm:w-auto px-4 py-2 min-h-[38px] bg-sky-900 hover:bg-sky-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Receipt (ৰচিদ)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Track Record auto-syncs with browser storage & Cashfree records.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Close Track Record
          </button>
        </div>
      </div>
    </div>
  );
};
