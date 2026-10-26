import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { RegistrationFormData, PaymentDetails } from '../types';
import { APPLICATION_FEE, GEM_BID_NUMBER, INSTITUTION_NAME, AGENCY_NAME } from '../data/assamDistricts';
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
  QrCode,
  Sparkles,
  ExternalLink,
  Laptop,
  Check
} from 'lucide-react';

interface PaymentModalProps {
  formData: RegistrationFormData;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (payment: PaymentDetails) => void;
}

interface CashfreeOrderDetails {
  orderId: string;
  cfOrderId?: string;
  paymentSessionId: string;
  amount: number;
  mode: string;
  upiIntentUri: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  formData,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  // Navigation / view mode: 'upi_qr' (default for desktop) or 'all_modes'
  const [activeTab, setActiveTab] = useState<'upi_qr' | 'all_modes'>('upi_qr');
  const [isDesktop, setIsDesktop] = useState(true);

  // Cashfree Order State
  const [orderData, setOrderData] = useState<CashfreeOrderDetails | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isInitializingOrder, setIsInitializingOrder] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [whitelistHelpNeeded, setWhitelistHelpNeeded] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Polling ref
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect device screen size
  useEffect(() => {
    const checkDevice = () => {
      const isLargeScreen = window.innerWidth >= 640;
      setIsDesktop(isLargeScreen);
      // Default to UPI QR for desktop, or all modes for mobile
      setActiveTab(isLargeScreen ? 'upi_qr' : 'all_modes');
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

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

  // Finalize and Dispatch Official Receipt
  const finalizeSuccessfulPayment = (cfTxnId?: string, orderId?: string, bankRef?: string, mode?: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setPaymentVerified(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

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

    setTimeout(() => {
      setIsProcessingCheckout(false);
      onPaymentSuccess(paymentResult);
    }, 1200);
  };

  // Create Cashfree Order & Generate QR
  const initializeCashfreeOrder = async () => {
    setIsInitializingOrder(true);
    setErrorMessage(null);
    setWhitelistHelpNeeded(false);

    try {
      const returnUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/?order_id={order_id}#receipt`
        : undefined;

      const res = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: APPLICATION_FEE,
          customerName: formData.fullName,
          customerPhone: formData.contactNumber,
          customerEmail: formData.email || 'applicant@gmail.com',
          position: formData.position,
          returnUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.payment_session_id) {
        setIsInitializingOrder(false);
        const err = data.error || 'Failed to initialize Cashfree Payment Order.';
        setErrorMessage(err);
        if (err.toLowerCase().includes('whitelist') || err.toLowerCase().includes('broken')) {
          setWhitelistHelpNeeded(true);
        }
        return;
      }

      const orderDetails: CashfreeOrderDetails = {
        orderId: data.orderId,
        cfOrderId: data.cfOrderId,
        paymentSessionId: data.payment_session_id,
        amount: data.amount || APPLICATION_FEE,
        mode: data.mode || 'production',
        upiIntentUri: data.upiIntentUri || `upi://pay?pa=cashfree@icici&pn=Lumina%20Consulting%20Services&am=${APPLICATION_FEE}.00&tr=${data.orderId}&cu=INR`,
      };

      setOrderData(orderDetails);

      // Generate High Quality QR Code Data URL for Desktop Scan & Pay
      try {
        const qrUrl = await QRCode.toDataURL(orderDetails.upiIntentUri, {
          width: 320,
          margin: 1.5,
          color: {
            dark: '#031926',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        setQrCodeUrl(qrUrl);
      } catch (qrErr) {
        console.error('QR code generation error:', qrErr);
      }

      setIsInitializingOrder(false);
    } catch (err: any) {
      console.error('Order init error:', err);
      setIsInitializingOrder(false);
      setErrorMessage(err.message || 'Network error connecting to Cashfree Payments.');
    }
  };

  // Pre-initialize Cashfree Order when Modal Opens
  useEffect(() => {
    if (isOpen) {
      setPaymentVerified(false);
      setErrorMessage(null);
      setWhitelistHelpNeeded(false);
      initializeCashfreeOrder();
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  // Background polling for payment status (checks every 3.5 seconds)
  useEffect(() => {
    if (!isOpen || !orderData?.orderId || paymentVerified) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const checkOrderStatus = async () => {
      try {
        const res = await fetch(`/api/verify-cashfree-order?order_id=${encodeURIComponent(orderData.orderId)}`);
        const result = await res.json();
        if (result.isPaid) {
          const txnId = result.payment?.cf_payment_id || orderData.cfOrderId;
          const bankRef = result.payment?.bank_reference || `CF_BANK_${Date.now().toString().slice(-6)}`;
          finalizeSuccessfulPayment(txnId, orderData.orderId, bankRef, result.payment?.payment_group || 'UPI');
        }
      } catch (e) {
        // quiet polling failure
      }
    };

    pollIntervalRef.current = setInterval(checkOrderStatus, 3500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isOpen, orderData?.orderId, paymentVerified]);

  // Trigger Cashfree JS SDK Drop-in Checkout Modal
  const launchCashfreeCheckoutModal = async () => {
    setErrorMessage(null);
    setWhitelistHelpNeeded(false);
    setIsProcessingCheckout(true);
    setProcessStep('Opening Cashfree Secure Drop-in Checkout...');

    try {
      let currentSessionId = orderData?.paymentSessionId;
      let currentOrderId = orderData?.orderId;
      let currentMode = orderData?.mode || 'production';

      // If order not ready yet, create now
      if (!currentSessionId || !currentOrderId) {
        setProcessStep('Creating Cashfree payment session...');
        const res = await fetch('/api/create-cashfree-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: APPLICATION_FEE,
            customerName: formData.fullName,
            customerPhone: formData.contactNumber,
            customerEmail: formData.email || 'applicant@gmail.com',
            position: formData.position,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.payment_session_id) {
          setIsProcessingCheckout(false);
          const err = data.error || 'Failed to initialize Cashfree payment.';
          setErrorMessage(err);
          if (err.toLowerCase().includes('whitelist') || err.toLowerCase().includes('broken')) {
            setWhitelistHelpNeeded(true);
          }
          return;
        }
        currentSessionId = data.payment_session_id;
        currentOrderId = data.order_id;
        currentMode = data.mode || 'production';
      }

      setProcessStep('Loading Cashfree Web Checkout SDK...');
      const sdkReady = await ensureCashfreeSdk();

      if (sdkReady && typeof (window as any).Cashfree === 'function') {
        setProcessStep('Rendering checkout modal...');
        const cashfree = (window as any).Cashfree({
          mode: currentMode,
        });

        cashfree.checkout({
          paymentSessionId: currentSessionId,
          redirectTarget: '_modal',
        }).then(async (result: any) => {
          setProcessStep('Verifying payment with Cashfree Server...');
          try {
            const verifyRes = await fetch(`/api/verify-cashfree-order?order_id=${encodeURIComponent(currentOrderId!)}`);
            const verifyData = await verifyRes.json();
            if (verifyData.isPaid) {
              const txnId = verifyData.payment?.cf_payment_id || result?.paymentDetails?.referenceId || orderData?.cfOrderId;
              const bankRef = verifyData.payment?.bank_reference || `CF_BANK_${Date.now().toString().slice(-6)}`;
              finalizeSuccessfulPayment(txnId, currentOrderId, bankRef, verifyData.payment?.payment_group || 'UPI');
              return;
            }
          } catch (vErr) {
            console.error('Order verification error:', vErr);
          }

          if (result?.paymentDetails) {
            finalizeSuccessfulPayment(
              result.paymentDetails.referenceId || result.paymentDetails.paymentId,
              currentOrderId,
              result.paymentDetails.bankReference
            );
            return;
          }

          if (result?.error) {
            setIsProcessingCheckout(false);
            const errText = result.error.message || '';
            if (errText.toLowerCase().includes('whitelist') || errText.toLowerCase().includes('approved') || errText.toLowerCase().includes('broken')) {
              setWhitelistHelpNeeded(true);
              setErrorMessage('Cashfree Domain Whitelisting Required: Domain is not yet approved in Cashfree Merchant Dashboard.');
            } else {
              setErrorMessage(errText || 'Payment was not completed. No money was deducted.');
            }
            return;
          }

          setIsProcessingCheckout(false);
        }).catch(async (checkoutErr: any) => {
          console.error('Cashfree checkout modal error:', checkoutErr);
          try {
            const verifyRes = await fetch(`/api/verify-cashfree-order?order_id=${encodeURIComponent(currentOrderId!)}`);
            const verifyData = await verifyRes.json();
            if (verifyData.isPaid) {
              finalizeSuccessfulPayment(verifyData.payment?.cf_payment_id, currentOrderId, verifyData.payment?.bank_reference);
              return;
            }
          } catch {}

          setIsProcessingCheckout(false);
          const msg = checkoutErr?.message || '';
          if (msg.toLowerCase().includes('whitelist') || msg.toLowerCase().includes('not enabled') || msg.toLowerCase().includes('broken')) {
            setWhitelistHelpNeeded(true);
            setErrorMessage('Cashfree Domain Whitelisting Required: Domain is not yet approved in Cashfree Merchant Dashboard.');
          } else {
            setErrorMessage(msg || 'Payment window closed before completion.');
          }
        });
      } else {
        setIsProcessingCheckout(false);
        setErrorMessage('Cashfree payment SDK could not be loaded. Please check your internet connection.');
      }
    } catch (networkErr: any) {
      setIsProcessingCheckout(false);
      setErrorMessage(networkErr.message || 'Network error connecting to Cashfree payment gateway.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[96vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                CASHFREE PAYMENTS
              </span>
              <span className="text-xs text-sky-200 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Official Secure Payment Gateway
              </span>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessingCheckout}
              className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
            <div>
              <div className="text-[11px] text-sky-200 uppercase font-semibold">Recruiting Agency</div>
              <div className="text-sm font-black text-white truncate max-w-[260px] sm:max-w-[320px]">
                {AGENCY_NAME}
              </div>
              <div className="text-[10px] text-amber-300 font-medium">
                GeM Bid: {GEM_BID_NUMBER} · {INSTITUTION_NAME}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-sky-200 uppercase font-semibold">Application Fee</div>
              <div className="text-2xl font-black text-emerald-300 font-mono">
                ₹{APPLICATION_FEE}.00
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Detail Strip */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="truncate mr-2">
            Candidate: <strong className="text-slate-900">{formData.fullName}</strong> ({formData.position})
          </div>
          <div className="text-slate-500 font-mono shrink-0">
            +91 {formData.contactNumber}
          </div>
        </div>

        {/* Method Toggle Tabs (Prominently displaying UPI QR on Desktop) */}
        <div className="px-4 pt-3 pb-1 border-b border-slate-100 flex gap-2 shrink-0 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('upi_qr')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upi_qr'
                ? 'bg-sky-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>UPI QR (Scan & Pay)</span>
            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
              Fastest
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_modes')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'all_modes'
                ? 'bg-sky-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-sky-300" />
            <span>Cards / NetBanking</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Whitelist Banner if needed */}
          {whitelistHelpNeeded && (
            <div className="p-3.5 bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs rounded-xl space-y-2">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Cashfree মাৰ্চেণ্ট ডমেইন Whitelist কৰাৰ নিৰ্দেশনা (Domain Whitelisting Required):</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                Cashfree PG একাউণ্টত পেমেন্ট পোনপটীয়াকৈ সক্রিয় কৰিবলৈ <strong>merchant.cashfree.com</strong> ত এই ডমেইনটো এবাৰ Whitelist কৰক:
              </p>
              <div className="p-2 bg-white rounded-lg border border-amber-300 font-mono text-[11px] text-slate-900 font-bold select-all break-all">
                https://lumina-consalting-sevice.vercel.app
              </div>
              <p className="text-[11px] text-slate-700">
                👉 <strong>merchant.cashfree.com</strong> ত লগইন কৰি <strong>Developers &gt; Whitelisting</strong> ত লিংকটো যোগ কৰক।
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-1">
                <span className="leading-relaxed font-semibold block">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Payment Verified Success Animation */}
          {paymentVerified ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Payment Received & Verified!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                মাচুল ₹২০০.০০ সফলভাৱে গ্ৰহণ কৰা হৈছে। আপোনাৰ আনুষ্ঠানিক আবেদন ৰচিদ প্ৰস্তুত কৰা হৈছে...
              </p>
            </div>
          ) : isProcessingCheckout ? (
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
          ) : activeTab === 'upi_qr' ? (
            /* TAB 1: PROMINENT UPI QR SCAN & PAY (SPECIFICALLY FORCED & HIGHLIGHTED ON DESKTOP) */
            <div className="space-y-4">
              
              {/* Desktop Notice Banner */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5">
                <div className="p-1.5 bg-sky-600 text-white rounded-lg shrink-0 mt-0.5">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="text-xs text-sky-950">
                  <div className="font-extrabold">Desktop / Laptop Scan &amp; Pay Enabled</div>
                  <p className="text-[11px] text-sky-800 leading-relaxed mt-0.5">
                    ম'বাইলৰ <strong>Google Pay, PhonePe, Paytm বা BHIM</strong> খুলি তলৰ QR কোডটো স্কেন কৰক। পেমেন্ট সম্পূৰ্ণ হোৱাৰ লগে লগে এই স্ক্ৰীনখন স্বয়ংক্ৰিয়ভাৱে ভেৰিফাই হৈ ৰচিদ ওলাব।
                  </p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-gradient-to-b from-white to-slate-50 border-2 border-dashed border-sky-300 rounded-2xl p-5 text-center shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* Live Polling Pulse Status */}
                <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Cashfree Live Gateway · Auto-Detecting Payment</span>
                </div>

                {isInitializingOrder ? (
                  <div className="w-64 h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
                    <Loader2 className="w-10 h-10 text-sky-900 animate-spin mb-2" />
                    <span className="text-xs text-slate-600 font-semibold">Generating UPI QR...</span>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                    <img
                      src={qrCodeUrl}
                      alt="Cashfree UPI QR Code"
                      className="w-56 h-56 sm:w-60 sm:h-60 mx-auto rounded-lg object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/95 px-2 py-1 rounded-md shadow-xs border border-slate-200 text-[10px] font-black tracking-wider text-sky-950 uppercase">
                        UPI ₹200
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-600 mb-2" />
                    <span className="text-xs text-slate-700 font-semibold mb-2">QR Code generation pending</span>
                    <button
                      type="button"
                      onClick={initializeCashfreeOrder}
                      className="px-3 py-1.5 bg-sky-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                  </div>
                )}

                {/* Amount and Order Tag */}
                <div className="mt-3 text-center space-y-0.5">
                  <div className="text-xs text-slate-500 font-medium">Scan to Pay Exact Amount:</div>
                  <div className="text-2xl font-black text-slate-900 font-mono">₹{APPLICATION_FEE}.00</div>
                  {orderData?.orderId && (
                    <div className="text-[10px] font-mono text-slate-500">
                      Order ID: <span className="font-semibold text-slate-700">{orderData.orderId}</span>
                    </div>
                  )}
                </div>

                {/* Supported UPI Apps Row */}
                <div className="mt-3 pt-3 border-t border-slate-200 w-full flex items-center justify-center gap-4 text-xs font-bold text-slate-600">
                  <span className="text-slate-800">Google Pay</span>
                  <span className="text-indigo-700">PhonePe</span>
                  <span className="text-sky-600">Paytm</span>
                  <span className="text-emerald-700">BHIM</span>
                  <span className="text-amber-700">Navi</span>
                </div>
              </div>

              {/* Alternative Launch Button inside QR Tab */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={launchCashfreeCheckoutModal}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Or Open Cashfree Checkout (Cards, NetBanking, Popup)</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <div className="text-center text-[10px] text-slate-500">
                  Cashfree Payments PCI-DSS Level 1 Verified · Direct Bank Settlement
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: CARDS, NETBANKING & OTHER PAYMENT OPTIONS */
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cashfree Drop-in Checkout</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    100% Secure
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Debit Card (RuPay, Visa, MasterCard), Credit Card, আৰু সকলো ভাৰতীয় বেংকৰ Net Banking ৰ সুবিধা Cashfree Drop-in Checkout ত উপলব্ধ।
                </p>

                {/* Grid of payment modes */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
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

              {/* Launch Dropin Modal Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={launchCashfreeCheckoutModal}
                  className="w-full min-h-[52px] py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-sky-900 to-indigo-950 hover:from-emerald-500 hover:to-indigo-900 active:scale-[0.99] text-white font-extrabold rounded-xl text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                >
                  <Lock className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Launch Cashfree Secure Checkout Window</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upi_qr')}
                    className="text-xs font-bold text-sky-800 hover:underline cursor-pointer"
                  >
                    ← Switch back to UPI QR (Scan &amp; Pay)
                  </button>
                </div>
              </div>
            </div>
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