import { workspaceApi } from '@/api/workspace.api';

export const createWorkspaceSlice = (set, get) => ({
    activeWorkspaceId: null,
    availableWorkspaces: [],
    workspaceMembers: [],
    isLoadingWorkspaces: false,
    invitationError: null,
    globalHistory: [],
    globalStats: null,

    fetchWorkspaces: async () => {
        try {
        set({ isLoadingWorkspaces: true });
        const response = await workspaceApi.getMyWorkspaces();
        const workspaces = response.data || [];
        
        let activeId = get().activeWorkspaceId;
        if (!activeId && workspaces.length > 0) {
            activeId = workspaces[0].id;
        }

        set({
            availableWorkspaces: workspaces,
            activeWorkspaceId: activeId,
            isLoadingWorkspaces: false,
            workspaceMembers: workspaces.find(w => w.id === activeId)?.members || []
        });

        if (activeId) {
            // Accessing actions from other slices via get()
            get().fetchWorkspaceData(activeId);
        }
        } catch (error) {
        console.warn("Failed to fetch workspaces", error);
        set({ isLoadingWorkspaces: false, availableWorkspaces: [] });
        }
    },

    setActiveWorkspace: (id) => {
        set(state => ({
        activeWorkspaceId: id,
        activeSidebarItem: 'Collections',
        workspaceMembers: state.availableWorkspaces.find(w => w.id === id)?.members || []
        }));
        get().fetchWorkspaceData(id);
    },
  
    fetchWorkspaceData: async (workspaceId) => {
        // Calls actions from Collection and Environment slices
        get().fetchCollections(workspaceId);
        get().fetchEnvironments(workspaceId);
    },

    createWorkspace: async (name, description = '') => {
        try {
            set({ isLoadingWorkspaces: true });
            const response = await workspaceApi.createWorkspace({ name, description });
            // Backend returns: { data: workspace }
            const newWorkspace = response.data;

            set(state => ({
                availableWorkspaces: [...state.availableWorkspaces, newWorkspace],
                isLoadingWorkspaces: false
            }));

            return { success: true, workspace: newWorkspace };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.warn("Failed to create workspace", errorMessage);
            set({ isLoadingWorkspaces: false });
            return { success: false, error: errorMessage };
        }
    },

    inviteMember: async (email, role) => {
        const { activeWorkspaceId } = get();
        set({ invitationError: null });
        try {
            const response = await workspaceApi.addMember(activeWorkspaceId, email, role);
            // Backend returns: { message: ..., data: member }
            const newMember = response.data;
            set(state => ({
                workspaceMembers: [...state.workspaceMembers, newMember]
            }));
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            set({ invitationError: msg });
            console.warn("Invite Error:", msg);
            return { success: false, error: msg };
        }
    },

    removeMember: async (userId) => {
        const { activeWorkspaceId } = get();
        try {
            await workspaceApi.removeMember(activeWorkspaceId, userId);
            set(state => ({
                workspaceMembers: state.workspaceMembers.filter(m => m.id !== userId)
            }));
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            console.warn("Remove Member Error:", msg);
            return { success: false, error: msg };
        }
    },

    fetchGlobalHistory: async () => {
        try {
            const response = await workspaceApi.getGlobalHistory({ page: 1, limit: 10 });
            set({ globalHistory: response.data || [] });
        } catch (error) {
            console.warn("Failed to fetch global history", error);
        }
    },

    fetchGlobalStats: async () => {
        try {
            const response = await workspaceApi.getGlobalStats();
            set({ globalStats: response.data });
        } catch (error) {
            console.warn("Failed to fetch global stats", error);
        }
    },
});