import React from 'react';
import { ApplicationRecord } from '../types';
import { INSTITUTION_FULL_NAME, INSTITUTION_NAME, GEM_BID_NUMBER, SALARY_MATRIX, AGENCY_NAME, AGENCY_ADDRESS } from '../data/assamDistricts';
import {
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  MessageSquare,
  ArrowLeft,
  FileCheck2,
  IndianRupee
} from 'lucide-react';

interface PaymentReceiptProps {
  record: ApplicationRecord;
  onOpenSms: () => void;
  onNewRegistration: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  record,
  onOpenSms,
  onNewRegistration,
}) => {
  const { formData, payment, registrationId, createdAt } = record;
  const salaryInfo = SALARY_MATRIX[formData.position];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onNewRegistration}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Register Another Candidate</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSms}
            className="px-3.5 py-2 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-sky-700" />
            <span>View Sent SMS Alert</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-900 hover:bg-sky-800 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner (hidden in print) */}
      <div className="no-print bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-emerald-900">
            Payment of Rs. 200.00 Received Successfully via Cashfree Payments
          </p>
          <p className="text-emerald-700">
            Registration has been recorded in the BMCH recruitment roster. A confirmation SMS has been automatically dispatched to <strong>+91 {formData.contactNumber}</strong>.
          </p>
        </div>
      </div>

      {/* THE OFFICIAL PRINTABLE RECEIPT */}
      <div className="receipt-container relative bg-white border border-slate-300 rounded-2xl shadow-md p-6 sm:p-10 text-slate-900 overflow-hidden font-sans">
        {/* Subtle Watermark in background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 select-none">
          <img
            src="/src/assets/images/lumina_logo.jpeg"
            alt="Lumina Watermark"
            className="w-96 h-96 object-contain"
          />
        </div>

        {/* Content Container on top of watermark */}
        <div className="relative z-10 space-y-6">
          {/* Top Agency Header */}
          <div className="text-center border-b-2 border-slate-800 pb-5 space-y-3">
            {/* Lumina Agency Official Logo Centered */}
            <div className="flex justify-center mb-1">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
                <img
                  src="/src/assets/images/lumina_logo.jpeg"
                  alt="Lumina Business Consulting Services Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                {AGENCY_NAME}
              </h1>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">
                {AGENCY_ADDRESS}
              </div>
              <div className="text-xs text-sky-950 font-bold mt-1.5">
                Security Agency Interview & Recruitment for {INSTITUTION_NAME}
              </div>
              <div className="text-[11px] text-slate-500">
                {INSTITUTION_FULL_NAME} · Barpeta, Assam - 781301
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="bg-slate-100 border border-slate-300 px-3 py-1 rounded font-semibold text-slate-800">
                GeM Bid Reference: <strong className="font-mono">{GEM_BID_NUMBER}</strong>
              </span>
              <span className="bg-emerald-50 border border-emerald-300 px-3 py-1 rounded font-bold text-emerald-800">
                Payment Status: SUCCESS (PAID)
              </span>
            </div>

            <div className="pt-1 text-sm font-bold uppercase tracking-widest text-sky-950 border-t border-slate-200 mt-3 inline-block px-4">
              Security Agency Interview Registration & Payment Receipt (2026)
            </div>
          </div>

          {/* Registration Key Numbers Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block">Registration Number:</span>
              <span className="font-mono font-bold text-sm text-sky-950">
                {registrationId}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Date & Time of Submission:</span>
              <span className="font-medium text-slate-800">
                {new Date(createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Cashfree Transaction ID:</span>
              <span className="font-mono font-bold text-slate-800">
                {payment.transactionId}
              </span>
            </div>
          </div>

          {/* CRITICAL MANDATORY INTERVIEW NOTICES (Highlighted in Receipt Layout) */}
          <div className="bg-amber-50/90 border-2 border-amber-400 rounded-xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Important Instructions For Candidate (Mandatory)</span>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed">
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-200">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Interview date and details will be communicated soon to your provided phone number (+91 {formData.contactNumber}).
                </span>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-200">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Please bring this payment receipt along with you on the day of the interview.
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Profile & Registration Details Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Candidate Registration Particulars</span>
              <span className="font-mono text-amber-300">GeM Ref: {GEM_BID_NUMBER}</span>
            </div>

            <div className="divide-y divide-slate-200 text-xs">
              {/* Row 1: Position & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                <div className="p-3 bg-sky-50/40">
                  <span className="text-slate-500 block">Post Applied:</span>
                  <span className="font-bold text-sm text-sky-950">
                    {formData.position}
                  </span>
                </div>
                <div className="p-3 bg-sky-50/40">
                  <span className="text-slate-500 block">Monthly Remuneration / Salary:</span>
                  <span className="font-bold text-sm text-slate-900 font-mono">
                    {salaryInfo.monthlySalary} per month
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ({salaryInfo.note})
                  </span>
                </div>
              </div>

              {/* Row 2: Name & Father's Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                <div className="p-3">
                  <span className="text-slate-500 block">Candidate's Full Name (Capital Letters):</span>
                  <span className="font-bold text-slate-950 tracking-wider">
                    {formData.fullName}
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-slate-500 block">Father's / Guardian's Name:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.fatherName}
                  </span>
                </div>
              </div>

              {/* Row 3: DOB & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                <div className="p-3">
                  <span className="text-slate-500 block">Date of Birth:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.dob}
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-slate-500 block">Gender:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.gender}
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-slate-500 block">Educational Qualification:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.qualification}
                  </span>
                </div>
              </div>

              {/* Row 4: Address Details */}
              <div className="p-3">
                <span className="text-slate-500 block">Permanent Address in Assam:</span>
                <span className="font-medium text-slate-900">
                  {formData.villageTown}, P.O.: {formData.postOffice}, District: {formData.district}, Assam - PIN: {formData.pinCode}
                </span>
              </div>

              {/* Row 5: Contact & Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                <div className="p-3">
                  <span className="text-slate-500 block">Registered Mobile Number:</span>
                  <span className="font-mono font-bold text-slate-900">
                    +91 {formData.contactNumber}
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-slate-500 block">Aadhaar / VID Number:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formData.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim()}
                  </span>
                </div>
              </div>

              {/* Row 6: Experience & License */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                <div className="p-3">
                  <span className="text-slate-500 block">Security Experience:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.experienceYears} Years
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-slate-500 block">Ex-Servicemen:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.isExServicemen} {formData.exServicemenDetails ? `(${formData.exServicemenDetails})` : ''}
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-slate-500 block">Driving License:</span>
                  <span className="font-semibold font-mono text-slate-800">
                    {formData.drivingLicenseNo || 'N/A'}
                    {formData.drivingLicenseValidUpTo && ` (Valid to: ${formData.drivingLicenseValidUpTo})`}
                  </span>
                </div>
              </div>

              {/* Row 7: Duty Shift Acceptance */}
              <div className="p-3 bg-slate-50/70">
                <span className="text-slate-500 block">Hospital Shift Duty Consent:</span>
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Agreed & Committed to 3-Shift (24x7) Duty at BMCH Barpeta</span>
                </span>
              </div>
            </div>
          </div>

          {/* Payment Gateway Transaction Summary */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center justify-between">
              <span>Cashfree Payment Gateway Transaction Record</span>
              <span className="text-emerald-700 font-bold">256-Bit Encrypted · PCI-DSS</span>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Application Fee:</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  Rs. {payment.amount}.00
                </span>
                <span className="text-[10px] text-slate-500 block">(Non-Refundable)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Mode:</span>
                <span className="font-semibold text-slate-800">
                  {payment.paymentMethod} {payment.upiIdOrCardLast4 ? `(${payment.upiIdOrCardLast4})` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Bank Ref / UTR:</span>
                <span className="font-mono font-medium text-slate-800">
                  {payment.bankRefNo}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Status:</span>
                <span className="inline-block px-2 py-0.5 rounded font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
                  PAID / SUCCESSFUL
                </span>
              </div>
            </div>
          </div>

          {/* Verification QR Code & Authorized Seal */}
          <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
            {/* QR Code */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-slate-300 rounded-lg shadow-2xs">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Digital Authenticity QR</div>
                <div className="text-[11px] text-slate-500">Scan at interview gate for verification</div>
                <div className="font-mono text-[10px] text-slate-400">BMCH/VERIFY/{registrationId}</div>
              </div>
            </div>

            {/* Signature & Seal */}
            <div className="text-center sm:text-right space-y-1">
              <div className="inline-block border-b border-dashed border-slate-400 pb-1 text-slate-800 font-medium font-serif italic text-sm">
                Digitally Generated & Verified via Portal
              </div>
              <div className="font-bold text-slate-900 uppercase">
                Authorized Signatory / In-Charge
              </div>
              <div className="text-xs font-bold text-slate-800">
                {AGENCY_NAME}
              </div>
              <div className="text-[11px] text-slate-500">
                {AGENCY_ADDRESS}
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-200">
            Note: This is an official system-generated registration receipt issued by {AGENCY_NAME} under GeM Bid {GEM_BID_NUMBER} for deployment at {INSTITUTION_NAME}. Please preserve this receipt carefully. You must produce this receipt and original Aadhaar / Driving License at the time of interview.
          </div>
        </div>
      </div>
    </div>
  );
};
