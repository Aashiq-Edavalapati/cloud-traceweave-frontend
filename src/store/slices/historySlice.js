import { historyApi } from '@/api/history.api';

export const createHistorySlice = (set, get) => ({
    historyLogs: [],
    historyPagination: { total: 0, page: 1, limit: 20, pages: 1 },
    activeExecution: null,
    isHistoryLoading: false,

    fetchHistory: async (scope = 'all', page = 1, limit = 20) => {
        set({ isHistoryLoading: true });
        try {
            const state = get();
            const wsId = state.activeWorkspaceId;
            let data;
            
            if (scope === 'workspace' && wsId) {
                data = await historyApi.getWorkspaceHistory(wsId, { page, limit });
            } else {
                data = await historyApi.getGlobalHistory({ page, limit });
            }
            
            const fetchedLogs = data.data || [];
            const newLogs = page === 1 ? fetchedLogs : [...state.historyLogs, ...fetchedLogs];
            
            set({ 
                historyLogs: newLogs, 
                historyPagination: data.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
                isHistoryLoading: false 
            });
            return data.pagination;
        } catch (error) {
            console.error("Failed to fetch history:", error);
            set({ isHistoryLoading: false });
        }
    },

    fetchExecutionDetails: async (execId) => {
        set({ isHistoryLoading: true, activeExecution: null });
        try {
            const data = await historyApi.getExecutionDetails(execId);
            set({ activeExecution: data.data, isHistoryLoading: false });
        } catch (error) {
            console.error("Failed to fetch execution details:", error);
            set({ isHistoryLoading: false });
        }
    },
    
    clearActiveExecution: () => set({ activeExecution: null })
});