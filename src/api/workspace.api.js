import { api } from '@/lib/api';

export const workspaceApi = {
    createWorkspace: async (data) => {
        const response = await api.post('/workspaces/create', data);
        return response.data;
    },

    getMyWorkspaces: async () => {
        const response = await api.get('/workspaces');
        return response.data; // Expected: { workspaces: [...] }
    },

    getWorkspaceById: async (id) => {
        const response = await api.get(`/workspaces/${id}`);
        return response.data;
    },

    updateWorkspace: async (id, data) => {
        const response = await api.patch(`/workspaces/${id}`, data);
        return response.data;
    },

    deleteWorkspace: async (id) => {
        const response = await api.delete(`/workspaces/${id}`);
        return response.data;
    },

    getWorkspaceHistory: async (workspaceId, { page = 1, limit = 100 } = {}) => {
        const response = await api.get(`/workspaces/${workspaceId}/history`, {
            params: { page, limit }
        });
        return response.data;
    },

    getGlobalHistory: async (params = { page: 1, limit: 20 }) => {
        const response = await api.get(`/workspaces/user/global-history`, { params });
        return response.data;
    },

    getGlobalStats: async () => {
        const response = await api.get(`/workspaces/user/global-stats`);
        return response.data;
    },

    addMemberDirectly: async (workspaceId, email, role) => {
        // Backend expects { email, role } in body
        const response = await api.post(`/workspaces/${workspaceId}/members`, { email, role });
        return response.data;
    },

    removeMember: async (workspaceId, userId) => {
        const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
        return response.data;
    },

    updateMemberRole: async (workspaceId, userId, role) => {
        const response = await api.patch(`/workspaces/${workspaceId}/members/${userId}`, { role });
        return response.data;
    },

    createInvite: async (workspaceId, email, role) => {
        const response = await api.post(`/workspaces/${workspaceId}/invites`, { email, role });
        return response.data; // Expected: { message, data: { ...invite, inviteLink } }
    },

    getPendingInvites: async (workspaceId) => {
        const response = await api.get(`/workspaces/${workspaceId}/invites`);
        return response.data;
    },

    acceptInvite: async (token) => {
        const response = await api.post(`/workspaces/invites/accept`, { token });
        return response.data;
    },

    toggleCommonLink: async (workspaceId, isActive) => {
        const response = await api.patch(`/workspaces/${workspaceId}/invites/link/toggle`, { isActive });
        return response.data;
    },
    
    resetCommonLink: async (workspaceId) => {
        const response = await api.post(`/workspaces/${workspaceId}/invites/link/reset`);
        return response.data;
    },
};
