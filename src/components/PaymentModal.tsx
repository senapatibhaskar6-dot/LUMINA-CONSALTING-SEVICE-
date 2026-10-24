import React, { useState } from 'react';
import { RegistrationFormData, PaymentDetails } from '../types';
import { APPLICATION_FEE, GEM_BID_NUMBER, INSTITUTION_NAME, AGENCY_NAME, AGENCY_ADDRESS } from '../data/assamDistricts';
import {
  ShieldCheck,
  Lock,
  X,
  CreditCard,
  Smartphone,
  Building,
  AlertCircle,
  Loader2,
  ArrowRight
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
  const [activeMethod, setActiveMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // লাইভ Cashfree পেমেণ্ট হেণ্ডেল কৰাৰ ফাংশ্বন
  const handleLivePayment = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessStep('Initializing Cashfree Secure Gateway...');

    try {
      // ১. চাৰ্ভাৰৰ পৰা Cashfree Order আৰু Payment Session ID বনোৱা
      const response = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: APPLICATION_FEE,
          customerName: formData.fullName,
          customerPhone: formData.contactNumber,
          customerEmail: formData.email || 'applicant@gmail.com',
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.payment_session_id) {
        throw new Error(data.error || 'Failed to initialize payment session with Cashfree.');
      }

      setProcessStep('Opening Cashfree Checkout...');

      // ২. Cashfree SDK ইনিটialize কৰা (Production মোড)
      const cashfree = (window as any).Cashfree({
        mode: "production", // বা 'sandbox' যদি টেষ্ট কৰিব বিচাৰে
      });

      let checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal", // _modal বা _self
      };

      cashfree.checkout(checkoutOptions).then((result: any) => {
        setIsProcessing(false);
        if (result.error) {
          setErrorMessage(result.error.message || 'Payment failed or cancelled by user.');
        }
        if (result.paymentDetails) {
          // পেমেণ্ট সফল হ’লে
          const paymentResult: PaymentDetails = {
            transactionId: result.paymentDetails.orderId || 'CF_TXN_' + Date.now(),
            orderId: data.orderId || 'ORD_' + Date.now(),
            amount: APPLICATION_FEE,
            currency: 'INR',
            paymentMethod: activeMethod,
            paymentGateway: 'Cashfree Payments',
            status: 'SUCCESS',
            paidAt: new Date().toISOString(),
            bankRefNo: result.paymentDetails.referenceId || 'REF' + Math.floor(Math.random() * 1000000000),
            upiIdOrCardLast4: activeMethod === 'UPI' ? (upiId || 'UPI Paid') : 'Online Paid',
          };
          onPaymentSuccess(paymentResult);
        }
      });

    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'An error occurred during payment processing.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-amber-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
                CASHFREE
              </div>
              <span className="text-xs text-sky-200 font-medium">Live Payment Gateway</span>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 sm:mt-4 flex items-baseline justify-between border-t border-sky-800/80 pt-3">
            <div>
              <div className="text-xs text-sky-200">Merchant Account</div>
              <div className="text-sm font-semibold truncate max-w-[220px] sm:max-w-[260px]">
                {AGENCY_NAME}
              </div>
              <div className="text-[10px] text-sky-300">{AGENCY_ADDRESS}</div>
              <div className="text-[10px] text-amber-300 mt-0.5">GeM Bid: {GEM_BID_NUMBER}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-sky-200">Total Fee</div>
              <div className="text-2xl font-extrabold text-white font-mono">
                ₹{APPLICATION_FEE}.00
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Summary */}
        <div className="bg-slate-50 px-4 sm:px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="truncate mr-2">
            Candidate: <strong className="text-slate-900">{formData.fullName}</strong>
          </div>
          <div className="text-slate-500 font-mono shrink-0">
            +91 {formData.contactNumber}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isProcessing ? (
            <div className="py-12 px-4 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-sky-800 animate-spin mx-auto" />
              <div className="text-base font-bold text-slate-900">
                Connecting to Cashfree
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                {processStep || 'Please complete the payment in the secure window...'}
              </p>
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit SSL Secured
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveMethod('UPI')}
                  className={`p-2.5 min-h-[46px] text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeMethod === 'UPI' ? 'border-sky-800 bg-sky-50 text-sky-950 font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-sky-800" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMethod('Card')}
                  className={`p-2.5 min-h-[46px] text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeMethod === 'Card' ? 'border-sky-800 bg-sky-50 text-sky-950 font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-sky-800" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMethod('NetBanking')}
                  className={`p-2.5 min-h-[46px] text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeMethod === 'NetBanking' ? 'border-sky-800 bg-sky-50 text-sky-950 font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4 text-sky-800" />
                  <span>Net Banking</span>
                </button>
              </div>

              <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 text-center space-y-2 mb-5">
                <div className="text-xs font-bold text-sky-950">Cashfree Secure Checkout</div>
                <p className="text-[11px] text-slate-600">
                  Clicking the button below will securely open the official Cashfree payment interface to complete your ₹{APPLICATION_FEE} fee transaction.
                </p>
              </div>

              {/* Pay Button */}
              <div>
                <button
                  type="button"
                  onClick={handleLivePayment}
                  className="w-full min-h-[50px] py-3.5 px-4 bg-sky-900 hover:bg-sky-800 active:scale-[0.98] text-white font-bold rounded-xl text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pay ₹{APPLICATION_FEE}.00 via Cashfree</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 sm:px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-800 shrink-0" />
            <span>Cashfree Live Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <span>PCI-DSS Level 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};