import React from 'react';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types/product';
import { formatPrice } from '../lib/utils';
import { ProductImage } from './ProductImage';
import { Link } from './Navigation';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart, items } = useCart();

  const isFavorited = isInWishlist(product.id);
  const cartItem = items.find((item) => item.product.id === product.id);
  const inCartQuantity = cartItem ? cartItem.quantity : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group flex flex-col bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Top Image Showcase */}
      <Link href={`/products/${product.id}`} className="relative aspect-4/3 w-full block overflow-hidden bg-slate-50">
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.category}
          className="group-hover:scale-103 transition-transform duration-300"
        />

        {/* Wishlist Floating Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs border border-black/5 flex items-center justify-center text-slate-500 hover:text-[#e01968] transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isFavorited ? 'fill-[#e01968] text-[#e01968] scale-110' : ''
            }`}
          />
        </button>

        {/* Free Delivery Tag in Meesho Style */}
        {product.freeDelivery && (
          <span className="absolute bottom-2 left-2 z-10 text-[10px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-sm shadow-xs">
            Free Delivery
          </span>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm font-bold text-[11px]">
              <span>{product.rating}</span>
              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            </div>
          </div>

          {/* Product Name */}
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-[#9f2066] transition-colors"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Pricing Row */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-slate-400 line-through tabular-nums">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {product.discountPercentage}% off
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mt-0.5">
            M.R.P. incl. of all taxes
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {inCartQuantity > 0 ? (
            <button
              type="button"
              onClick={handleAddToCartClick}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-pink-50 text-[#9f2066] border border-pink-200 rounded-lg text-xs font-bold hover:bg-pink-100 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>In Cart ({inCartQuantity}) + Add More</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCartClick}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#9f2066] text-white rounded-lg text-xs font-bold hover:bg-[#831843] transition-colors shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
