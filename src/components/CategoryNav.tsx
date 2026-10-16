import React from 'react';
import { CATEGORIES } from '../data/products';
import { useSearch } from '../context/SearchContext';
import { useRouter, usePathname } from './Navigation';
import { Sparkles, Shirt, Home, Heart, ShoppingBag, Grid } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  All: Grid,
  "Women's Clothing": Sparkles,
  "Men's Clothing": Shirt,
  'Home & Kitchen': Home,
  'Beauty & Personal Care': Heart,
  Accessories: ShoppingBag,
};

export const CategoryNav: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useSearch();
  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (cat: string) => {
    setSelectedCategory(cat);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth"
          aria-label="Product categories"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const Icon = CATEGORY_ICONS[cat] || Grid;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelect(cat)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#9f2066] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
