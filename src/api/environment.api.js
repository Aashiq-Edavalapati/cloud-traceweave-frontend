import { api } from '@/lib/api';

export const environmentApi = {
    createEnvironment: async (workspaceId, data) => {
        const response = await api.post(`/workspaces/${workspaceId}/environments`, data);
        return response.data;
    },

    getEnvironments: async (workspaceId) => {
        const response = await api.get(`/workspaces/${workspaceId}/environments`);
        return response.data;
    },

    deleteEnvironment: async (id) => {
        const response = await api.delete(`/environments/${id}`);
        return response.data;
    },

    updateEnvironment: async (id, data) => {
        const response = await api.patch(`/environments/${id}`, data);
        return response.data;
    },

    // Variable operations
    createVariable: async (envId, data) => {
        const response = await api.post(`/environments/${envId}/variables`, data);
        return response.data;
    },

    updateVariable: async (envId, varId, data) => {
        const response = await api.patch(`/environments/${envId}/variables/${varId}`, data);
        return response.data;
    },

    renameVariable: async (envId, varId, newKey) => {
        const response = await api.patch(`/environments/${envId}/variables/${varId}/rename`, { key: newKey });
        return response.data;
    },

    deleteVariable: async (envId, varId) => {
        const response = await api.delete(`/environments/${envId}/variables/${varId}`);
        return response.data;
    },

    getGlobalEnvironments: async () => {
        const response = await api.get('/workspaces/user/global-environments');
        return response.data;
    }
};
