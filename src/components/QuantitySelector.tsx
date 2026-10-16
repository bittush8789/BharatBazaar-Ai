import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 10,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const btnPadding = isSm ? 'p-1' : isLg ? 'p-2.5' : 'p-1.5';
  const iconSize = isSm ? 'w-3.5 h-3.5' : isLg ? 'w-4 h-4' : 'w-4 h-4';
  const textClass = isSm ? 'text-xs min-w-6' : isLg ? 'text-base min-w-10' : 'text-sm min-w-8';

  return (
    <div className="inline-flex items-center border border-slate-200 rounded-lg bg-white shadow-xs">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className={`${btnPadding} text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-lg`}
      >
        <Minus className={iconSize} />
      </button>

      <span className={`${textClass} font-semibold text-center tabular-nums text-slate-800 select-none`}>
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max}
        aria-label="Increase quantity"
        className={`${btnPadding} text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-lg`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
};
