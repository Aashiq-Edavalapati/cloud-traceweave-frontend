import { workspaceApi } from '@/api/workspace.api';

export const createWorkspaceSlice = (set, get) => ({
    activeWorkspaceId: null,
    availableWorkspaces: [],
    workspaceMembers: [],
    isLoadingWorkspaces: false,
    invitationError: null,
    globalHistory: [],
    globalStats: null,
    pendingInvites: [],

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

    addMemberDirectly: async (email, role) => {
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
            const updatedMembers = get().workspaceMembers.filter(m => m.userId !== userId);
            const updatedWorkspaces = availableWorkspaces.map(ws => 
            ws.id === activeWorkspaceId 
                ? { ...ws, members: updatedMembers } 
                : ws
            );

            set({
                workspaceMembers: updatedMembers,
                availableWorkspaces: updatedWorkspaces
            });
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            console.warn("Remove Member Error:", msg);
            return { success: false, error: msg };
        }
    },

    updateMemberRole: async (userId, newRole) => {
        const { activeWorkspaceId, availableWorkspaces } = get();
        try {
            await workspaceApi.updateMemberRole(activeWorkspaceId, userId, newRole);

            // 1. Map through active members to update role
            const updatedMembers = get().workspaceMembers.map(m => 
                m.userId === userId ? { ...m, role: newRole } : m
            );

            // 2. Update the cache in availableWorkspaces
            const updatedWorkspaces = availableWorkspaces.map(ws => 
                ws.id === activeWorkspaceId 
                    ? { ...ws, members: updatedMembers } 
                    : ws
            );

            set({
                workspaceMembers: updatedMembers,
                availableWorkspaces: updatedWorkspaces
            });

            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            console.warn("Update Role Error:", msg);
            return { success: false, error: msg };
        }
    },

    toggleCommonLink: async (isActive) => {
        const { activeWorkspaceId, fetchWorkspaces } = get();
        await workspaceApi.toggleCommonLink(activeWorkspaceId, isActive);
        await fetchWorkspaces(); // Refresh to get the new token/status
    },
    
    resetCommonLink: async () => {
        const { activeWorkspaceId, fetchWorkspaces } = get();
        await workspaceApi.resetCommonLink(activeWorkspaceId);
        await fetchWorkspaces();
    },

    leaveWorkspace: async (workspaceId) => {
        const { availableWorkspaces, activeWorkspaceId, fetchWorkspaces } = get();
        try {
            // Use the current user's ID (we'll pass it from the component)
            const userId = useAuthStore.getState().user?.id;
            
            await workspaceApi.removeMember(workspaceId, userId);

            // 1. Remove from available workspaces list
            const updatedWorkspaces = availableWorkspaces.filter(ws => ws.id !== workspaceId);

            // 2. Logic to switch active workspace if the user just left the active one
            let nextActiveId = activeWorkspaceId;
            if (activeWorkspaceId === workspaceId) {
                nextActiveId = updatedWorkspaces.length > 0 ? updatedWorkspaces[0].id : null;
            }

            set({
                availableWorkspaces: updatedWorkspaces,
                activeWorkspaceId: nextActiveId,
                // If we left the active one, clear the members list
                workspaceMembers: nextActiveId 
                    ? updatedWorkspaces.find(w => w.id === nextActiveId)?.members || [] 
                    : []
            });

            // 3. Re-fetch data for the new active workspace if it exists
            if (nextActiveId) {
                get().fetchWorkspaceData(nextActiveId);
            }

            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            console.warn("Leave Workspace Error:", msg);
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

    fetchPendingInvites: async (workspaceId) => {
        try {
            const response = await workspaceApi.getPendingInvites(workspaceId);
            set({ pendingInvites: response.data || [] });
        } catch (error) {
            console.warn("Failed to fetch pending invites", error);
            set({ pendingInvites: [] });
        }
    },

    createWorkspaceInvite: async (email, role) => {
        const { activeWorkspaceId, pendingInvites } = get();
        try {
            const response = await workspaceApi.createInvite(activeWorkspaceId, email, role);
            
            // The backend returns the invite object with the inviteLink attached
            const newInvite = response.data;
            
            set({ pendingInvites: [newInvite, ...pendingInvites] });
            return { success: true, inviteLink: newInvite.inviteLink };
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            return { success: false, error: msg };
        }
    },

    acceptWorkspaceInvite: async (token) => {
        try {
            const response = await workspaceApi.acceptInvite(token);
            // After accepting, we should refresh the workspaces so the new one appears in the sidebar
            await get().fetchWorkspaces();
            return { success: true, workspaceId: response.data.workspaceId };
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            return { success: false, error: msg };
        }
    },
});