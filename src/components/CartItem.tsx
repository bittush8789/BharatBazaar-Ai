import React from 'react';
import { Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../types/cart';
import { formatPrice } from '../lib/utils';
import { ProductImage } from './ProductImage';
import { QuantitySelector } from './QuantitySelector';
import { Link } from './Navigation';
import { useCart } from '../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart } = useCart();

  const itemTotal = product.price * quantity;
  const itemOriginalTotal = product.originalPrice * quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl gap-4 shadow-xs">
      {/* Product Image & Info */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <Link
          href={`/products/${product.id}`}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-slate-200"
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            category={product.category}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            {product.category}
          </span>

          <Link
            href={`/products/${product.id}`}
            className="block text-sm font-semibold text-slate-900 truncate hover:text-[#9f2066] transition-colors mt-0.5"
          >
            {product.name}
          </Link>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-slate-400 line-through tabular-nums">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {product.discountPercentage}% off
            </span>
          </div>

          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            ✓ Free Delivery & 7 Days Return
          </div>
        </div>
      </div>

      {/* Quantity & Item Total Column */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <div className="flex items-center gap-2">
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => updateQuantity(product.id, quantity + 1)}
            onDecrease={() => updateQuantity(product.id, quantity - 1)}
            size="sm"
          />
        </div>

        <div className="text-right min-w-[90px]">
          <div className="text-sm font-bold text-slate-900 tabular-nums">
            {formatPrice(itemTotal)}
          </div>
          {itemOriginalTotal > itemTotal && (
            <div className="text-[11px] text-emerald-600 font-medium">
              Saved {formatPrice(itemOriginalTotal - itemTotal)}
            </div>
          )}
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => removeFromCart(product.id)}
          aria-label="Remove item"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
