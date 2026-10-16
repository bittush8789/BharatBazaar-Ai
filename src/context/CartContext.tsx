import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;
  originalSubtotal: number;
  totalSavings: number;
  deliveryFee: number;
  finalTotal: number;
  isHydrated: boolean;
  toastMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bharatbazaar_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from LocalStorage safely on client mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to read cart from localStorage', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist to LocalStorage whenever items change after initial hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to save cart to localStorage', err);
    }
  }, [items, isHydrated]);

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (quantity < 1) return;
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prevItems, { product, quantity }];
    });
    showToast(`Added ${quantity > 1 ? `${quantity} items of ` : ''}"${product.name.slice(0, 24)}..." to cart`);
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.min(10, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Derived calculations
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const originalSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0),
    [items]
  );

  const totalSavings = useMemo(
    () => Math.max(0, originalSubtotal - subtotal),
    [originalSubtotal, subtotal]
  );

  const deliveryFee = 0; // Free delivery Meesho style
  const finalTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalQuantity,
        subtotal,
        originalSubtotal,
        totalSavings,
        deliveryFee,
        finalTotal,
        isHydrated,
        toastMessage,
      }}
    >
      {children}
      {/* Non-intrusive floating toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#f43397]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
