import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { microservicesApi } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; otp: string; message: string }>;
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (data?: { email?: string; name?: string; avatar?: string }) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: () => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const DEFAULT_DEMO_USER: User = {
  id: 'usr_demo_101',
  name: 'Pooja Sharma',
  phone: '9876543210',
  email: 'pooja.sharma@example.com',
  gender: 'female',
  isLoggedIn: true,
  memberSince: 'March 2024',
  savedAddress: {
    street: 'Flat 402, Lotus Greens, Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  sendOtp: async () => ({ success: false, otp: '', message: '' }),
  verifyOtp: async () => ({ success: false }),
  loginWithEmail: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  loginAsDemo: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bb_auth_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.isLoggedIn) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse user from local storage', e);
      }
    }
    return null;
  });

  // Re-verify session with Backend on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('bb_auth_token');
      if (token) {
        microservicesApi.getCurrentUser(token).then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
          }
        }).catch((err) => {
          console.warn('[AuthContext] Backend sync fallback:', err);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('bb_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('bb_auth_user');
        localStorage.removeItem('bb_auth_token');
      }
    }
  }, [user]);

  const sendOtp = async (phone: string): Promise<{ success: boolean; otp: string; message: string }> => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, otp: '', message: 'Please enter a valid 10-digit mobile number' };
    }

    try {
      const res = await microservicesApi.sendOtp(cleanPhone);
      if (res.success) {
        return {
          success: true,
          otp: res.otp || '4321',
          message: res.message || `OTP sent to +91 ${cleanPhone}. (Use demo OTP: ${res.otp || '4321'})`,
        };
      }
      return { success: false, otp: '', message: res.message || 'Failed to send OTP' };
    } catch (err) {
      // Local fallback
      const generatedOtp = '4321';
      return {
        success: true,
        otp: generatedOtp,
        message: `OTP sent to +91 ${cleanPhone}. (Use demo OTP: ${generatedOtp})`,
      };
    }
  };

  const verifyOtp = async (phone: string, otp: string, name?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, message: 'Invalid mobile number' };
    }

    try {
      const res = await microservicesApi.verifyOtp(cleanPhone, otp, name);
      if (res.success && res.user) {
        if (res.token && typeof window !== 'undefined') {
          localStorage.setItem('bb_auth_token', res.token);
        }
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Invalid OTP' };
    } catch (err) {
      // Fallback
      if (otp !== '4321' && otp !== '123456') {
        return { success: false, message: 'Invalid OTP. Enter 4321 or 123456 to test.' };
      }
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: name && name.trim() ? name.trim() : `Shopper ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        email: `${cleanPhone}@bharatbazaar.in`,
        isLoggedIn: true,
        memberSince: new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(new Date()),
        savedAddress: {
          street: 'A-24, Green Park Extension',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110016',
        },
      };
      setUser(newUser);
      return { success: true };
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    try {
      const res = await microservicesApi.loginWithEmail(email, password);
      if (res.success && res.user) {
        if (res.token && typeof window !== 'undefined') {
          localStorage.setItem('bb_auth_token', res.token);
        }
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      const emailName = email.split('@')[0];
      const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: formattedName || 'Verified Shopper',
        phone: '9876543210',
        email: email.trim().toLowerCase(),
        isLoggedIn: true,
        memberSince: 'Just now',
      };
      setUser(newUser);
      return { success: true };
    }
  };

  const loginWithGoogle = async (data?: { email?: string; name?: string; avatar?: string }): Promise<{ success: boolean; message?: string }> => {
    const googleEmail = data?.email || 'pooja.sharma.google@gmail.com';
    const googleName = data?.name || 'Pooja Sharma';
    const googleAvatar = data?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80';

    try {
      const res = await microservicesApi.loginWithGoogle({
        email: googleEmail,
        name: googleName,
        avatar: googleAvatar,
        googleId: `goog_${Math.floor(100000000 + Math.random() * 900000000)}`,
      });

      if (res.success && res.user) {
        if (res.token && typeof window !== 'undefined') {
          localStorage.setItem('bb_auth_token', res.token);
        }
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Google Sign-in failed' };
    } catch (err) {
      const newUser: User = {
        id: `usr_goog_${Date.now()}`,
        name: googleName,
        email: googleEmail,
        phone: '+91-Google-User',
        avatar: googleAvatar,
        isLoggedIn: true,
        memberSince: 'Google Verified',
        savedAddress: {
          street: 'Google Tech Park, Cyber City',
          city: 'Gurugram',
          state: 'Haryana',
          pincode: '122002',
        },
      };
      setUser(newUser);
      return { success: true };
    }
  };

  const loginAsDemo = () => {
    verifyOtp('9876543210', '4321', 'Pooja Sharma').catch(() => {
      setUser(DEFAULT_DEMO_USER);
    });
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bb_auth_user');
      localStorage.removeItem('bb_auth_token');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };

      // Sync with backend if token available
      const token = typeof window !== 'undefined' ? localStorage.getItem('bb_auth_token') : null;
      if (token) {
        microservicesApi.updateProfile(token, updates).catch((e) => console.warn('Profile sync warning:', e));
      }

      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user?.isLoggedIn,
        sendOtp,
        verifyOtp,
        loginWithEmail,
        loginWithGoogle,
        loginAsDemo,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
