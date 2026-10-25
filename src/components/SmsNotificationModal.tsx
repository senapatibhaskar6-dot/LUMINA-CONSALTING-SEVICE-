import React, { useState, useEffect } from 'react';
import { ApplicationRecord } from '../types';
import {
  MessageSquare,
  CheckCircle2,
  X,
  PhoneCall,
  Copy,
  Check,
  Send,
  AlertCircle,
  Bell
} from 'lucide-react';

interface SmsNotificationModalProps {
  record: ApplicationRecord;
  isOpen: boolean;
  onClose: () => void;
  onResendSms?: () => void;
  onBackToHome?: () => void;
}

export const SmsNotificationModal: React.FC<SmsNotificationModalProps> = ({
  record,
  isOpen,
  onClose,
  onResendSms,
  onBackToHome,
}) => {
  const [copied, setCopied] = useState(false);
  const [resentNotification, setResentNotification] = useState(false);

  // Trigger web audio chime on open
  useEffect(() => {
    if (isOpen) {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch {
        // AudioContext may be restricted by browser policy if unclicked
      }
    }
  }, [isOpen]);

  const receiptNo = record.receiptNumber || `BMCH-REC-2026-${record.registrationId.replace(/[^0-9]/g, '').slice(-5) || '10294'}`;
  const smsText = `[LUMINA-BMCH]: Dear ${record.formData.fullName}, your registration & payment of Rs. 200.00 for ${record.formData.position} at Barpeta Medical College and Hospital (GeM Bid: GEM/2026/B/8101646) is SUCCESSFUL.\n\nReceipt No: ${receiptNo}\nRegistration No: ${record.registrationId}\nTransaction ID: ${record.payment.transactionId}\nAgency: Lumina Consulting Service, Bharalu, Guwahati-781009, Kamrup(M) Assam\n\n1. Interview date and details will be communicated soon to your provided phone number.\n2. Please bring this payment receipt along with you on the day of the interview.\n\n- Lumina Consulting Service / BMCH Barpeta, Assam.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = () => {
    setResentNotification(true);
    if (onResendSms) onResendSms();
    setTimeout(() => setResentNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto my-0 sm:my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Instant SMS Delivery Dispatch
              </div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>Sender: BMCH-GOV (Assam)</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smartphone Notification Preview */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>To: <strong className="text-slate-800">+91 {record.formData.contactNumber}</strong></span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              SENT & DELIVERED
            </span>
          </div>

          {/* SMS Message Bubble */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 sm:p-4 text-xs text-slate-800 leading-relaxed space-y-3 font-sans shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-sky-900 font-bold border-b border-sky-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>OFFICIAL SMS NOTIFICATION</span>
              </div>
              <span className="font-mono text-slate-500">
                {new Date(record.payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p>
              Dear <strong className="text-slate-900">{record.formData.fullName}</strong>,
              your registration and application fee of <strong className="text-slate-900">Rs. 200.00</strong> for{' '}
              <strong className="text-sky-900">{record.formData.position}</strong> under{' '}
              <span className="font-mono">GeM Bid: GEM/2026/B/8101646</span> has been successfully recorded.
            </p>

            <div className="bg-white/90 p-2.5 rounded-lg border border-sky-200 font-mono text-[11px] space-y-1">
              <div>Reg No: <strong>{record.registrationId}</strong></div>
              <div>Txn ID: <strong>{record.payment.transactionId}</strong></div>
              <div>Amount: <strong>Rs. 200.00 (PAID)</strong></div>
            </div>

            {/* Crucial mandatory instructions */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 space-y-2 font-medium">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Interview date and details will be communicated soon to your provided phone number.</strong>
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Please bring this payment receipt along with you on the day of the interview.</strong>
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-right">
              — Lumina Consulting Service / BMCH Barpeta
            </div>
          </div>

          {resentNotification && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>SMS re-dispatched successfully to +91 {record.formData.contactNumber}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[46px] py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Copied Text!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Copy SMS Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              className="min-h-[46px] py-2.5 px-3 rounded-xl bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
            >
              <Send className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Resend SMS Alert</span>
            </button>
          </div>
        </div>

        {/* Footer info & Navigation */}
        <div className="bg-slate-50 px-4 sm:px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto flex-1 min-h-[44px] py-2 px-3 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>ৰচিদখন চাওক (View Receipt) →</span>
          </button>
          {onBackToHome && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onBackToHome();
              }}
              className="w-full sm:w-auto min-h-[44px] py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span>মূল মেনুলৈ ঘূৰি যাওক (Main Menu)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
