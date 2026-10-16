import React from 'react';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Headphones, Lock } from 'lucide-react';
import { Link } from './Navigation';
import { CATEGORIES } from '../data/products';
import { useSearch } from '../context/SearchContext';

export const Footer: React.FC = () => {
  const { setSelectedCategory } = useSearch();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-xs">
      {/* Buyer Protection Trust Strip */}
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100/70 text-[#9f2066] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Free Delivery</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Across 28,000+ pin codes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100/70 text-[#9f2066] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">7-Day Easy Returns</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Instant refunds guaranteed</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100/70 text-[#9f2066] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Quality Inspected</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Direct from verified suppliers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100/70 text-[#9f2066] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">100% Safe Payments</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Cash on Delivery & Secure UPI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#9f2066] to-[#e01968] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[#9f2066] tracking-tight">
                Bharat<span className="text-slate-900">Bazaar</span>
              </span>
            </Link>

            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              BharatBazaar empowers Indian households to shop directly from manufacturers and craft clusters at honest, accessible prices. Over 15 million happy customers across India.
            </p>

            <div className="flex items-center gap-2 text-slate-500 text-xs pt-1">
              <Headphones className="w-4 h-4 text-[#9f2066]" />
              <span>Customer Care: <strong>help@bharatbazaar.in</strong> (Mon–Sat 9AM–7PM)</span>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Shop Categories
            </h5>
            <ul className="space-y-2">
              {CATEGORIES.slice(1).map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#9f2066] transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Customer Support
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-[#9f2066] transition-colors">
                  Sign In / My Account
                </Link>
              </li>
              <li>
                <Link href="/order-history" className="hover:text-[#9f2066] transition-colors">
                  My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#9f2066] transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#9f2066] transition-colors">
                  7-Day Return & Exchange Policy
                </Link>
              </li>
              <li>
                <span className="hover:text-[#9f2066] cursor-pointer">
                  Shipping & Delivery FAQs
                </span>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Trust & Legal
            </h5>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-[#9f2066] cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-[#9f2066] cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#9f2066] cursor-pointer">
                  Supplier Code of Conduct
                </span>
              </li>
              <li>
                <span className="hover:text-[#9f2066] cursor-pointer">
                  Grievance Redressal
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} BharatBazaar Commerce Pvt Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Made with pride for Indian consumers</span>
            <span aria-hidden="true">·</span>
            <span>100% Secure Checkout</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
