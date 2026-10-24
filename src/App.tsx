/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RegistrationFormData, PaymentDetails, ApplicationRecord, SecurityPosition } from './types';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { PaymentModal } from './components/PaymentModal';
import { PaymentReceipt } from './components/PaymentReceipt';
import { SmsNotificationModal } from './components/SmsNotificationModal';
import { LookupModal } from './components/LookupModal';
import { GemBidDetailsModal } from './components/GemBidDetailsModal';
import {
  GEM_BID_NUMBER,
  INSTITUTION_NAME,
  INSTITUTION_FULL_NAME,
  SALARY_MATRIX,
  APPLICATION_FEE,
  AGENCY_NAME,
  AGENCY_ADDRESS
} from './data/assamDistricts';
import {
  Shield,
  Building2,
  Calendar,
  IndianRupee,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Users,
  Clock
} from 'lucide-react';

const STORAGE_KEY = 'bmch_security_registrations_2026';

// Seed initial sample record if none exists so users can explore immediately
const INITIAL_SEED_RECORDS: ApplicationRecord[] = [
  {
    registrationId: 'BMCH-SEC-2026-08492',
    createdAt: '2026-10-22T10:30:00.000Z',
    formData: {
      position: 'Security Supervisor',
      fullName: 'BHASKAR JYOTI KALITA',
      fatherName: 'Late Bipul Chandra Kalita',
      dob: '1992-05-14',
      gender: 'Male',
      qualification: 'Graduate (BA / B.Sc / B.Com / BCA)',
      villageTown: 'Barpeta Town, Ward No 4',
      postOffice: 'Barpeta P.O.',
      district: 'Barpeta',
      pinCode: '781301',
      contactNumber: '9864201934',
      aadhaarNumber: '748291038491',
      email: 'bhaskar.sec.bmch@gmail.com',
      experienceYears: '4',
      isExServicemen: 'No',
      exServicemenDetails: '',
      drivingLicenseNo: 'AS-15-20150029381',
      drivingLicenseValidUpTo: '2029-08-20',
      acceptedDeclaration: true,
    },
    payment: {
      transactionId: 'CF98234KLA82',
      orderId: 'ORD_BMCH_728194',
      amount: 200,
      currency: 'INR',
      paymentMethod: 'UPI',
      paymentGateway: 'Cashfree Payments',
      status: 'SUCCESS',
      paidAt: '2026-10-22T10:31:45.000Z',
      bankRefNo: 'UTR492810394812',
      upiIdOrCardLast4: '9864201934@upi',
    },
    smsSent: true,
    smsTimestamp: '2026-10-22T10:31:48.000Z',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'register' | 'receipt' | 'bidInfo'>('register');
  const [allRecords, setAllRecords] = useState<ApplicationRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_SEED_RECORDS;
  });

  const [currentRecord, setCurrentRecord] = useState<ApplicationRecord | null>(
    INITIAL_SEED_RECORDS[0] || null
  );
  const [pendingFormData, setPendingFormData] = useState<RegistrationFormData | null>(null);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [isBidDetailsOpen, setIsBidDetailsOpen] = useState(false);

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

    // Generate unique registration ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newRegId = `BMCH-SEC-2026-${randomSuffix}`;

    const newRecord: ApplicationRecord = {
      registrationId: newRegId,
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
    setActiveTab('receipt');
    setIsSmsModalOpen(true);
  };

  const handleSelectRecordFromLookup = (rec: ApplicationRecord) => {
    setCurrentRecord(rec);
    setActiveTab('receipt');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-200">
      {/* Official Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'bidInfo') {
            setIsBidDetailsOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        hasActiveReceipt={!!currentRecord}
        onOpenLookup={() => setIsLookupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'register' && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 text-white">
              {/* Subtle background */}
              <div className="absolute inset-0">
                <img
                  src="/src/assets/images/lumina_logo.jpeg"
                  alt="Lumina Business Consulting Services"
                  className="w-full h-full object-cover opacity-10 filter blur-xs"
                />
                <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-900/95 to-slate-950/90" />
              </div>

              {/* Banner Content */}
              <div className="relative z-10 p-6 sm:p-8 space-y-4">
                {/* Logo & Agency Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-3 border-b border-white/10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center shrink-0">
                    <img
                      src="/src/assets/images/lumina_logo.jpeg"
                      alt="Lumina Business Consulting Services"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-1">
                      <span className="bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 rounded tracking-wide">
                        {AGENCY_NAME}
                      </span>
                      <span className="bg-sky-500/20 text-sky-200 border border-sky-400/30 px-2.5 py-0.5 rounded">
                        GeM Bid: {GEM_BID_NUMBER}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {AGENCY_ADDRESS}
                    </div>
                  </div>
                </div>

                {/* Primary Heading */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    Security Agency Interview Application Form
                  </h1>
                  <div className="text-xs sm:text-sm font-semibold text-amber-300 mt-1">
                    Application Form for Security Agency Interview · Deployment at {INSTITUTION_NAME}
                  </div>
                </div>

                {/* Key Remuneration & Fee Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                    <div className="text-xs text-sky-200 font-semibold">Security Supervisor</div>
                    <div className="text-lg font-bold text-white font-mono flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" /> 26,178 / Month
                    </div>
                    <div className="text-[11px] text-slate-300">Driving License Required</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                    <div className="text-xs text-emerald-200 font-semibold">Unarmed Security Guard</div>
                    <div className="text-lg font-bold text-white font-mono flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" /> 17,756 / Month
                    </div>
                    <div className="text-[11px] text-slate-300">10th Pass / Fitness Standard</div>
                  </div>

                  <div className="bg-amber-500/20 backdrop-blur-xs p-3.5 rounded-xl border border-amber-400/30">
                    <div className="text-xs text-amber-200 font-semibold">Application Form Fee</div>
                    <div className="text-lg font-bold text-amber-300 font-mono">
                      Rs. {APPLICATION_FEE}.00
                    </div>
                    <div className="text-[11px] text-amber-200/80">Non-refundable / Online Gateway</div>
                  </div>
                </div>

                {/* Interview Notice */}
                <div className="bg-amber-400/15 border border-amber-400/40 p-3.5 rounded-xl flex items-center gap-3 text-xs text-amber-100 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Notice:</strong> This form is strictly for the Security Agency Interview. Interview date and details will be communicated soon to your provided phone number.
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Form Component */}
            <RegistrationForm onSubmit={handleFormSubmit} />
          </div>
        )}

        {activeTab === 'receipt' && currentRecord && (
          <PaymentReceipt
            record={currentRecord}
            onOpenSms={() => setIsSmsModalOpen(true)}
            onNewRegistration={() => setActiveTab('register')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print mt-12">
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
              onClick={() => setIsBidDetailsOpen(true)}
              className="text-sky-900 hover:underline font-medium cursor-pointer"
            >
              GeM Terms & Conditions
            </button>
            <span>·</span>
            <button
              onClick={() => setIsLookupModalOpen(true)}
              className="text-sky-900 hover:underline font-medium cursor-pointer"
            >
              Receipt Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Cashfree Payment Gateway Checkout Modal */}
      {pendingFormData && (
        <PaymentModal
          formData={pendingFormData}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* SMS Confirmation Modal / Notification Dispatch */}
      {currentRecord && (
        <SmsNotificationModal
          record={currentRecord}
          isOpen={isSmsModalOpen}
          onClose={() => setIsSmsModalOpen(false)}
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

      {/* GeM Bid Details Modal */}
      <GemBidDetailsModal
        isOpen={isBidDetailsOpen}
        onClose={() => setIsBidDetailsOpen(false)}
        onApplyNow={() => setActiveTab('register')}
      />
    </div>
  );
}
