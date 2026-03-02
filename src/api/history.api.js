import { api } from '@/lib/api';

export const historyApi = {
    // We are reusing the global-history endpoint you already made for the list
    getGlobalHistory: async (params = { page: 1, limit: 20 }) => {
        const response = await api.get(`/workspaces/user/global-history`, { params });
        return response.data;
    },
    
    getWorkspaceHistory: async (workspaceId, params = { page: 1, limit: 20 }) => {
        const response = await api.get(`/workspaces/${workspaceId}/history`, { params });
        return response.data;
    },
    
    // Fetch detailed data for a specific execution
    getExecutionDetails: async (execId) => {
        const response = await api.get(`/executions/${execId}`);
        return response.data;
    }
};