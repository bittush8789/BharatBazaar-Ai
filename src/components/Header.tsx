import React, { useState } from 'react';
import { ShoppingBag, Heart, User, Sparkles, PhoneCall, ShieldCheck, ChevronDown, Package, LogOut, LogIn } from 'lucide-react';
import { Link, useRouter, usePathname } from './Navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { SearchBar } from './SearchBar';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { totalQuantity } = useCart();
  const { wishlist } = useWishlist();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, isAuthenticated, logout } = useAuth();
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleSearchSubmit = () => {
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (pathname !== '/' && value.trim()) {
      router.push('/');
    }
  };

  const handleLogout = () => {
    logout();
    setShowAccountModal(false);
  };

  return (
    <>
      {/* Top Value Banner */}
      <div className="bg-[#9f2066] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-semibold tracking-wide">Lowest Price Promise</span>
            <span aria-hidden="true" className="opacity-60">·</span>
            <span className="opacity-95">Free Delivery on All Orders</span>
            <span aria-hidden="true" className="opacity-60 hidden sm:inline">·</span>
            <span className="opacity-95 hidden sm:inline">Cash on Delivery Available</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-pink-100">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-200" />
              100% Quality Checked
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-pink-200" />
              Toll-Free Support
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Zone 1: Brand Wordmark */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9f2066] to-[#e01968] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#9f2066] font-sans">
                  Bharat<span className="text-slate-900">Bazaar</span>
                </span>
                <span className="text-[10px] -mt-1 font-medium text-slate-500 tracking-wider">
                  INDIA'S VALUE STORE
                </span>
              </div>
            </Link>

            {/* Zone 2: Search Bar */}
            <div className="hidden sm:block flex-1 max-w-xl mx-2">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
              />
            </div>

            {/* Zone 3: Actions Cluster */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Account Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(!showAccountModal)}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-slate-700 hover:text-[#9f2066] hover:bg-pink-50/60 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  aria-label="Account details"
                >
                  {isAuthenticated && user ? (
                    <div className="w-6 h-6 rounded-full bg-[#9f2066] text-white flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <User className="w-5 h-5 text-slate-600" />
                  )}
                  <span className="hidden md:inline text-xs font-semibold">
                    {isAuthenticated && user ? user.name.split(' ')[0] : 'Sign In'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
                </button>

                {showAccountModal && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {isAuthenticated && user ? (
                      <div>
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="w-10 h-10 rounded-full bg-pink-100 text-[#9f2066] flex items-center justify-center font-bold text-sm">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">+91 {user.phone}</p>
                          </div>
                        </div>

                        <div className="py-2 space-y-1 text-sm text-slate-700">
                          <Link
                            href="/order-history"
                            onClick={() => setShowAccountModal(false)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-800 font-medium"
                          >
                            <span className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-[#9f2066]" />
                              <span>My Orders</span>
                            </span>
                            <span className="text-xs text-slate-400">History</span>
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setShowAccountModal(false)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50"
                          >
                            <span className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-slate-500" />
                              <span>My Wishlist</span>
                            </span>
                            <span className="text-xs font-semibold text-[#9f2066]">{wishlist.length} saved</span>
                          </Link>
                          <Link
                            href="/cart"
                            onClick={() => setShowAccountModal(false)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50"
                          >
                            <span className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-slate-500" />
                              <span>Shopping Cart</span>
                            </span>
                            <span className="text-xs font-semibold text-[#9f2066]">{totalQuantity} items</span>
                          </Link>

                          <div className="pt-2 border-t border-slate-100 mt-1">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                            >
                              <LogOut className="w-4 h-4 text-red-500" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="pb-3 border-b border-slate-100 text-center">
                          <div className="w-11 h-11 rounded-full bg-pink-50 text-[#9f2066] flex items-center justify-center mx-auto mb-2 font-bold">
                            <Sparkles className="w-5 h-5 text-[#9f2066]" />
                          </div>
                          <p className="text-sm font-bold text-slate-900">Welcome to BharatBazaar</p>
                          <p className="text-xs text-slate-500 mt-0.5">Sign in to track orders & claim deals</p>
                        </div>

                        <div className="pt-3 space-y-2">
                          <Link
                            href="/login"
                            onClick={() => setShowAccountModal(false)}
                            className="w-full py-2.5 px-3 bg-[#9f2066] hover:bg-[#851b55] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Sign In / Register</span>
                          </Link>

                          <Link
                            href="/order-history"
                            onClick={() => setShowAccountModal(false)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-medium"
                          >
                            <span className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-slate-500" />
                              <span>Check Order Status</span>
                            </span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative flex items-center gap-1.5 px-2.5 py-2 text-slate-700 hover:text-[#9f2066] hover:bg-pink-50/60 rounded-lg text-sm font-medium transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-slate-600" />
                <span className="hidden md:inline text-xs font-semibold">Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 md:top-1 md:right-1 bg-[#e01968] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Link */}
              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 px-3 py-2 bg-pink-50 hover:bg-pink-100/80 text-[#9f2066] rounded-lg text-sm font-medium transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#9f2066]" />
                <span className="hidden md:inline text-xs font-semibold">Cart</span>
                {totalQuantity > 0 && (
                  <span className="bg-[#9f2066] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                    {totalQuantity}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar below main row */}
          <div className="sm:hidden pb-3">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
            />
          </div>
        </div>
      </header>
    </>
  );
};
