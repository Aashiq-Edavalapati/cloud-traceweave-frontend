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
            
            // The backend now returns workspaces with a flattened 'isFavorite' 
            // and 'myRole' based on the WorkspaceMember table.
            const workspaces = response.data || [];

            // --- RESTORED ACTIVE WORKSPACE LOGIC ---
            let activeId = get().activeWorkspaceId;
            
            // If no active ID is set (initial load), default to the first workspace
            if (!activeId && workspaces.length > 0) {
                activeId = workspaces[0].id;
            }

            set({
                availableWorkspaces: workspaces,
                activeWorkspaceId: activeId,
                isLoadingWorkspaces: false,
                // Update members for the currently active workspace
                workspaceMembers: workspaces.find(w => w.id === activeId)?.members || []
            });

            // Trigger data fetching for the active workspace (Collections/Envs)
            if (activeId) {
                get().fetchWorkspaceData(activeId);
            }
        } catch (error) {
            console.warn("Failed to fetch workspaces", error);
            set({ isLoadingWorkspaces: false, availableWorkspaces: [] });
        }
    },

    // toggle favorite status in the DB
    toggleFavorite: async (workspaceId) => {
        const { availableWorkspaces } = get();
        const workspace = availableWorkspaces.find(w => w.id === workspaceId);
        if (!workspace) return;

        const newStatus = !workspace.isFavorite;

        // Optimistic Update: Update UI immediately for a snappy feel
        set({
            availableWorkspaces: availableWorkspaces.map(ws => 
                ws.id === workspaceId ? { ...ws, isFavorite: newStatus } : ws
            )
        });

        try {
            // Persist to the WorkspaceMember table in the DB
            await workspaceApi.updateFavoriteStatus(workspaceId, { isFavorite: newStatus });
        } catch (error) {
            // Rollback on failure
            set({
                availableWorkspaces: availableWorkspaces.map(ws => 
                    ws.id === workspaceId ? { ...ws, isFavorite: !newStatus } : ws
                )
            });
            console.error("Failed to persist favorite status", error);
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

    updateWorkspace: async (id, data) => {
        try {
            const response = await workspaceApi.updateWorkspace(id, data);
            const updatedWorkspace = response.data;
            
            set(state => ({
                availableWorkspaces: state.availableWorkspaces.map(ws => 
                    ws.id === id ? { ...ws, ...updatedWorkspace } : ws
                )
            }));
            return { success: true, workspace: updatedWorkspace };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    },

    deleteWorkspace: async (id) => {
        try {
            await workspaceApi.deleteWorkspace(id);
            const currentActive = get().activeWorkspaceId;
            
            set(state => {
                const filtered = state.availableWorkspaces.filter(ws => ws.id !== id);
                return {
                    availableWorkspaces: filtered,
                    activeWorkspaceId: currentActive === id 
                        ? (filtered.length > 0 ? filtered[0].id : null) 
                        : currentActive
                };
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    },

    duplicateWorkspace: async (id) => {
        try {
            set({ isLoadingWorkspaces: true });
            const response = await workspaceApi.duplicateWorkspace(id);
            const newWorkspace = response.data;

            set(state => ({
                availableWorkspaces: [...state.availableWorkspaces, newWorkspace],
                isLoadingWorkspaces: false
            }));
            return { success: true, workspace: newWorkspace };
        } catch (error) {
            set({ isLoadingWorkspaces: false });
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }
});