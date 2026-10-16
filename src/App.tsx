import React from 'react';
import { RouterProvider, usePathname } from './components/Navigation';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SearchProvider } from './context/SearchContext';
import RootLayout from './app/layout';

// Page components
import HomePage from './app/page';
import ProductDetailPage from './app/products/[id]/page';
import CartPage from './app/cart/page';
import WishlistPage from './app/wishlist/page';
import CheckoutPage from './app/checkout/page';
import OrderSuccessPage from './app/order-success/page';
import OrderHistoryPage from './app/order-history/page';
import ReturnPolicyPage from './app/returns/page';
import LoginPage from './app/login/page';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRouter() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Enforce: User must login first before using any services
  if (!isAuthenticated) {
    return (
      <RootLayout>
        <LoginPage />
      </RootLayout>
    );
  }

  const renderCurrentPage = () => {
    // Dynamic product route: /products/:id
    if (pathname.startsWith('/products/')) {
      return <ProductDetailPage />;
    }

    switch (pathname) {
      case '/':
        return <HomePage />;
      case '/cart':
        return <CartPage />;
      case '/wishlist':
        return <WishlistPage />;
      case '/checkout':
        return <CheckoutPage />;
      case '/order-success':
        return <OrderSuccessPage />;
      case '/order-history':
      case '/orders':
        return <OrderHistoryPage />;
      case '/returns':
      case '/return-policy':
        return <ReturnPolicyPage />;
      case '/login':
      case '/signin':
      case '/register':
      case '/account':
        return <LoginPage />;
      default:
        // Default to HomePage if unknown route or clean redirect
        return <HomePage />;
    }
  };

  return <RootLayout>{renderCurrentPage()}</RootLayout>;
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <AppRouter />
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
