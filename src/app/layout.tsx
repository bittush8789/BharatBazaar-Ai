import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#f8f9fa] text-slate-800">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
