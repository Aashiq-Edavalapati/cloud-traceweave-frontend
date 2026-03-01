import { api } from '@/lib/api';

export const collectionApi = {
    createCollection: async (workspaceId, data) => {
        const response = await api.post(`/collections/workspace/${workspaceId}`, data);
        return response.data;
    },

    getCollections: async (workspaceId) => {
        const response = await api.get(`/collections/workspace/${workspaceId}`);
        return response.data;
    },

    updateCollection: async (id, data) => {
        const response = await api.patch(`/collections/${id}`, data);
        return response.data;
    },

    deleteCollection: async (id) => {
        const response = await api.delete(`/collections/${id}`);
        return response.data;
    },

    duplicateCollection: async (id) => {
        const response = await api.post(`/collections/${id}/duplicate`);
        return response.data;
    }
};
