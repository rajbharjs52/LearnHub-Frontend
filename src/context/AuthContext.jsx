// src/context/AuthContext.jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '../config/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      login: async (email, password) => {  // ← This is the function
        set({ isLoading: true });
        try {
          const response = await fetch('${API_URL}/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          if (data.token) {
            set({ user: data.user, token: data.token, isLoading: false });
            return data;
          }
          throw new Error(data.msg || 'Login failed');
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: () => set({ user: null, token: null }),
      setToken: (token) => set({ token }),

      // ✅ Update user in store after profile/pic changes
      updateUser: (updatedFields) => {
        set(state => ({
          user: state.user ? { ...state.user, ...updatedFields } : state.user
        }));
      },
    }),
    { name: 'auth-storage' } // Saves to localStorage
  )
);

export default useAuthStore;  // ← Default export`  