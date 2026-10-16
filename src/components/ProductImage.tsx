import React, { useState } from 'react';
import { Sparkles, Shirt, ShoppingBag, Home, Heart, Package } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  category?: string;
  className?: string;
  priority?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category = '',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Category-specific SVG accent styles and icon
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "Women's Clothing":
        return {
          bg: 'from-pink-50 via-rose-100/60 to-amber-50',
          accent: 'text-pink-600',
          badge: 'Women Ethnic',
          icon: Sparkles,
        };
      case "Men's Clothing":
        return {
          bg: 'from-slate-100 via-sky-50 to-indigo-50',
          accent: 'text-indigo-600',
          badge: 'Men Fashion',
          icon: Shirt,
        };
      case 'Home & Kitchen':
        return {
          bg: 'from-amber-50 via-orange-50 to-stone-100',
          accent: 'text-amber-700',
          badge: 'Home & Living',
          icon: Home,
        };
      case 'Beauty & Personal Care':
        return {
          bg: 'from-rose-50 via-fuchsia-50 to-pink-100',
          accent: 'text-rose-600',
          badge: 'Beauty & Glow',
          icon: Heart,
        };
      case 'Accessories':
        return {
          bg: 'from-amber-50 via-yellow-100/50 to-stone-100',
          accent: 'text-amber-600',
          badge: 'Jewelry & Bags',
          icon: ShoppingBag,
        };
      default:
        return {
          bg: 'from-slate-50 to-slate-100',
          accent: 'text-slate-600',
          badge: 'Product',
          icon: Package,
        };
    }
  };

  const theme = getCategoryTheme(category);
  const IconComponent = theme.icon;

  if (hasError) {
    return (
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br ${theme.bg} overflow-hidden select-none ${className}`}
      >
        {/* Subtle patterned watermark background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.5" />
            <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 border border-black/5">
            <IconComponent className={`w-7 h-7 ${theme.accent}`} />
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1">
            {theme.badge}
          </span>
          <p className="text-xs font-medium text-slate-700 line-clamp-2 max-w-[85%]">
            {alt}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-slate-100 overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} animate-pulse flex items-center justify-center`}>
          <IconComponent className={`w-8 h-8 ${theme.accent} opacity-40`} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
