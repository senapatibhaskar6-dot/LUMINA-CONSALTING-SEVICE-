/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RegistrationFormData, PaymentDetails, ApplicationRecord } from './types';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { PaymentModal } from './components/PaymentModal';
import { PaymentReceipt } from './components/PaymentReceipt';
import { SmsNotificationModal } from './components/SmsNotificationModal';
import { LookupModal } from './components/LookupModal';
import { GemBidDetailsModal } from './components/GemBidDetailsModal';
import { SubmissionTrackerModal } from './components/SubmissionTrackerModal';
import {
  GEM_BID_NUMBER,
  INSTITUTION_NAME,
  INSTITUTION_FULL_NAME,
  SALARY_MATRIX,
  APPLICATION_FEE,
  AGENCY_NAME,
  AGENCY_ADDRESS,
  REGISTRATION_LAST_DATE,
  REGISTRATION_LAST_DATE_DISPLAY
} from './data/assamDistricts';
import { LUMINA_LOGO_FALLBACK } from './data/logoData';
import {
  Shield,
  Building2,
  Calendar,
  IndianRupee,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileText,
  Search,
  ChevronRight,
  ExternalLink,
  Users,
  Clock,
  BarChart3,
  Home
} from 'lucide-react';

const STORAGE_KEY = 'bmch_security_registrations_2026';

