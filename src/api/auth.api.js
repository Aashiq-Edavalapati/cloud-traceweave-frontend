import { api } from '@/lib/api';

export const authApi = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getMe: async () => {
        console.log("Checking authentication status with /auth/me");
        const response = await api.get('/auth/me');
        console.log("getMe response:", response.data);
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/auth/profile', profileData);
        return response.data;
    }
};
