import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';
import { useCart } from './CartContext';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (product: Product) => void;
  isHydrated: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'bharatbazaar_wishlist_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { addToCart } = useCart();

  // Initialize from LocalStorage safely on client mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to read wishlist from localStorage', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.warn('Failed to save wishlist to localStorage', err);
    }
  }, [wishlist, isHydrated]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    if (wishlist.some((item) => item.id === product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const moveToCart = (product: Product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,
        isHydrated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
