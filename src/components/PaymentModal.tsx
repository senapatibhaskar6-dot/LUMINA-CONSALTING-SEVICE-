import React, { useState, useEffect } from 'react';
import { RegistrationFormData, PaymentDetails } from '../types';
import { APPLICATION_FEE, GEM_BID_NUMBER, INSTITUTION_NAME, AGENCY_NAME, AGENCY_ADDRESS } from '../data/assamDistricts';
import {
  ShieldCheck,
  Lock,
  X,
  CreditCard,
  Smartphone,
  Building2,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface PaymentModalProps {
  formData: RegistrationFormData;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (payment: PaymentDetails) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  formData,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [whitelistHelpNeeded, setWhitelistHelpNeeded] = useState(false);

  // Backend Cashfree Configuration State
  const [cashfreeStatus, setCashfreeStatus] = useState<{
    isConfigured: boolean;
    appIdMasked: string | null;
    env: string;
  }>({ isConfigured: true, appIdMasked: '1460...0641', env: 'production' });

  // Helper to ensure Cashfree JS SDK is loaded
  const ensureCashfreeSdk = async (): Promise<boolean> => {
    if (typeof (window as any).Cashfree === 'function') return true;
    return new Promise((resolve) => {
      const existing = document.querySelector('script[src*="cashfree.com/js/v3/cashfree.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(typeof (window as any).Cashfree === 'function'));
        setTimeout(() => resolve(typeof (window as any).Cashfree === 'function'), 2500);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  // Fetch status on modal open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setWhitelistHelpNeeded(false);
      fetch('/api/cashfree-status')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.isConfigured === 'boolean') {
            setCashfreeStatus(data);
          }
        })
        .catch(() => {
          // ignore
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Finalize and Dispatch Official Receipt
  const finalizeSuccessfulPayment = (cfTxnId?: string, orderId?: string, bankRef?: string, mode?: string) => {
    const timestamp = Date.now();
    const generatedTxn = cfTxnId || `CF_TXN_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedOrder = orderId || `LUMINA_ORD_${timestamp.toString().slice(-6)}`;
    const finalUtr = bankRef || `CF_BANK_${Date.now().toString().slice(-6)}`;

    const paymentResult: PaymentDetails = {
      transactionId: generatedTxn,
      orderId: generatedOrder,
      amount: APPLICATION_FEE,
      currency: 'INR',
      paymentMethod: (mode as any) || 'UPI',
      paymentGateway: 'Cashfree Payments',
      status: 'SUCCESS',
      paidAt: new Date().toISOString(),
      bankRefNo: finalUtr,
      upiIdOrCardLast4: 'Cashfree Verified Gateway',
    };

    setIsProcessing(false);
    onPaymentSuccess(paymentResult);
  };

  // Launch Cashfree PG
  const handleCashfreePayment = async () => {
    setErrorMessage(null);
    setWhitelistHelpNeeded(false);
    setIsProcessing(true);
    setProcessStep('Connecting to Live Cashfree Gateway API...');

    try {
      const returnUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/?order_id={order_id}#receipt`
        : undefined;

      const response = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: APPLICATION_FEE,
          customerName: formData.fullName,
          customerPhone: formData.contactNumber,
          customerEmail: formData.email || 'applicant@gmail.com',
          returnUrl,
        }),
      });

      const orderData = await response.json();

      if (!response.ok || !orderData.payment_session_id) {
        setIsProcessing(false);
        const errMsg = orderData.error || 'Failed to initialize Cashfree payment. Please check connection.';
        setErrorMessage(errMsg);
        if (errMsg.toLowerCase().includes('whitelist') || errMsg.toLowerCase().includes('broken')) {
          setWhitelistHelpNeeded(true);
        }
        return;
      }

      // Load SDK
      setProcessStep('Loading Cashfree Payment Gateway...');
      const sdkReady = await ensureCashfreeSdk();

      if (sdkReady && typeof (window as any).Cashfree === 'function') {
        setProcessStep('Opening Cashfree Secure Payment Window...');
        const cashfree = (window as any).Cashfree({
          mode: orderData.mode || 'production',
        });

        cashfree.checkout({
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: '_modal',
        }).then(async (result: any) => {
          setProcessStep('Verifying payment with Cashfree Server...');
          try {
            const verifyRes = await fetch(`/api/verify-cashfree-order?order_id=${encodeURIComponent(orderData.orderId)}`);
            const verifyData = await verifyRes.json();
            if (verifyData.isPaid) {
              const txnId = verifyData.payment?.cf_payment_id || result?.paymentDetails?.referenceId || orderData.cfOrderId;
              const bankRef = verifyData.payment?.bank_reference || `CF_BANK_${Date.now().toString().slice(-6)}`;
              finalizeSuccessfulPayment(txnId, orderData.orderId, bankRef, verifyData.payment?.payment_group || 'UPI');
              return;
            }
          } catch (vErr) {
            console.error('Order verification error:', vErr);
          }

          if (result?.paymentDetails) {
            finalizeSuccessfulPayment(
              result.paymentDetails.referenceId || result.paymentDetails.paymentId,
              orderData.orderId,
              result.paymentDetails.bankReference
            );
            return;
          }

          if (result?.error) {
            setIsProcessing(false);
            const errText = result.error.message || '';
            if (errText.toLowerCase().includes('whitelist') || errText.toLowerCase().includes('approved') || errText.toLowerCase().includes('broken')) {
              setWhitelistHelpNeeded(true);
              setErrorMessage('Cashfree Domain Whitelisting Required: Domain is not yet approved in Cashfree Merchant Dashboard.');
            } else {
              setErrorMessage(errText || 'Payment was not completed. No money was deducted.');
            }
            return;
          }

          setIsProcessing(false);
          setErrorMessage('Payment window was closed. If money was deducted, your receipt will be generated upon verification.');
        }).catch(async (checkoutErr: any) => {
          console.error('Cashfree checkout modal error:', checkoutErr);
          try {
            const verifyRes = await fetch(`/api/verify-cashfree-order?order_id=${encodeURIComponent(orderData.orderId)}`);
            const verifyData = await verifyRes.json();
            if (verifyData.isPaid) {
              finalizeSuccessfulPayment(verifyData.payment?.cf_payment_id, orderData.orderId, verifyData.payment?.bank_reference);
              return;
            }
          } catch {}

          setIsProcessing(false);
          const msg = checkoutErr?.message || '';
          if (msg.toLowerCase().includes('whitelist') || msg.toLowerCase().includes('not enabled') || msg.toLowerCase().includes('broken')) {
            setWhitelistHelpNeeded(true);
            setErrorMessage('Cashfree Domain Whitelisting Required: Domain is not yet approved in Cashfree Merchant Dashboard.');
          } else {
            setErrorMessage(msg || 'Payment window was closed before completion.');
          }
        });
      } else {
        setIsProcessing(false);
        setErrorMessage('Cashfree payment SDK could not be loaded in browser. Please reload or check your internet connection.');
      }
    } catch (networkErr: any) {
      setIsProcessing(false);
      setErrorMessage(networkErr.message || 'Network error connecting to Cashfree payment gateway.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-8 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                CASHFREE PAYMENTS
              </span>
              <span className="text-xs text-sky-200 font-semibold">
                Official Live Payment Gateway
              </span>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
            <div>
              <div className="text-[11px] text-sky-200 uppercase font-semibold">Fee Collection Authority</div>
              <div className="text-sm font-black text-white truncate max-w-[240px] sm:max-w-[280px]">
                {AGENCY_NAME}
              </div>
              <div className="text-[10px] text-amber-300 font-medium">GeM Bid: {GEM_BID_NUMBER} · {INSTITUTION_NAME}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-sky-200 uppercase font-semibold">Application Fee</div>
              <div className="text-2xl font-black text-emerald-300 font-mono">
                ₹{APPLICATION_FEE}.00
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Bar */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="truncate mr-2">
            Applicant: <strong className="text-slate-900">{formData.fullName}</strong> ({formData.position})
          </div>
          <div className="text-slate-500 font-mono shrink-0">
            +91 {formData.contactNumber}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-1">
                <span className="leading-relaxed font-semibold block">{errorMessage}</span>
              </div>
            </div>
          )}

          {whitelistHelpNeeded && (
            <div className="p-3.5 bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs rounded-xl space-y-2">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>মাৰ্চেণ্ট ডমেইন Whitelist কৰাৰ প্ৰয়োজনীয়তা (Domain Whitelisting Required):</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                Cashfree Live একাউণ্টত পেমেন্ট পোনপটীয়াকৈ খোল খাবলৈ Cashfree Dashboard ত আপোনাৰ ডমেইনটো এবাৰ Whitelist কৰিব লাগে:
              </p>
              <div className="p-2 bg-white rounded-lg border border-amber-300 font-mono text-[11px] text-slate-900 font-bold select-all break-all">
                https://lumina-consalting-sevice.vercel.app
              </div>
              <p className="text-[11px] text-slate-700">
                👉 <strong>merchant.cashfree.com</strong> ত গৈ <strong>Developers &gt; Whitelisting</strong> ত এই লিংকটো Save কৰক।
              </p>
            </div>
          )}

          {isProcessing ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <Loader2 className="w-16 h-16 text-sky-900 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-sky-900">
                  ₹200
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-base font-extrabold text-slate-900">
                  Processing via Cashfree Payments...
                </div>
                <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                  {processStep || 'Opening secure Cashfree gateway window...'}
                </p>
              </div>
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>PCI-DSS Level 1 · 256-Bit Bank Grade Encryption</span>
              </div>
            </div>
          ) : (
            <>
              {/* Cashfree Payment Gateway Overview Card */}
              <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cashfree Integrated Payment Gateway</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    100% Secure
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Lumina Consulting Service ৰ আবেদন মাচুল ₹২০০.০০ পোনপটীয়াকৈ <strong>Cashfree Payment Gateway</strong> ৰ জৰিয়তে গ্ৰহণ কৰা হ'ব। তলৰ বুটামত ক্লিক কৰিলে Cashfree ৰ সুৰক্ষিত পেমেন্ট উইণ্ড' খোল খাব।
                </p>

                {/* Supported Payment Channels inside Cashfree */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Payment Options Supported inside Cashfree:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center shadow-2xs">
                      <Smartphone className="w-4 h-4 mx-auto text-sky-700 mb-1" />
                      <span className="text-[11px] font-bold text-slate-800 block">UPI / QR</span>
                      <span className="text-[9px] text-slate-500">GPay, PhonePe, Paytm</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center shadow-2xs">
                      <CreditCard className="w-4 h-4 mx-auto text-sky-700 mb-1" />
                      <span className="text-[11px] font-bold text-slate-800 block">Cards</span>
                      <span className="text-[9px] text-slate-500">RuPay, Debit & Credit</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center shadow-2xs">
                      <Building2 className="w-4 h-4 mx-auto text-sky-700 mb-1" />
                      <span className="text-[11px] font-bold text-slate-800 block">NetBanking</span>
                      <span className="text-[9px] text-slate-500">SBI, HDFC, all Banks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recruitment Summary Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Application Post:</span>
                  <strong className="text-slate-900">{formData.position}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hospital:</span>
                  <span className="font-semibold">{INSTITUTION_NAME}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Fee Amount:</span>
                  <span className="font-mono font-bold text-slate-900">₹{APPLICATION_FEE}.00 (Non-refundable)</span>
                </div>
              </div>

              {/* Primary Action Button - Cashfree Only */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleCashfreePayment}
                  className="w-full min-h-[52px] py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-sky-900 to-indigo-950 hover:from-emerald-500 hover:to-indigo-900 active:scale-[0.99] text-white font-extrabold rounded-xl text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                >
                  <Lock className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Pay ₹{APPLICATION_FEE}.00 via Cashfree Payments</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <div className="text-center">
                  <span className="text-[11px] text-slate-500 block">
                    Issued by {AGENCY_NAME} · Official Candidate Money Receipt
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Cashfree Live PG · 256-Bit SSL</span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 font-semibold">
            Merchant: 1460...0641
          </div>
        </div>
      </div>
    </div>
  );
};