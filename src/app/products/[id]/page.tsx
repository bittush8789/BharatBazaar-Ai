import React, { useState } from 'react';
import { useParams, useRouter, Link } from '../../../components/Navigation';
import { PRODUCTS } from '../../../data/products';
import { formatPrice } from '../../../lib/utils';
import { ProductImage } from '../../../components/ProductImage';
import { QuantitySelector } from '../../../components/QuantitySelector';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Banknote,
  Check,
  Zap,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, items } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested product may have been discontinued or does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9f2066] text-white text-xs font-bold rounded-lg hover:bg-[#831843] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const cartItem = items.find((item) => item.product.id === product.id);
  const inCartQty = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product, selectedQuantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedQuantity);
    router.push('/checkout');
  };

  // Related products from the same category
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-16 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back button */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#9f2066] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Products</span>
          </Link>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Left Column: Big Product Image & Badges */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              <ProductImage
                src={product.image}
                alt={product.name}
                category={product.category}
                priority
              />

              {/* Wishlist Button on Image */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs shadow-md border border-black/5 flex items-center justify-center text-slate-500 hover:text-[#e01968] transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorited ? 'fill-[#e01968] text-[#e01968]' : ''
                  }`}
                />
              </button>

              {/* Free Delivery Tag */}
              {product.freeDelivery && (
                <div className="absolute bottom-4 left-4 z-10 text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-md shadow-sm">
                  Free Delivery on this item
                </div>
              )}
            </div>

            {/* Quick Guarantees Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-slate-600 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                <Truck className="w-4 h-4 text-[#9f2066] mb-1" />
                <span className="font-semibold text-slate-800">Free Delivery</span>
                <span className="text-[10px] text-slate-500">In 2-4 Days</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                <Banknote className="w-4 h-4 text-[#9f2066] mb-1" />
                <span className="font-semibold text-slate-800">Pay on Delivery</span>
                <span className="text-[10px] text-slate-500">Cash / UPI</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-[#9f2066] mb-1" />
                <span className="font-semibold text-slate-800">7 Days Return</span>
                <span className="text-[10px] text-slate-500">Instant Refund</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9f2066] bg-pink-50 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>

                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md font-bold text-xs">
                  <span>{product.rating}</span>
                  <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="font-medium text-slate-600">{product.ratingsCount} ratings</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Price Details */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900 tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-base text-slate-400 line-through tabular-nums">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    {product.discountPercentage}% OFF
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Inclusive of all taxes · Free Doorstep Shipping
                </p>
              </div>

              {/* Description */}
              <div className="mt-5 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Product Description
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features / Specifications */}
              {product.features && product.features.length > 0 && (
                <div className="mt-5 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Key Highlights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feat, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Select Quantity:
                </span>
                <QuantitySelector
                  quantity={selectedQuantity}
                  onIncrease={() => setSelectedQuantity((q) => Math.min(10, q + 1))}
                  onDecrease={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                  size="md"
                />
                <span className="text-xs text-slate-500">
                  (In Stock · Ready to dispatch)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 py-3.5 px-6 bg-pink-50 hover:bg-pink-100 text-[#9f2066] border border-pink-300 rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {inCartQty > 0
                      ? `Add More (Current: ${inCartQty})`
                      : 'Add to Cart'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 py-3.5 px-6 bg-[#9f2066] hover:bg-[#831843] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>BharatBazaar Buyer Protection Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products from same category */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Similar in {product.category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <Link href={`/products/${rel.id}`} className="aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-50 mb-2">
                    <ProductImage src={rel.image} alt={rel.name} category={rel.category} />
                  </Link>
                  <Link
                    href={`/products/${rel.id}`}
                    className="text-xs font-semibold text-slate-800 line-clamp-1 hover:text-[#9f2066]"
                  >
                    {rel.name}
                  </Link>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      {formatPrice(rel.price)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {rel.discountPercentage}% off
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