export default function App() {
  const [activeTab, setActiveTab] = useState<'register' | 'receipt' | 'bidInfo'>('register');
  const [formKey, setFormKey] = useState(0);
  const [allRecords, setAllRecords] = useState<ApplicationRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Remove any legacy demo seed data
          return parsed.filter(
            (r: ApplicationRecord) => r.registrationId !== 'BMCH-SEC-2026-08492'
          );
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [currentRecord, setCurrentRecord] = useState<ApplicationRecord | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const liveRecords = parsed.filter(
            (r: ApplicationRecord) => r.registrationId !== 'BMCH-SEC-2026-08492'
          );
          return liveRecords[0] || null;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [pendingFormData, setPendingFormData] = useState<RegistrationFormData | null>(null);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [isBidDetailsOpen, setIsBidDetailsOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Sync with browser history and hash navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'register' || hash === 'receipt' || hash === 'bidInfo') {
        setActiveTab(hash as any);
      }
    };
    if (window.location.hash) {
      handleHash();
    }
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Check for Cashfree order return in URL parameters (?order_id=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('order_id');
    if (orderIdParam) {
      fetch(`/api/verify-cashfree-order?order_id=${encodeURIComponent(orderIdParam)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.isPaid) {
            const randomSuffix = Math.floor(10000 + Math.random() * 90000);
            const newRegId = `LUMINA-SEC-2026-${randomSuffix}`;
            const newReceiptNo = `LUMINA-REC-2026-${randomSuffix}`;
            const txnId = data.payment?.cf_payment_id || `CF_${orderIdParam}`;
            const bankRef = data.payment?.bank_reference || `REF_${orderIdParam}`;

            setAllRecords((prev) => {
              const exists = prev.find((r) => r.payment.orderId === orderIdParam);
              if (exists) {
                setCurrentRecord(exists);
                return prev;
              }
              const newRec: ApplicationRecord = {
                registrationId: newRegId,
                receiptNumber: newReceiptNo,
                createdAt: new Date().toISOString(),
                formData: pendingFormData || {
                  position: 'Unarmed Security Guard',
                  fullName: data.payment?.customer_name || 'Registered Applicant',
                  fatherName: 'Not Specified',
                  dob: '2000-01-01',
                  gender: 'Male',
                  qualification: 'HSLC / 10th Passed',
                  villageTown: 'Barpeta Town',
                  postOffice: 'Barpeta',
                  district: 'Barpeta',
                  pinCode: '781301',
                  contactNumber: data.payment?.customer_phone || '9876543210',
                  aadhaarNumber: 'XXXX-XXXX-XXXX',
                  email: data.payment?.customer_email || 'applicant@gmail.com',
                  experienceYears: '0',
                  isExServicemen: 'No',
                  drivingLicenseNo: '',
                  drivingLicenseValidUpTo: '',
                  acceptedDeclaration: true,
                },
                payment: {
                  transactionId: txnId,
                  orderId: orderIdParam,
                  amount: data.amount || 200,
                  currency: 'INR',
                  paymentMethod: 'UPI',
                  paymentGateway: 'Cashfree Payments',
                  status: 'SUCCESS',
                  paidAt: new Date().toISOString(),
                  bankRefNo: bankRef,
                  upiIdOrCardLast4: 'Cashfree Verified',
                },
                smsSent: true,
                smsTimestamp: new Date().toISOString(),
              };
              setCurrentRecord(newRec);
              return [newRec, ...prev];
            });

            try {
              confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
            } catch {}
            setActiveTab('receipt');
            setIsSmsModalOpen(true);
            window.history.replaceState({}, '', window.location.pathname + '#receipt');
          }
        })
        .catch((err) => {
          console.error('Error verifying returned Cashfree order:', err);
        });
    }
  }, [pendingFormData]);

  const navigateToTab = (tab: 'register' | 'receipt' | 'bidInfo') => {
    setActiveTab(tab);
    window.location.hash = '#' + tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToMainMenu = () => {
    setIsSmsModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsLookupModalOpen(false);
    setIsBidDetailsOpen(false);
    setIsTrackerOpen(false);
    setPendingFormData(null);
    setFormKey((prev) => prev + 1);
    navigateToTab('register');
    if (typeof window !== 'undefined') {
      window.location.hash = '#register';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
    } catch {
      // ignore
    }
  }, [allRecords]);

  // Initiate payment flow
  const handleFormSubmit = (formData: RegistrationFormData) => {
    setPendingFormData(formData);
    setIsPaymentModalOpen(true);
  };

  // Payment completed callback
  const handlePaymentSuccess = (payment: PaymentDetails) => {
    if (!pendingFormData) return;

    // Generate unique registration ID and Official Receipt Number with LUMINA prefix
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newRegId = `LUMINA-SEC-2026-${randomSuffix}`;
    const newReceiptNo = `LUMINA-REC-2026-${randomSuffix}`;

    const newRecord: ApplicationRecord = {
      registrationId: newRegId,
      receiptNumber: newReceiptNo,
      createdAt: new Date().toISOString(),
      formData: pendingFormData,
      payment,
      smsSent: true,
      smsTimestamp: new Date().toISOString(),
    };

    // Update state
    setAllRecords((prev) => [newRecord, ...prev]);
    setCurrentRecord(newRecord);
    setIsPaymentModalOpen(false);
    setPendingFormData(null);

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Switch to receipt and automatically pop up the SMS Notification modal
    navigateToTab('receipt');
    setIsSmsModalOpen(true);
  };

  const handleSelectRecordFromLookup = (rec: ApplicationRecord) => {
    setCurrentRecord(rec);
    navigateToTab('receipt');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-200">
      {/* Official Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'register') {
            handleGoToMainMenu();
          } else if (tab === 'bidInfo') {
            setIsBidDetailsOpen(true);
          } else {
            navigateToTab(tab);
          }
        }}
        hasActiveReceipt={!!currentRecord}
        onOpenLookup={() => setIsLookupModalOpen(true)}
        submissionsCount={allRecords.length}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-8">
        {activeTab === 'register' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Hero Banner */}
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 text-white">
              {/* Subtle background */}
              <div className="absolute inset-0">
                <img
                  src={LUMINA_LOGO_FALLBACK}
                  alt="Lumina Business Consulting Services"
                  className="w-full h-full object-cover opacity-10 filter blur-xs"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950/90" />
              </div>

              {/* Banner Content */}
              <div className="relative z-10 p-4 sm:p-8 space-y-4">
                {/* Logo & Agency Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl p-1 shadow-md flex items-center justify-center shrink-0">
                    <img
                      src={LUMINA_LOGO_FALLBACK}
                      alt="Lumina Business Consulting Services"
                      className="w-full h-full object-contain"
                      loading="eager"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold mb-1">
                      <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] sm:text-xs tracking-wide truncate max-w-[200px] sm:max-w-none">
                        {AGENCY_NAME}
                      </span>
                      <span className="bg-sky-500/20 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded text-[10px] sm:text-xs">
                        Bid: {GEM_BID_NUMBER}
                      </span>
                      <span className="bg-rose-500 text-white font-extrabold px-2.5 py-0.5 rounded text-[10px] sm:text-xs flex items-center gap-1 shadow-xs border border-rose-400">
                        <Calendar className="w-3 h-3 text-white shrink-0" />
                        <span>অন্তিম তাৰিখ: {REGISTRATION_LAST_DATE}</span>
                      </span>
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">
                      {AGENCY_ADDRESS}
                    </div>
                  </div>
                </div>

                {/* Primary Heading */}
                <div>
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    Security Agency Interview Application Form
                  </h1>
                  <div className="text-xs sm:text-sm font-semibold text-amber-300 mt-1">
                    Application Form for Security Agency Interview · Deployment at {INSTITUTION_NAME}
                  </div>
                </div>

                {/* Live Track Record Bar (User Request) */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/10 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/15">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-slate-200">মুঠ জমা হোৱা আবেদন (Total Registered):</span>
                    <strong className="text-amber-300 font-mono text-sm sm:text-base font-extrabold">
                      {allRecords.length}
                    </strong>
                    <span className="text-slate-300">জন প্ৰাৰ্থী</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTrackerOpen(true)}
                    className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-slate-950" />
                    <span>Track Record Switch (ট্ৰেক ৰেকৰ্ড)</span>
                  </button>
                </div>

                {/* Key Remuneration, Fee & Deadline Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                  <div className="bg-white/10 backdrop-blur-xs p-3 sm:p-3.5 rounded-xl border border-white/10">
                    <div className="text-xs text-sky-200 font-semibold">Security Supervisor</div>
                    <div className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-1">
                      <IndianRupee className="w-4 h-4 shrink-0" /> 26,178 / Month
                    </div>
                    <div className="text-[11px] text-slate-300">Driving License Required</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3 sm:p-3.5 rounded-xl border border-white/10">
                    <div className="text-xs text-emerald-200 font-semibold">Unarmed Security Guard</div>
                    <div className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-1">
                      <IndianRupee className="w-4 h-4 shrink-0" /> 17,756 / Month
                    </div>
                    <div className="text-[11px] text-slate-300">10th Pass / Fitness Standard</div>
                  </div>

                  <div className="bg-amber-500/20 backdrop-blur-xs p-3 sm:p-3.5 rounded-xl border border-amber-400/30">
                    <div className="text-xs text-amber-200 font-semibold">Application Form Fee</div>
                    <div className="text-base sm:text-lg font-bold text-amber-300 font-mono">
                      Rs. {APPLICATION_FEE}.00
                    </div>
                    <div className="text-[11px] text-amber-200/80">Cashfree Live Gateway / Receipt</div>
                  </div>

                  {/* USER REQUESTED: Registration Last Date 31/11/2026 */}
                  <div className="bg-rose-500/25 backdrop-blur-xs p-3 sm:p-3.5 rounded-xl border-2 border-rose-400/60 shadow-xs">
                    <div className="text-xs text-rose-200 font-extrabold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                      <span>Registration Last Date</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-white font-mono tracking-wider">
                      {REGISTRATION_LAST_DATE}
                    </div>
                    <div className="text-[11px] text-rose-200 font-medium">
                      আবেদনৰ শেষ তাৰিখ: ৩১/১১/২০২৬
                    </div>
                  </div>
                </div>

                {/* Interview & Last Date Notice */}
                <div className="bg-amber-400/15 border border-amber-400/40 p-3 sm:p-3.5 rounded-xl flex items-start sm:items-center gap-2.5 text-xs text-amber-100 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <span className="leading-relaxed">
                    <strong>Notice:</strong> This form is strictly for the Security Agency Interview. Candidate Registration Last Date is <strong className="text-amber-300 underline underline-offset-2">{REGISTRATION_LAST_DATE}</strong>. Interview date and details will be communicated soon to your registered phone number.
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Form Component */}
            <RegistrationForm key={formKey} onSubmit={handleFormSubmit} />
          </div>
        )}

        {activeTab === 'receipt' && (
          currentRecord ? (
            <PaymentReceipt
              record={currentRecord}
              onOpenSms={() => setIsSmsModalOpen(true)}
              onNewRegistration={handleGoToMainMenu}
              onBackToHome={handleGoToMainMenu}
            />
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-12 border border-slate-200 text-center max-w-xl mx-auto shadow-xs space-y-4">
              <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto text-sky-900 border border-sky-100">
                <FileCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Application & Payment Receipt Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  No active receipt loaded. If you have already applied and paid the Rs. 200 fee, search using your mobile number or receipt number.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLookupModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 min-h-[46px] bg-sky-900 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Find My Receipt / Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTrackerOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 min-h-[46px] bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Track Record</span>
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print mt-12 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="font-bold text-slate-900 text-sm">
              {AGENCY_NAME}
            </div>
            <div className="font-medium text-slate-700">
              {AGENCY_ADDRESS}
            </div>
            <div className="text-slate-500">
              Authorized Service Provider for Security Personnel Outsourcing at {INSTITUTION_FULL_NAME} under GeM Bid: <strong className="text-slate-700 font-mono">{GEM_BID_NUMBER}</strong>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('register')}
              className="text-sky-900 hover:underline font-semibold cursor-pointer"
            >
              মূল মেনু / Home
            </button>
            <span>·</span>
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="text-sky-900 hover:underline font-semibold cursor-pointer"
            >
              Track Record ({allRecords.length})
            </button>
            <span>·</span>
            <button
              onClick={() => setIsBidDetailsOpen(true)}
              className="text-sky-900 hover:underline font-medium cursor-pointer"
            >
              GeM Terms
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg no-print">
        <div className="grid grid-cols-4 items-center h-14">
          <button
            type="button"
            onClick={handleGoToMainMenu}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer touch-manipulation transition-colors ${
              activeTab === 'register' ? 'text-sky-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'register' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">মূল পৃষ্ঠা</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentRecord) {
                navigateToTab('receipt');
              } else {
                setIsLookupModalOpen(true);
              }
            }}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer touch-manipulation transition-colors ${
              activeTab === 'receipt' ? 'text-sky-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className={`w-5 h-5 ${activeTab === 'receipt' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">ৰচিদ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTrackerOpen(true)}
            className="flex flex-col items-center justify-center h-full min-h-[44px] text-amber-600 hover:text-amber-800 cursor-pointer touch-manipulation transition-colors font-bold"
          >
            <div className="relative">
              <BarChart3 className="w-5 h-5 stroke-2" />
              <span className="absolute -top-1.5 -right-2 bg-slate-900 text-amber-300 text-[9px] font-mono px-1 rounded-full">
                {allRecords.length}
              </span>
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">ট্ৰেক ৰেকৰ্ড</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLookupModalOpen(true)}
            className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 hover:text-slate-800 cursor-pointer touch-manipulation transition-colors"
          >
            <Search className="w-5 h-5 stroke-2" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">সন্ধান</span>
          </button>
        </div>
      </nav>

      {/* Cashfree Payment Gateway Checkout Modal */}
      {isPaymentModalOpen && pendingFormData && (
        <PaymentModal
          formData={pendingFormData}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* SMS Confirmation Modal / Notification Dispatch */}
      {isSmsModalOpen && currentRecord && (
        <SmsNotificationModal
          record={currentRecord}
          isOpen={isSmsModalOpen}
          onClose={() => setIsSmsModalOpen(false)}
          onBackToHome={handleGoToMainMenu}
          onResendSms={() => {
            // Show temporary status
          }}
        />
      )}

      {/* Search / Lookup Modal */}
      <LookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        allRecords={allRecords}
        onSelectRecord={handleSelectRecordFromLookup}
      />

      {/* Submission Track Record Modal */}
      <SubmissionTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        allRecords={allRecords}
        onSelectRecord={handleSelectRecordFromLookup}
      />

      {/* GeM Bid Details Modal */}
      <GemBidDetailsModal
        isOpen={isBidDetailsOpen}
        onClose={() => setIsBidDetailsOpen(false)}
        onApplyNow={() => setActiveTab('register')}
      />
    </div>
  );
}
