import { api } from '@/lib/api';

export const createWorkflowSlice = (set, get) => ({
    workflows: [],
    activeWorkflow: null,
    workflowHistory: [],

    _sortWorkflows: (list) => {
        return [...list].sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            const timeA = a.executions?.[0]?.startedAt ? new Date(a.executions[0].startedAt).getTime() : 0;
            const timeB = b.executions?.[0]?.startedAt ? new Date(b.executions[0].startedAt).getTime() : 0;
            if (timeA !== timeB) return timeB - timeA;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    },

    fetchWorkspacesWorkflows: async (workspaceId) => {
        try {
            const res = await api.get(`/workflows/workspace/${workspaceId}`);
            set({ workflows: get()._sortWorkflows(res.data) });
        } catch (error) { console.error('Failed to fetch workflows', error); }
    },

    // Added/Verified for Main Canvas
    fetchWorkflow: async (workflowId) => {
        try {
            const res = await api.get(`/workflows/${workflowId}`);
            set({ activeWorkflow: {
                ...res.data,
                flowData: res.data.flowData || { nodes: [], edges: [] }
            }});
        } catch (error) { console.error('Failed to fetch individual workflow', error); }
    },

    // Added for Log Stream Sidebar
    fetchWorkflowHistory: async (workflowId) => {
        try {
            const res = await api.get(`/workflows/${workflowId}/history`);
            set({ workflowHistory: res.data });
        } catch (error) { console.error('Failed to fetch history', error); }
    },

    createWorkflow: async (workspaceId, name, description) => {
        try {
            const res = await api.post(`/workflows`, {
                workspaceId, name, description, flowData: { nodes: [], edges: [] }
            });
            set(state => ({ workflows: get()._sortWorkflows([...state.workflows, res.data]) }));
            return res.data;
        } catch (error) { throw error; }
    },

    executeWorkflow: async (workflowId) => {
        try {
            const res = await api.post(`/workflows/${workflowId}/run`);
            set(state => {
                const updated = state.workflows.map(wf => wf.id === workflowId ? {
                    ...wf,
                    executions: [{ startedAt: new Date().toISOString(), status: 'RUNNING' }, ...(wf.executions || [])]
                } : wf);
                return { workflows: get()._sortWorkflows(updated) };
            });
            return res.data;
        } catch (error) { throw error; }
    },

    renameWorkflow: async (id, newName) => {
        try {
            const res = await api.patch(`/workflows/${id}`, { name: newName });
            set(state => ({
                workflows: get()._sortWorkflows(state.workflows.map(w => w.id === id ? res.data : w))
            }));
        } catch (error) { console.error("Rename failed", error); }
    },

    duplicateWorkflow: async (id) => {
        const wf = get().workflows.find(w => w.id === id);
        if (!wf) return;
        try {
            const res = await api.post(`/workflows`, {
                workspaceId: wf.workspaceId,
                name: `${wf.name} (Copy)`,
                description: wf.description,
                flowData: wf.flowData 
            });
            set(state => ({ workflows: get()._sortWorkflows([...state.workflows, res.data]) }));
            return res.data;
        } catch (error) { console.error("Duplicate failed", error); }
    },

    deleteWorkflow: async (id) => {
        try {
            await api.patch(`/workflows/${id}`, { deletedAt: new Date() });
            set(state => ({
                workflows: state.workflows.filter(w => w.id !== id)
            }));
        } catch (error) {
            console.error("Delete failed", error);
        }
    },

    toggleWorkflowPin: async (id) => {
        const wf = get().workflows.find(w => w.id === id);
        if (!wf) return;
        const newPinned = !wf.pinned;
        set(state => ({ workflows: get()._sortWorkflows(state.workflows.map(w => w.id === id ? { ...w, pinned: newPinned } : w)) }));
        try { await api.patch(`/workflows/${id}`, { pinned: newPinned }); } catch (error) {
            set(state => ({ workflows: get()._sortWorkflows(state.workflows.map(w => w.id === id ? { ...w, pinned: !newPinned } : w)) }));
        }
    },

    saveWorkflowGraph: async (workflowId, flowData) => {
        try {
            await api.patch(`/workflows/${workflowId}`, { flowData });
            set(state => ({
                workflows: state.workflows.map(w => w.id === workflowId ? { ...w, flowData } : w)
            }));
        } catch (error) { console.error(`Failed to save workflow ${workflowId}`, error); }
    }
});