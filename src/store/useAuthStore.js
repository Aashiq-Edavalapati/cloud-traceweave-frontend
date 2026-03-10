import { create } from 'zustand';
import { authApi } from '@/api/auth.api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isChecking: true,

  // Login
  login: async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      // Assuming backend sets HTTPOnly cookie, but we might get user data back
      set({ user: data.user, isAuthenticated: true });
      return data;
    } catch (error) {
      console.warn('Login failed', error);
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      const data = await authApi.register(userData);
      set({ user: data.user, isAuthenticated: true });
      return data;
    } catch (error) {
      console.warn('Registration failed', error);
      throw error;
    }
  },

  // Check Auth
  checkAuth: async () => {
    try {
      set({ isChecking: true });
      console.log("Entered checkAuth function");
      const data = await authApi.getMe();
      console.log("Authentication check: ", data);
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      // Cookie invalid or missing
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isChecking: false });
    }
  },

  // Update Profile
  updateProfile: async (profileData) => {
    try {
      const data = await authApi.updateProfile(profileData);
      set({ user: data.user, isAuthenticated: true });
      return data;
    } catch (error) {
      console.warn('Profile update failed', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await authApi.logout();
      set({ user: null, isAuthenticated: false });
    } catch (err) {
      console.warn('Logout failed', err);
    }
  }
}));