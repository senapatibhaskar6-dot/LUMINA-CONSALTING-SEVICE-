import React from 'react';
import { GEM_BID_NUMBER, INSTITUTION_NAME, AGENCY_NAME, AGENCY_ADDRESS } from '../data/assamDistricts';
import { LUMINA_LOGO_FALLBACK } from '../data/logoData';
import { FileText, Search, Info, BarChart3, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: 'register' | 'receipt' | 'bidInfo';
  setActiveTab: (tab: 'register' | 'receipt' | 'bidInfo') => void;
  hasActiveReceipt: boolean;
  onOpenLookup: () => void;
  submissionsCount: number;
  onOpenTracker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasActiveReceipt,
  onOpenLookup,
  submissionsCount,
  onOpenTracker,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Government Bar */}
      <div className="bg-slate-900 text-slate-100 text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 font-medium">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="truncate">{AGENCY_NAME} · {AGENCY_ADDRESS}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-300 shrink-0">
          <span>GeM: <strong className="text-white font-mono">{GEM_BID_NUMBER}</strong></span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white p-0.5 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
            <img
              src={LUMINA_LOGO_FALLBACK}
              alt="Lumina Business Consulting Services Logo"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
              {AGENCY_NAME}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-600 font-semibold truncate">
              Security Agency Interview · {INSTITUTION_NAME}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('register')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'register'
                ? 'text-sky-900 border-b-2 border-sky-800 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            New Application
          </button>
          
          <button
            onClick={() => setActiveTab('bidInfo')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bidInfo'
                ? 'text-sky-900 border-b-2 border-sky-800 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>GeM Bid Details</span>
          </button>

          {hasActiveReceipt && (
            <button
              onClick={() => setActiveTab('receipt')}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'receipt'
                  ? 'text-sky-900 border-b-2 border-sky-800 font-semibold'
                : 'hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Current Receipt</span>
            </button>
          )}
        </nav>

        {/* Action Buttons Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* TRACK RECORD SWITCH BUTTON (Requested by user) */}
          <button
            type="button"
            onClick={onOpenTracker}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-sky-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] rounded-xl transition-all cursor-pointer shadow-xs border border-amber-500/30"
            title="Click to view total form submissions and applicant track record"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span className="hidden sm:inline">Track Record:</span>
            <span className="bg-slate-950 text-amber-300 font-mono text-[11px] px-1.5 py-0.5 rounded-md font-extrabold">
              {submissionsCount}
            </span>
            <span className="hidden md:inline text-[11px] text-slate-900">Submitted</span>
          </button>

          {/* Find Receipt Button */}
          <button
            onClick={onOpenLookup}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Retrieve previous registration and payment receipt"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Find Receipt</span>
            <span className="sm:hidden">Find</span>
          </button>
        </div>
      </div>
    </header>
  );
};
