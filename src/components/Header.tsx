import React from 'react';
import { GEM_BID_NUMBER, INSTITUTION_NAME, AGENCY_NAME, AGENCY_ADDRESS } from '../data/assamDistricts';
import { LUMINA_LOGO_FALLBACK, LUMINA_LOGO_PATH } from '../data/logoData';
import { ShieldCheck, FileText, Search, Info } from 'lucide-react';

interface HeaderProps {
  activeTab: 'register' | 'receipt' | 'bidInfo';
  setActiveTab: (tab: 'register' | 'receipt' | 'bidInfo') => void;
  hasActiveReceipt: boolean;
  onOpenLookup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasActiveReceipt,
  onOpenLookup
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Government Bar */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-4 font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{AGENCY_NAME} · {AGENCY_ADDRESS}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span>GeM Bid Ref: <strong className="text-white font-mono">{GEM_BID_NUMBER}</strong></span>
          <span className="hidden sm:inline">Deployment: BMCH Barpeta</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-8">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-white p-0.5 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
            <img
              src={LUMINA_LOGO_FALLBACK}
              alt="Lumina Business Consulting Services Logo"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
              <span>{AGENCY_NAME}</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              Security Agency Interview Application Form · {INSTITUTION_NAME}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
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

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenLookup}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-200"
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
