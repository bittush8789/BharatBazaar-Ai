export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: 'female' | 'male' | 'other';
  avatar?: string;
  savedAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  isLoggedIn: boolean;
  memberSince?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
