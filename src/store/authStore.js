import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Set user and token
      setAuth: (user, token) => {
        if (token) {
          localStorage.setItem('token', token);
        }
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      // Clear auth state
      clearAuth: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Set error
      setError: (error) => {
        set({ error, isLoading: false });
      },

      // Set loading
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Register user
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.register(userData);
          get().setAuth(data.data, data.token);
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Login user
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.login(credentials);
          get().setAuth(data.data, data.token);
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Logout user
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },

      // Get current user
      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          get().clearAuth();
          return;
        }

        set({ isLoading: true });
        try {
          const { data } = await authAPI.getMe();
          set({
            user: data.data,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          console.error('authStore: Fetch user failed:', error.response?.status);
          get().clearAuth();
          set({ isLoading: false });
          return { success: false };
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.updateProfile(profileData);
          set({
            user: data.data,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Update failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Update password
      updatePassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.updatePassword(passwordData);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Password update failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, verify the token still exists in localStorage
        if (state) {
          const token = localStorage.getItem('token');
          if (!token && state.isAuthenticated) {
            // Token is missing but state says authenticated - clear state
            console.log('authStore: Token missing after rehydration, clearing auth');
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
          }
        }
      },
    }
  )
);

export default useAuthStore;
