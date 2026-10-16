import React from 'react';
import { Link } from '../../components/Navigation';
import {
  RotateCcw,
  CheckCircle2,
  Truck,
  Banknote,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Package,
  Clock,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';

export default function ReturnPolicyPage() {
  const steps = [
    {
      step: '01',
      title: 'Submit Request within 7 Days',
      desc: 'Go to your "My Orders" page, find the delivered item, and click "Request Return". Select your return reason.',
      icon: Package,
    },
    {
      step: '02',
      title: 'Free Doorstep Pickup',
      desc: 'Our delivery partner will arrive at your address within 24 to 48 hours to collect the item. Zero reverse-shipping charges.',
      icon: Truck,
    },
    {
      step: '03',
      title: 'Rapid Quality Check',
      desc: 'The courier agent inspects the tags and item condition on the spot. No packaging carton required.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Instant 100% Refund',
      desc: 'Once handed over, the refund is triggered immediately to your UPI ID, bank account, or original payment method.',
      icon: Banknote,
    },
  ];

  const faqs = [
    {
      q: 'How many days do I have to return an item?',
      a: 'You can request a return or exchange within 7 days from the timestamp of delivery. After 7 days, the return window closes automatically.',
    },
    {
      q: 'Do I have to pay any pickup or return fees?',
      a: 'No! BharatBazaar provides 100% free doorstep pickup across all serviceable Indian PIN codes. There are zero hidden deduction charges.',
    },
    {
      q: 'How do I receive my refund for Cash on Delivery (COD) orders?',
      a: 'For COD orders, you can enter any valid UPI ID (GPay, PhonePe, Paytm, BHIM) or bank account details during return initiation. Funds are credited instantly upon doorstep pickup verification.',
    },
    {
      q: 'What condition should the product be in?',
      a: 'Items must be unused, unwashed, and returned with original brand tags and polybag intact. For cosmetics and skincare, the hygiene foil seal must not be broken.',
    },
    {
      q: 'Can I request a size exchange instead of a refund?',
      a: 'Yes, you can select "Exchange for different size" while submitting your return request if alternative sizes are currently in stock.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#9f2066] transition-colors"
          >
            <span>Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#9f2066]">7-Day Return Policy</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#9f2066] via-[#be185d] to-[#831843] rounded-3xl p-6 sm:p-10 text-white shadow-sm mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold text-pink-100">
              <RotateCcw className="w-3.5 h-3.5 text-pink-200" />
              <span>Hassle-Free Doorstep Guarantee</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              BharatBazaar 7-Day Free Return & Exchange Policy
            </h1>

            <p className="text-xs sm:text-sm text-pink-100 leading-relaxed font-normal">
              Shop with complete peace of mind. If you are not 100% satisfied with the size, fit, fabric, or quality of your purchase, return it easily within 7 days of delivery for a full refund.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/order-history"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#9f2066] hover:bg-pink-50 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Request Return on Past Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Step by Step Process */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="text-center max-w-lg mx-auto mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              How the 7-Day Return Process Works
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Simple 4-step doorstep pickup without paperwork or hassle
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-4 hover:border-pink-200 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#9f2066] flex items-center justify-center font-black text-sm shrink-0 border border-pink-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#9f2066] uppercase tracking-wider">
                        Step {st.step}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">{st.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What is covered vs Not covered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Covered */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 text-emerald-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Eligible for 7-Day Return
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Size or fitting issues on Kurtis, Sarees, Dresses, Shirts, and Jackets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Defective, damaged, or torn fabric discovered upon unboxing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Different color, design, or print received compared to the product listing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Home decor, cookware, and bedsheets in unwashed, original condition.</span>
              </li>
            </ul>
          </div>

          {/* Not covered */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 text-rose-700">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Exceptions & Guidelines
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Returns requested after 7 calendar days from the confirmed delivery date.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Skincare, hair oils, or lipsticks with broken hygienic seals or used contents.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Items that have been washed, perfumed, or have missing price tags.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Products damaged due to customer misuse or rough handling.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-[#9f2066]" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {faqs.map((faq, i) => (
              <div key={i} className="pt-4 first:pt-0 space-y-1">
                <h4 className="text-xs font-bold text-slate-900">{faq.q}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Support Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#9f2066] flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Need personal assistance with your return?</p>
              <p className="text-slate-500 text-[11px]">
                Call our toll-free customer desk at <strong>1800-200-9820</strong> (Mon–Sat, 9 AM – 7 PM)
              </p>
            </div>
          </div>

          <Link
            href="/order-history"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#9f2066] hover:bg-[#831843] text-white font-bold rounded-xl transition-colors cursor-pointer text-xs shrink-0"
          >
            <span>View My Delivered Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
