import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
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
  IndianRupee,
  Hash,
  Home,
  UserPlus
} from 'lucide-react';

interface PaymentReceiptProps {
  record: ApplicationRecord;
  onOpenSms: () => void;
  onNewRegistration: () => void;
  onBackToHome?: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  record,
  onOpenSms,
  onNewRegistration,
  onBackToHome,
}) => {
  const { formData, payment, registrationId, createdAt } = record;
  const [verificationQrUrl, setVerificationQrUrl] = useState<string>('');

  // Official Receipt Number formatting
  const receiptNo = record.receiptNumber || `BMCH-REC-2026-${registrationId.replace(/[^0-9]/g, '').slice(-5) || '10294'}`;
  const salaryInfo = SALARY_MATRIX[formData.position];

  // Generate authentic verification QR code for this candidate's receipt
  useEffect(() => {
    const verificationPayload = `BMCH-SECURITY-RECRUITMENT\nReceipt: ${receiptNo}\nRegId: ${registrationId}\nCandidate: ${formData.fullName}\nPost: ${formData.position}\nPhone: ${formData.contactNumber}\nFee: Rs. 200 (PAID)\nTxn: ${payment.transactionId}\nAgency: ${AGENCY_NAME}\nGeM: ${GEM_BID_NUMBER}`;
    QRCode.toDataURL(
      verificationPayload,
      {
        width: 180,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      },
      (err, url) => {
        if (!err && url) {
          setVerificationQrUrl(url);
        }
      }
    );
  }, [receiptNo, registrationId, formData, payment]);

  const handlePrint = () => {
    window.print();
  };

  const handleReturnToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      onNewRegistration();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Main Menu / Home Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReturnToHome}
            className="flex-1 sm:flex-none text-xs font-bold text-sky-950 bg-sky-100 hover:bg-sky-200 active:scale-[0.98] flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] py-2.5 px-4 rounded-xl border border-sky-300"
            title="Return to Portal Home & Main Application Menu"
          >
            <Home className="w-4 h-4 text-sky-900" />
            <span>← মূল মেনু / Home (Main Menu)</span>
          </button>

          <button
            type="button"
            onClick={onNewRegistration}
            className="flex-1 sm:flex-none text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] py-2.5 px-3.5 rounded-xl border border-slate-200"
          >
            <UserPlus className="w-4 h-4 text-slate-600" />
            <span>নতুন আবেদন (New Registration)</span>
          </button>
        </div>

        {/* SMS and Print Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <button
            type="button"
            onClick={onOpenSms}
            className="w-full sm:w-auto px-3.5 py-2.5 min-h-[44px] text-xs font-semibold text-sky-900 bg-white hover:bg-sky-50 active:bg-sky-100 border border-sky-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
          >
            <MessageSquare className="w-4 h-4 text-sky-700" />
            <span>View SMS</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner (hidden in print) */}
      <div className="no-print bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-emerald-900 text-sm">
              Payment of Rs. 200.00 Received Successfully via Cashfree Payments
            </p>
            <p className="text-emerald-800">
              Official Receipt Number: <strong className="font-mono text-emerald-950 font-extrabold">{receiptNo}</strong>. Registration has been recorded in the recruitment roster.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReturnToHome}
          className="text-xs font-bold text-emerald-900 bg-white border border-emerald-300 hover:bg-emerald-100 px-3.5 py-2 rounded-lg cursor-pointer shrink-0 transition-colors"
        >
          মূল মেনুলৈ যাওক (Go to Home) →
        </button>
      </div>

      {/* THE OFFICIAL PRINTABLE RECEIPT */}
      <div className="receipt-container relative bg-white border border-slate-300 rounded-2xl shadow-md p-6 sm:p-10 text-slate-900 overflow-hidden font-sans">
        {/* Content Container */}
        <div className="relative z-10 space-y-6">
          {/* Top Agency Header */}
          <div className="text-center border-b-2 border-slate-800 pb-5 space-y-2">
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
              Security Agency Interview Registration & Official Money Receipt (2026)
            </div>

            {/* PROMINENT OFFICIAL RECEIPT NUMBER STAMP */}
            <div className="mt-3 max-w-xl mx-auto bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-2 border-amber-500 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xs">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-950 flex items-center justify-center sm:justify-start gap-1">
                  <Hash className="w-3.5 h-3.5 text-amber-800" />
                  <span>Official Receipt Number / ৰচিদ নম্বৰ:</span>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-sky-950 tracking-wider">
                  {receiptNo}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="px-3 py-1.5 bg-emerald-700 text-white font-black rounded-lg text-xs shadow-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>FEE ₹200.00 PAID</span>
                </span>
              </div>
            </div>
          </div>

          {/* Registration Key Numbers Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Official Receipt No:</span>
              <span className="font-mono font-bold text-sm text-sky-950">
                {receiptNo}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Registration Number:</span>
              <span className="font-mono font-bold text-sm text-slate-800">
                {registrationId}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Date & Time:</span>
              <span className="font-medium text-slate-800 text-[11px]">
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
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Cashfree Txn ID:</span>
              <span className="font-mono font-semibold text-slate-800 truncate block">
                {payment.transactionId}
              </span>
            </div>
          </div>

          {/* CRITICAL MANDATORY INTERVIEW NOTICES */}
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
                  Please bring this payment receipt (Receipt No: <strong>{receiptNo}</strong>) along with you on the day of the interview.
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
                <span className="text-slate-500 block">Official Receipt No:</span>
                <span className="font-mono font-bold text-sky-950">
                  {receiptNo}
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
              <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs shrink-0">
                {verificationQrUrl ? (
                  <img src={verificationQrUrl} alt="Receipt Verification QR" className="w-16 h-16" />
                ) : (
                  <QrCode className="w-16 h-16 text-slate-900" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Digital Authenticity QR</div>
                <div className="text-[11px] text-slate-500">Scan at interview gate for verification</div>
                <div className="font-mono text-[10px] text-slate-400">BMCH/REC/{receiptNo}/PAID</div>
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
            Note: This is an official system-generated registration receipt (Receipt No: {receiptNo}) issued by {AGENCY_NAME} under GeM Bid {GEM_BID_NUMBER} for deployment at {INSTITUTION_NAME}. Please preserve this receipt carefully. You must produce this receipt and original Aadhaar / Driving License at the time of interview.
          </div>
        </div>
      </div>

      {/* PROMINENT BOTTOM NAVIGATION BAR (User Request: Returning to Main Menu) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border-2 border-sky-900/20 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <div className="text-sm font-extrabold text-slate-900">
            আপোনাৰ কাম সম্পূৰ্ণ হ'লনে? (Finished Viewing Receipt?)
          </div>
          <div className="text-xs text-slate-600">
            Click below to return to the Main Menu (Home) or register another applicant.
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReturnToHome}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-gradient-to-r from-sky-900 to-indigo-950 hover:from-sky-800 hover:to-indigo-900 active:scale-[0.98] text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span>← মূল পৃষ্ঠালৈ ঘূৰি যাওক (Back to Main Menu)</span>
          </button>

          <button
            type="button"
            onClick={onNewRegistration}
            className="w-full sm:w-auto min-h-[48px] px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
          >
            <UserPlus className="w-4 h-4 text-slate-700" />
            <span>নতুন আবেদন (New Registration)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
