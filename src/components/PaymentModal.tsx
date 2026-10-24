import React, { useState } from 'react';
import { RegistrationFormData, PaymentDetails } from '../types';
import { APPLICATION_FEE, GEM_BID_NUMBER, INSTITUTION_NAME, AGENCY_NAME, AGENCY_ADDRESS } from '../data/assamDistricts';
import {
  ShieldCheck,
  Lock,
  X,
  CreditCard,
  QrCode,
  Smartphone,
  Building,
  CheckCircle2,
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
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateRandomTxnId = () => {
    return 'CF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const generateOrderId = () => {
    return 'ORD_BMCH_' + Math.floor(100000 + Math.random() * 900000);
  };

  const generateBankRef = () => {
    return 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
  };

  const handleSimulatePayment = (fail: boolean = false) => {
    setSimulatedError(null);
    setIsProcessing(true);
    setProcessStep('Connecting to Cashfree Payments Gateway...');

    setTimeout(() => {
      setProcessStep('Encrypting credentials & generating payment token...');
    }, 600);

    setTimeout(() => {
      if (fail) {
        setIsProcessing(false);
        setProcessStep('');
        setSimulatedError('Payment authorization failed: Bank server declined transaction. Please retry.');
      } else {
        setProcessStep('Payment approved! Generating payment receipt...');
        setTimeout(() => {
          setIsProcessing(false);
          const paymentResult: PaymentDetails = {
            transactionId: generateRandomTxnId(),
            orderId: generateOrderId(),
            amount: APPLICATION_FEE,
            currency: 'INR',
            paymentMethod: activeMethod,
            paymentGateway: 'Cashfree Payments',
            status: 'SUCCESS',
            paidAt: new Date().toISOString(),
            bankRefNo: generateBankRef(),
            upiIdOrCardLast4:
              activeMethod === 'UPI'
                ? upiId || `${formData.contactNumber}@upi`
                : activeMethod === 'Card'
                ? cardNumber ? `Ending in ${cardNumber.slice(-4)}` : 'Ending in 4242'
                : selectedBank,
          };
          onPaymentSuccess(paymentResult);
        }, 700);
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Cashfree Gateway Header */}
        <div className="bg-linear-to-r from-sky-950 via-sky-900 to-indigo-950 text-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-amber-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
                CASHFREE
              </div>
              <span className="text-xs text-sky-200 font-medium">Official Payment Gateway</span>
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
              <div className="text-xs text-sky-200">Merchant Account (Service Provider)</div>
              <div className="text-sm font-semibold truncate max-w-[220px] sm:max-w-[260px]">
                {AGENCY_NAME}
              </div>
              <div className="text-[10px] text-sky-300">{AGENCY_ADDRESS}</div>
              <div className="text-[10px] text-amber-300 mt-0.5">Deployment: {INSTITUTION_NAME} (GeM: {GEM_BID_NUMBER})</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-sky-200">Total Form Fee</div>
              <div className="text-2xl font-extrabold text-white font-mono">
                ₹{APPLICATION_FEE}.00
              </div>
            </div>
          </div>
        </div>

        {/* Applicant Summary Strip */}
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
          {simulatedError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{simulatedError}</span>
            </div>
          )}

          {isProcessing ? (
            <div className="py-12 px-4 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-sky-800 animate-spin mx-auto" />
              <div className="text-base font-bold text-slate-900">
                Processing Secure Payment
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                {processStep || 'Please do not refresh or close this browser window...'}
              </p>
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit SSL Cashfree Secure Encrypted Tunnel
              </div>
            </div>
          ) : (
            <>
              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveMethod('UPI')}
                  className={`p-2.5 min-h-[46px] text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-[0.98] ${
                    activeMethod === 'UPI'
                      ? 'border-sky-800 bg-sky-50/70 text-sky-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-sky-800" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod('Card')}
                  className={`p-2.5 min-h-[46px] text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-[0.98] ${
                    activeMethod === 'Card'
                      ? 'border-sky-800 bg-sky-50/70 text-sky-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-sky-800" />
                  <span>Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod('NetBanking')}
                  className={`p-2.5 min-h-[46px] text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-[0.98] ${
                    activeMethod === 'NetBanking'
                      ? 'border-sky-800 bg-sky-50/70 text-sky-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4 text-sky-800" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* UPI Tab */}
              {activeMethod === 'UPI' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-10 h-10 text-slate-800 bg-white p-1 rounded-lg border border-slate-200" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Scan & Pay via any UPI App
                        </div>
                        <div className="text-[11px] text-slate-500">
                          GPay · PhonePe · Paytm · BHIM · Amazon Pay
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded">
                      ₹200
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Or Enter Virtual Payment Address (UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder={`${formData.contactNumber}@upi`}
                      className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:border-sky-800"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Example: mobile@oksbi, yourname@okaxis, or upi@paytm
                    </p>
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {activeMethod === 'Card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 ···· ···· 4242"
                      maxLength={19}
                      className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm font-mono border border-slate-300 rounded-xl outline-none focus:border-sky-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY (e.g. 08/28)"
                        maxLength={5}
                        className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm font-mono border border-slate-300 rounded-xl outline-none focus:border-sky-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm font-mono border border-slate-300 rounded-xl outline-none focus:border-sky-800"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supports all Indian RuPay, Visa, Mastercard, and Maestro cards.
                  </div>
                </div>
              )}

              {/* NetBanking Tab */}
              {activeMethod === 'NetBanking' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Your Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:border-sky-800 bg-white"
                  >
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Assam Gramin Vikash Bank">Assam Gramin Vikash Bank (AGVB)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                  </select>
                  <p className="text-[11px] text-slate-400">
                    You will be securely routed via Cashfree payment gateway to complete bank verification.
                  </p>
                </div>
              )}

              {/* Main Payment CTA */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => handleSimulatePayment(false)}
                  className="w-full min-h-[50px] py-3.5 px-4 bg-sky-900 hover:bg-sky-800 active:scale-[0.98] text-white font-bold rounded-xl text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                >
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pay ₹{APPLICATION_FEE}.00 via Cashfree</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="bg-slate-100 px-4 sm:px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-800 shrink-0" />
            <span>Cashfree Payments Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <span>PCI-DSS Level 1</span>
            <span>·</span>
            <span>256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
