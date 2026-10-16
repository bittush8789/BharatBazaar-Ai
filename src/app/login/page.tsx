import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useRouter } from '../../components/Navigation';
import {
  Sparkles,
  Phone,
  Lock,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  User as UserIcon,
  ShoppingBag,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const { user, isAuthenticated, sendOtp, verifyOtp, loginWithEmail, loginWithGoogle, loginAsDemo, logout } = useAuth();
  const router = useRouter();

  const [authMode, setAuthMode] = useState<'otp' | 'email'>('otp');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  
  // Google sign in state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isGoogleCustom, setIsGoogleCustom] = useState(false);

  // Phone form state
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & error state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
    setErrorMessage('');
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    
    if (phone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setStep('otp');
        setTimer(30);
        setCanResend(false);
        setSuccessNotice(`OTP sent successfully to +91 ${phone}`);
        setOtp(['', '', '', '']);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
    setErrorMessage('');

    // Auto-focus next input
    if (clean && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleFillDemoOtp = () => {
    setOtp(['4', '3', '2', '1']);
    setErrorMessage('');
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      setErrorMessage('Please enter the complete 4-digit OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await verifyOtp(phone, enteredOtp, fullName);
      if (res.success) {
        setSuccessNotice('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        setErrorMessage(res.message || 'Invalid OTP. Please enter 4321.');
      }
    } catch {
      setErrorMessage('Verification failed. Try demo OTP: 4321');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        setSuccessNotice('Signed in successfully! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        setErrorMessage(res.message || 'Login failed. Check your credentials.');
      }
    } catch {
      setErrorMessage('Error logging in with email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    loginAsDemo();
    setSuccessNotice('Logged in as Pooja Sharma! Redirecting...');
    setTimeout(() => {
      router.push('/');
    }, 600);
  };

  const handleGoogleSelect = async (accountEmail: string, accountName: string, accountAvatar?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginWithGoogle({
        email: accountEmail,
        name: accountName,
        avatar: accountAvatar,
      });
      if (res.success) {
        setShowGoogleModal(false);
        setSuccessNotice(`Signed in with Google as ${accountName}! Redirecting...`);
        setTimeout(() => {
          router.push('/');
        }, 600);
      } else {
        setErrorMessage(res.message || 'Google Sign-in failed.');
      }
    } catch {
      setErrorMessage('Google Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already logged in, show personalized account summary
  if (isAuthenticated && user) {
    return (
      <div className="min-h-[80vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="w-20 h-20 rounded-full bg-pink-100 text-[#9f2066] mx-auto flex items-center justify-center text-2xl font-extrabold shadow-inner mb-4">
            {user.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Currently Signed In</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">+91 {user.phone}</p>
          {user.email && <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>}

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5">
            <Link
              href="/"
              className="w-full py-3 px-4 bg-[#9f2066] hover:bg-[#851b55] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <Link
              href="/order-history"
              className="w-full py-2.5 px-4 bg-pink-50 hover:bg-pink-100/80 text-[#9f2066] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>View My Orders & Tracking</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-pink-50/40 to-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Left Column: Meesho Value Proposition Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#9f2066] to-[#d61864] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-[#9f2066] flex items-center justify-center font-bold shadow-md">
                <Sparkles className="w-5 h-5 text-[#9f2066]" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight">BharatBazaar</span>
                <p className="text-[10px] tracking-wider text-pink-200 uppercase font-medium">India's Value Store</p>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <h2 className="text-2xl font-extrabold leading-snug">
                Direct from Factories at Wholesale Prices!
              </h2>
              <p className="text-xs text-pink-100 leading-relaxed font-normal">
                Sign in to manage your wishlist, track ongoing courier deliveries, and claim exclusive vouchers.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl text-xs">
                <Truck className="w-4 h-4 text-pink-200 shrink-0" />
                <span>Free Delivery across 28,000+ PIN codes</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl text-xs">
                <RotateCcw className="w-4 h-4 text-pink-200 shrink-0" />
                <span>7-Day Easy Doorstep Returns</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl text-xs">
                <ShieldCheck className="w-4 h-4 text-pink-200 shrink-0" />
                <span>100% Safe Payments & Cash on Delivery</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-pink-400/30 mt-6 flex items-center justify-between text-[11px] text-pink-200 font-medium">
            <span>15M+ Happy Indian Shoppers</span>
            <span>⭐ 4.6 / 5 App Rating</span>
          </div>
        </div>

        {/* Right Column: Interactive Login / Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header / Mode Switcher */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Sign In or Register
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Access your cart, wishlist, and orders
                </p>
              </div>

              {/* Quick 1-Click Demo Button */}
              <button
                type="button"
                onClick={handleQuickDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 transition-colors cursor-pointer shadow-2xs"
                title="Instant login as test user"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>1-Click Demo</span>
              </button>
            </div>

            {/* Login Required Gate Notice */}
            <div className="mt-4 p-3 bg-pink-50 border border-pink-200 text-[#9f2066] rounded-xl flex items-center gap-2.5 text-xs">
              <Lock className="w-4 h-4 shrink-0 text-[#9f2066]" />
              <div>
                <span className="font-bold">Authentication Required:</span> Please sign in or click <strong className="text-amber-800">"1-Click Demo"</strong> to unlock BharatBazaar products, orders & microservices.
              </div>
            </div>

            {/* Google Sign-in Option */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full mt-4 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              {/* Google 4-color SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-400">
                <span className="bg-white px-2">Or continue with Mobile / Email</span>
              </div>
            </div>

            {/* Auth Mode Tabs (Mobile OTP vs Email) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl my-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'otp'
                    ? 'bg-white text-[#9f2066] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mobile Number (OTP)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'email'
                    ? 'bg-white text-[#9f2066] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Email & Password
              </button>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successNotice && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Form 1: Mobile OTP Flow */}
            {authMode === 'otp' && (
              <>
                {step === 'phone' ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label htmlFor="login-phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#9f2066] focus-within:border-transparent">
                        <div className="bg-slate-50 px-3 py-2.5 border-r border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-slate-700 select-none">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          id="login-phone"
                          type="tel"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="Enter 10-digit mobile number"
                          className="flex-1 px-3 py-2.5 text-sm text-slate-900 outline-none font-mono"
                          autoFocus
                          maxLength={10}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        We will send a 4-digit verification code to this number.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="login-name" className="block text-xs font-semibold text-slate-600 mb-1">
                        Full Name <span className="text-slate-400 font-normal">(Optional for new users)</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          id="login-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Aarti Verma"
                          className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#9f2066] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || phone.length < 10}
                      className="w-full py-3 bg-[#9f2066] hover:bg-[#851b55] disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:cursor-not-allowed"
                    >
                      <span>{isLoading ? 'Sending Code...' : 'Send OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">
                        Code sent to: <strong className="text-slate-900">+91 {phone}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('phone');
                          setErrorMessage('');
                        }}
                        className="text-xs text-[#9f2066] font-semibold hover:underline cursor-pointer"
                      >
                        Change Number
                      </button>
                    </div>

                    {/* Demo Hint Banner */}
                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 flex items-center justify-between text-xs text-[#9f2066]">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <span>🔑 Demo Code:</span>
                        <code className="bg-white px-2 py-0.5 rounded font-bold border border-pink-200">
                          4321
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={handleFillDemoOtp}
                        className="text-xs font-bold underline hover:text-[#7f154f] cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Enter 4-Digit Verification Code
                      </label>
                      <div className="flex gap-3 justify-center">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-input-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-12 h-12 text-center text-lg font-bold border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#9f2066] focus:border-transparent font-mono bg-slate-50 focus:bg-white"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      {timer > 0 ? (
                        <span className="text-slate-500 font-mono">
                          Resend code in <strong>00:{timer < 10 ? `0${timer}` : timer}</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          disabled={!canResend}
                          className="text-[#9f2066] font-bold hover:underline cursor-pointer"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.join('').length !== 4}
                      className="w-full py-3 bg-[#9f2066] hover:bg-[#851b55] disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:cursor-not-allowed"
                    >
                      <span>{isLoading ? 'Verifying...' : 'Verify & Sign In'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Form 2: Email & Password Flow */}
            {authMode === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. shopper@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#9f2066] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#9f2066] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#9f2066] font-semibold hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full py-3 bg-[#9f2066] hover:bg-[#851b55] disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? 'Signing In...' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Footer Agreement Disclaimer */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed">
            By proceeding, you agree to BharatBazaar's{' '}
            <span className="text-slate-600 underline cursor-pointer">Terms & Conditions</span> and{' '}
            <span className="text-slate-600 underline cursor-pointer">Privacy Policy</span>.
          </div>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 text-center border-b border-slate-100">
              <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500 mt-0.5">Choose an account to continue to BharatBazaar</p>
            </div>

            {/* Account List */}
            <div className="p-3 space-y-1">
              <button
                type="button"
                onClick={() => handleGoogleSelect('pooja.sharma.google@gmail.com', 'Pooja Sharma', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80')}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-pink-100 text-[#9f2066] font-bold flex items-center justify-center shrink-0">
                  PS
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 truncate">Pooja Sharma</div>
                  <div className="text-[11px] text-slate-500 truncate">pooja.sharma.google@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSelect('bittu.sharma@gmail.com', 'Bittu Sharma', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80')}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  BS
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 truncate">Bittu Sharma</div>
                  <div className="text-[11px] text-slate-500 truncate">bittu.sharma@gmail.com</div>
                </div>
              </button>

              {/* Custom account toggle */}
              {!isGoogleCustom ? (
                <button
                  type="button"
                  onClick={() => setIsGoogleCustom(true)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left text-xs font-semibold text-slate-600 transition-colors cursor-pointer border-t border-slate-100 mt-1"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span>Use another account</span>
                </button>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 mt-2">
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Your Name (e.g. Amit Kumar)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                  />
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    disabled={!customGoogleEmail || !customGoogleName}
                    onClick={() => handleGoogleSelect(customGoogleEmail, customGoogleName)}
                    className="w-full py-2 bg-[#4285F4] hover:bg-[#3367d6] disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Continue as {customGoogleName || 'Google User'}
                  </button>
                </div>
              )}
            </div>

            {/* Cancel Button */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  setIsGoogleCustom(false);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
