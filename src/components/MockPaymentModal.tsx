import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  QrCode,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  X,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '../lib/utils';

export interface PaymentSuccessResult {
  transactionId: string;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING';
}

interface MockPaymentModalProps {
  isOpen: boolean;
  orderId: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  onSuccess: (result: PaymentSuccessResult) => void;
  onClose: () => void;
}

type TabType = 'upi' | 'card' | 'netbanking' | 'cod';

export const MockPaymentModal: React.FC<MockPaymentModalProps> = ({
  isOpen,
  orderId,
  totalAmount,
  customerName,
  customerPhone,
  onSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('upi');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'cred'>('gpay');
  const [countdown, setCountdown] = useState(180); // 3 minutes for QR code

  // Card details state
  const [cardNumber, setCardNumber] = useState('4532 8921 4410 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [cardName, setCardName] = useState(customerName || 'Pooja Sharma');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<'idle' | 'authorizing' | 'otp' | 'success'>('idle');
  const [otpInput, setOtpInput] = useState('');

  // Countdown timer for UPI QR
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSimulatePayment = (method: string, isCod = false) => {
    setIsProcessing(true);
    setProcessStep('authorizing');

    setTimeout(() => {
      if (method === 'card') {
        // Trigger simulated 3D Secure OTP step
        setProcessStep('otp');
        setIsProcessing(false);
      } else {
        // Instant UPI / NetBanking / COD success
        finalizeSuccess(method, isCod ? 'PENDING' : 'PAID');
      }
    }, 1200);
  };

  const handleVerifyOtp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      finalizeSuccess('card', 'PAID');
    }, 1000);
  };

  const finalizeSuccess = (method: string, status: 'PAID' | 'PENDING') => {
    setProcessStep('success');
    setIsProcessing(false);

    const generatedTxnId = `TXN_BB_${Math.floor(100000000 + Math.random() * 900000000)}`;

    setTimeout(() => {
      onSuccess({
        transactionId: generatedTxnId,
        paymentMethod: method,
        paymentStatus: status,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9f2066] to-[#e11d48] flex items-center justify-center shadow-md font-extrabold text-white text-base">
              BB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight">BharatPay Gateway</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  TEST MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-bit Bank Grade Encrypted • Order #{orderId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">To Pay</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">{formatPrice(totalAmount)}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing || processStep === 'success'}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Screen Overlay */}
        {processStep === 'success' && (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Payment Approved!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Transaction authorized successfully via BharatPay Mock Switch.
              </p>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600">
              Ref ID: TXN_BB_{Math.floor(10000000 + Math.random() * 90000000)}
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Finalizing order confirmation...</span>
            </div>
          </div>
        )}

        {/* 3D-Secure Card OTP Modal Overlay */}
        {processStep === 'otp' && (
          <div className="p-6 sm:p-8 space-y-5 my-auto">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-pink-100 text-[#9f2066] mx-auto flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3D Secure Verified by Visa / RuPay</h3>
              <p className="text-xs text-slate-500">
                A 6-digit mock OTP has been simulated for card ending in {cardNumber.slice(-4)}.
              </p>
            </div>

            <div className="max-w-xs mx-auto bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-center justify-between">
              <span>Demo OTP: <strong>789012</strong></span>
              <button
                type="button"
                onClick={() => setOtpInput('789012')}
                className="underline text-[11px] font-bold cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            <div className="max-w-xs mx-auto space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-Digit Bank OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="789012"
                  className="w-full text-center tracking-widest text-lg font-bold py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#9f2066] focus:ring-1 focus:ring-[#9f2066]"
                />
              </div>

              <button
                type="button"
                disabled={otpInput.length < 4 || isProcessing}
                onClick={handleVerifyOtp}
                className="w-full py-3 bg-[#9f2066] hover:bg-[#851b55] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Issuer Bank...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirm & Pay {formatPrice(totalAmount)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Main Payment Options Grid */}
        {processStep === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Method Tabs */}
            <div className="md:col-span-5 bg-slate-50 border-r border-slate-200 p-3 sm:p-4 space-y-1.5 overflow-y-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                Payment Options
              </span>

              {/* UPI Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  activeTab === 'upi'
                    ? 'bg-white shadow-xs border border-pink-200 text-[#9f2066] font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>UPI / QR</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">Fastest</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal">GPay, PhonePe, Paytm, QR</p>
                </div>
              </button>

              {/* Card Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  activeTab === 'card'
                    ? 'bg-white shadow-xs border border-pink-200 text-[#9f2066] font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">Cards (Credit/Debit)</div>
                  <p className="text-[10px] text-slate-400 font-normal">Visa, Mastercard, RuPay</p>
                </div>
              </button>

              {/* NetBanking Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  activeTab === 'netbanking'
                    ? 'bg-white shadow-xs border border-pink-200 text-[#9f2066] font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">Net Banking</div>
                  <p className="text-[10px] text-slate-400 font-normal">SBI, HDFC, ICICI, Axis</p>
                </div>
              </button>

              {/* COD Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('cod')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  activeTab === 'cod'
                    ? 'bg-white shadow-xs border border-pink-200 text-[#9f2066] font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">Cash on Delivery</div>
                  <p className="text-[10px] text-slate-400 font-normal">Pay at doorstep with cash/UPI</p>
                </div>
              </button>

              <div className="pt-4 px-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero convenience fee on all methods.</span>
              </div>
            </div>

            {/* Right Interactive Payment Details Pane */}
            <div className="md:col-span-7 p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* TAB 1: UPI */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Scan QR Code or Select UPI App
                    </h4>
                    <p className="text-[11px] text-slate-500">Scan using any UPI app to make instant payment.</p>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="relative p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                      {/* Realistic Mock SVG QR Code */}
                      <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none">
                        <rect width="100" height="100" fill="white" />
                        <rect x="10" y="10" width="25" height="25" fill="#0f172a" rx="2" />
                        <rect x="15" y="15" width="15" height="15" fill="white" />
                        <rect x="18" y="18" width="9" height="9" fill="#0f172a" />
                        <rect x="65" y="10" width="25" height="25" fill="#0f172a" rx="2" />
                        <rect x="70" y="15" width="15" height="15" fill="white" />
                        <rect x="73" y="18" width="9" height="9" fill="#0f172a" />
                        <rect x="10" y="65" width="25" height="25" fill="#0f172a" rx="2" />
                        <rect x="15" y="70" width="15" height="15" fill="white" />
                        <rect x="18" y="73" width="9" height="9" fill="#0f172a" />
                        {/* Dots */}
                        <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                        <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
                        <rect x="42" y="30" width="6" height="6" fill="#0f172a" />
                        <rect x="52" y="42" width="6" height="6" fill="#0f172a" />
                        <rect x="22" y="45" width="6" height="6" fill="#0f172a" />
                        <rect x="72" y="45" width="6" height="6" fill="#0f172a" />
                        <rect x="42" y="60" width="6" height="6" fill="#0f172a" />
                        <rect x="65" y="65" width="6" height="6" fill="#0f172a" />
                        <rect x="78" y="75" width="6" height="6" fill="#0f172a" />
                        <rect x="50" y="80" width="6" height="6" fill="#0f172a" />
                      </svg>
                      <div className="absolute inset-x-2 top-2 h-0.5 bg-emerald-500 shadow-sm animate-pulse" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">QR Code Valid For</span>
                      <div className="text-sm font-bold text-slate-900 font-mono">{formatTimer(countdown)} mins</div>
                      <p className="text-[10px] text-slate-500">BHIM UPI / GPay / PhonePe / Paytm / Amazon Pay</p>
                    </div>
                  </div>

                  {/* 1-Click Simulation Button */}
                  <button
                    type="button"
                    onClick={() => handleSimulatePayment('upi')}
                    disabled={isProcessing}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>⚡ 1-Click Simulate UPI Approval ({formatPrice(totalAmount)})</span>
                  </button>

                  {/* UPI ID manual input */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Or Pay using UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#9f2066]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSimulatePayment('upi')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Verify & Pay
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Card */}
              {activeTab === 'card' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Enter Card Details</h4>
                      <p className="text-[11px] text-slate-500">Supports all major Credit & Debit cards.</p>
                    </div>
                    <div className="flex gap-1.5 text-[10px] font-bold text-slate-500">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded">VISA</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded">Mastercard</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-emerald-700">RuPay</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8921 4410 8892"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono tracking-wider focus:border-[#9f2066]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Valid Thru (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="08/28"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none text-center font-mono focus:border-[#9f2066]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none text-center font-mono focus:border-[#9f2066]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Pooja Sharma"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#9f2066]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSimulatePayment('card')}
                    disabled={isProcessing}
                    className="w-full py-3 bg-[#9f2066] hover:bg-[#851b55] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay {formatPrice(totalAmount)} Securely</span>
                  </button>
                </div>
              )}

              {/* TAB 3: Net Banking */}
              {activeTab === 'netbanking' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Popular Indian Banks</h4>
                    <p className="text-[11px] text-slate-500">Direct simulated net-banking gateway routing.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra Bank'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => handleSimulatePayment('netbanking')}
                        className="p-3 border border-slate-200 hover:border-[#9f2066] rounded-xl text-left bg-slate-50 hover:bg-pink-50/40 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Cash on Delivery */}
              {activeTab === 'cod' && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                      <Banknote className="w-4 h-4 text-purple-600" />
                      <span>Doorstep Cash / QR Collection</span>
                    </div>
                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      You can pay via Cash or scan delivery executive's UPI QR when your order arrives.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSimulatePayment('cod', true)}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Cash on Delivery Order</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Security Seal */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PCI-DSS Level 1 Compliant Mock Sandbox</span>
          </div>
          <span className="text-[10px] text-slate-400">BharatBazaar v3.0</span>
        </div>
      </div>
    </div>
  );
};
