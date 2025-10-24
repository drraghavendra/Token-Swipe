import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface Wallet {
  address: string;
  chainId: number;
}

interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, wallet: Wallet, token: string) => void;
  logout: () => void;
  updateWallet: (wallet: Wallet) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      wallet: null,
      sessionToken: null,
      isAuthenticated: false,
      login: (user, wallet, sessionToken) => 
        set({ user, wallet, sessionToken, isAuthenticated: true }),
      logout: () => 
        set({ user: null, wallet: null, sessionToken: null, isAuthenticated: false }),
      updateWallet: (wallet) => set({ wallet }),
    }),
    {
      name: 'token-swipe-auth',
    }
  )
);