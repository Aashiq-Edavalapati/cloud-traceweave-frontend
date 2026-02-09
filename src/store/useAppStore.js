import { create } from 'zustand';
import { workspaceApi } from '@/api/workspace.api';
import { collectionApi } from '@/api/collection.api';
import { requestApi } from '@/api/request.api';
import { environmentApi } from '@/api/environment.api';
import { workflowApi } from '@/api/workflow.api';

// Utilities
const createId = () => Math.random().toString(36).substr(2, 9);


export const useAppStore = create((set, get) => ({
    // --- UI Layout ---
    sidebarWidth: 260,
    setSidebarWidth: (width) => set({ sidebarWidth: width }),
    activeSidebarItem: 'Collections',
    setActiveSidebarItem: (item) => set({ activeSidebarItem: item }),
    activeView: 'runner', // 'runner' | 'environment' | 'monitor' | 'dashboard'
    setActiveView: (view) => set({ activeView: view }),
    responsePaneHeight: 350,
    setResponsePaneHeight: (height) => set({ responsePaneHeight: height }),

    // --- Workspace State ---
    activeWorkspaceId: null,
    availableWorkspaces: [],
    workspaceMembers: [],
    isLoadingWorkspaces: false,
    invitationError: null,

    fetchWorkspaces: async () => {
        try {
            set({ isLoadingWorkspaces: true });
            const response = await workspaceApi.getMyWorkspaces();
            // Backend returns: { data: [...] }
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

            // If we have an active workspace, fetch its data
            if (activeId) {
                get().fetchWorkspaceData(activeId);
            }
        } catch (error) {
            console.warn("Failed to fetch workspaces", error);
            set({ 
                isLoadingWorkspaces: false,
                availableWorkspaces: [] 
            });
        }
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

    setActiveWorkspace: (id) => {
        set(state => ({
            activeWorkspaceId: id,
            activeSidebarItem: 'Collections',
            workspaceMembers: state.availableWorkspaces.find(w => w.id === id)?.members || []
        }));
        get().fetchWorkspaceData(id);
    },

    fetchWorkspaceData: async (workspaceId) => {
        get().fetchCollections(workspaceId);
        get().fetchEnvironments(workspaceId);
    },

    // --- Environment State ---
    selectedEnvIndex: 0,
    setSelectedEnvIndex: (idx) => set({ selectedEnvIndex: idx }),
    workspaceEnvironments: {}, // { workspaceId: [envs] }

    fetchEnvironments: async (workspaceId) => {
        try {
            const data = await environmentApi.getEnvironments(workspaceId);
            // Backend returns: [...] (array) directly (see collection.controller.js)
            // api.js returns response.data which is the array.
            const envs = data || [];
            console.log("Fetched Environments:", { workspaceId, envs });

            set(state => ({
                workspaceEnvironments: {
                    ...state.workspaceEnvironments,
                    [workspaceId]: envs
                }
            }));
        } catch (error) {
            console.warn("Failed to fetch environments", error);
        }
    },

    getEnvVariable: (key) => {
        const { activeWorkspaceId, selectedEnvIndex, workspaceEnvironments } = get();
        const envs = workspaceEnvironments[activeWorkspaceId] || [];
        const activeEnv = envs[selectedEnvIndex];
        if (!activeEnv || !activeEnv.variables) return null;
        const found = activeEnv.variables.find(v => v.key === key && v.enabled);
        return found ? found.value : null;
    },

    getEnvironmentById: (id) => {
        const { activeWorkspaceId, workspaceEnvironments } = get();
        const envs = workspaceEnvironments[activeWorkspaceId] || [];
        return envs.find(e => e.id === id);
    },

    getWorkspaceEnvironments: () => {
        const { activeWorkspaceId, workspaceEnvironments } = get();
        return workspaceEnvironments[activeWorkspaceId] || [];
    },

    createEnvironment: async ({ name, variables, isTemp = false } = {}) => {
        const { activeWorkspaceId } = get();
        if (!activeWorkspaceId) return;

        try {
            // Optimistic UI or wait? Let's wait for ID from backend
            const data = await environmentApi.createEnvironment(activeWorkspaceId, {
                name: name || 'Untitled Environment',
                variables: variables || []
            });
            // Backend returns environment object directly
            const newEnv = data;

            set(state => {
                const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
                const newEnvs = [...currentEnvs, newEnv];

                const currentTabs = [...state.openTabs];
                if (!currentTabs.includes(newEnv.id)) currentTabs.push(newEnv.id);

                return {
                    workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs },
                    activeTabId: newEnv.id,
                    openTabs: currentTabs,
                    activeView: 'environment',
                };
            });
        } catch (err) {
            console.warn("Failed to create environment", err);
        }
    },

    saveEnvironment: async (envId) => {
        // In this new API-first approach, 'save' might just mean 'update' if we treat them as persisted.
        // If we have 'isTemp', that logic might move to 'createEnvironment' being immediate.
        // For now, let's assume we update the specific environment details.
        // Use updateEnvironment logic.
    },

    deleteEnvironment: async (envId) => {
        const { activeWorkspaceId } = get();
        try {
            await environmentApi.deleteEnvironment(envId);

            set(state => {
                const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
                const newEnvs = currentEnvs.filter(e => e.id !== envId);

                const newTabs = state.openTabs.filter(t => t !== envId);
                const newActive = state.activeTabId === envId ? (newTabs[newTabs.length - 1] || null) : state.activeTabId;

                return {
                    workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs },
                    openTabs: newTabs,
                    activeTabId: newActive,
                    selectedEnvIndex: 0 // reset selection
                };
            });
        } catch (err) {
            console.warn("Failed to delete environment", err);
        }
    },

    updateEnvironment: async (envId, updates) => {
        const { activeWorkspaceId } = get();
        // Optimistic update
        set(state => {
            const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
            const idx = currentEnvs.findIndex(e => e.id === envId);
            if (idx === -1) return {};

            const newEnvs = [...currentEnvs];
            newEnvs[idx] = { ...newEnvs[idx], ...updates };
            return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
        });

        // Background sync (debouncing would be better, but keeping simple)
        // Note: For simple fields like name
        // For variables, use specialized functions
    },

    addEnvironmentVariable: async (envId, { key, value, enabled }) => {
        const { activeWorkspaceId } = get();
        try {
            const data = await environmentApi.createVariable(envId, { key, value, enabled });
            // Backend returns variable object directly
            const newVar = data;

            set(state => {
                const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
                const idx = currentEnvs.findIndex(e => e.id === envId);

                // If not found, maybe re-fetch? Or just ignore
                if (idx === -1) return {};

                const env = currentEnvs[idx];
                // Variable object from backend
                const newVars = [...(env.variables || []), newVar];

                const newEnvs = [...currentEnvs];
                newEnvs[idx] = { ...env, variables: newVars };

                return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
            });
        } catch (err) { console.warn(err); }
    },

    updateEnvironmentVariable: async (envId, varIndex, field, value) => {
        const { activeWorkspaceId, workspaceEnvironments } = get();
        const envs = workspaceEnvironments[activeWorkspaceId] || [];
        const env = envs.find(e => e.id === envId);
        if (!env || !env.variables[varIndex]) return;

        const variable = env.variables[varIndex];
        const updates = { [field]: value };

        // Optimistic
        set(state => {
            const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
            const idx = currentEnvs.findIndex(e => e.id === envId);
            if (idx === -1) return {};

            const newEnvs = [...currentEnvs];
            const newVars = [...newEnvs[idx].variables];
            newVars[varIndex] = { ...newVars[varIndex], ...updates };
            newEnvs[idx] = { ...newEnvs[idx], variables: newVars };

            return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
        });

        // API Call
        try {
            if (field === 'key') {
                await environmentApi.renameVariable(envId, variable.id, value);
            } else {
                await environmentApi.updateVariable(envId, variable.id, updates);
            }
        } catch (err) { console.warn(err); /* Revert? */ }
    },

    removeEnvironmentVariable: async (envId, varIndex) => {
        const { activeWorkspaceId, workspaceEnvironments } = get();
        const envs = workspaceEnvironments[activeWorkspaceId] || [];
        const env = envs.find(e => e.id === envId);
        if (!env || !env.variables[varIndex]) return;

        const variable = env.variables[varIndex];

        // Optimistic
        set(state => {
            const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
            const idx = currentEnvs.findIndex(e => e.id === envId);
            if (idx === -1) return {};

            const newEnvs = [...currentEnvs];
            const newVars = newEnvs[idx].variables.filter((_, i) => i !== varIndex);
            newEnvs[idx] = { ...newEnvs[idx], variables: newVars };

            return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
        });

        try {
            await environmentApi.deleteVariable(envId, variable.id);
        } catch (err) { console.warn(err); }
    },

    // --- Collections & Request State ---
    collections: [], // Flat list? Or nested?
    requestStates: {}, // Map<requestId, RequestObj>
    lastProtocol: 'http',

    fetchCollections: async (workspaceId) => {
        try {
            const data = await collectionApi.getCollections(workspaceId);
            // Backend returns array of collections with nested requests: [{ id, name, requests: [...] }, ...]
            const rawCollections = data || [];

            console.log("FetchCollections: ", { workspaceId, rawCollections, active: get().activeWorkspaceId });

            const newRequestStates = { ...get().requestStates };
            const normalizedCollections = rawCollections.map(col => {
                const colRequests = col.requests || [];
                const itemIds = colRequests.map(r => r.id);

                // Add requests to state map
                colRequests.forEach(r => {
                    newRequestStates[r.id] = { ...r, collectionId: col.id };
                });

                return {
                    ...col,
                    workspaceId: workspaceId, // Ensure workspaceId matches the active one
                    itemIds: itemIds, // Add itemIds for frontend logic
                    requests: undefined // Optional: remove nested to avoid duplication, or keep it.
                };
            });

            set({
                collections: normalizedCollections,
                requestStates: newRequestStates
            });

        } catch (error) { console.warn(error); }
    },

    fetchRequestsForCollection: async (collectionId) => {
        try {
            const data = await requestApi.getRequestsByCollection(collectionId);
            const requests = data || [];

            const reqMap = {};
            requests.forEach(r => { reqMap[r.id] = r; });

            set(state => ({
                requestStates: { ...state.requestStates, ...reqMap },
                // Update collection itemIds if needed, OR assume collection.itemIds is correct from backend
            }));
        } catch (error) { console.warn(error); }
    },

    // --- MONITOR STATE ---
    monitorStates: {},

    createMonitor: () => set(state => {
        const newId = createId();
        const newMonitor = {
            id: newId,
            name: 'New Monitor',
            type: 'monitor',
            pinned: false,
            status: 'healthy',
            interval: 10000
        };

        const newTabs = [...state.openTabs, newId];

        return {
            monitorStates: { ...state.monitorStates, [newId]: newMonitor },
            openTabs: newTabs,
            activeTabId: newId,
            // previewTabId: state.previewTabId, // Keep existing preview or null
            activeView: 'monitor' // <--- FIX: Switch view to Monitor
        };
    }),

    deleteMonitor: (id) => set(state => {
        const { [id]: deleted, ...remainingMonitors } = state.monitorStates;
        const newTabs = state.openTabs.filter(t => t !== id);
        const newActive = state.activeTabId === id ? (newTabs[newTabs.length - 1] || null) : state.activeTabId;

        return {
            monitorStates: remainingMonitors,
            openTabs: newTabs,
            activeTabId: newActive
        };
    }),

    getFilteredCollections: () => {
        const { collections, requestStates, activeWorkspaceId } = get();
        return collections
            .filter(c => c.workspaceId === activeWorkspaceId)
            .map(c => ({
                ...c,
                items: c.itemIds.map(id => requestStates[id]).filter(Boolean)
            }));
    },

    // --- History State ---
    history: [],

    getHistory: () => get().history,

    fetchHistory: async (scope = 'workspace') => {
        const { activeWorkspaceId } = get();
        try {
            // If scope is 'workspace', fetch workspace history
            // If scope is 'request', we need a requestId. 
            // For now, let's implement workspace history fetch
            if (scope === 'workspace' && activeWorkspaceId) {
                const data = await workspaceApi.getWorkspaceHistory(activeWorkspaceId);
                const historyItems = data.history || [];
                set({ history: historyItems });
            }
        } catch (error) { console.warn(error); }
    },

    getFormattedHistory: (scope = 'workspace') => {
        const { history, activeWorkspaceId } = get();
        // Filter locally if needed, but API should filter
        return history.map(h => ({
            ...h,
            timestamp: h.date,
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    addToHistory: (req, res) => {
        // Optimistically add to history? 
        // Or wait for next fetch?
        // Usually execution returns the history item or we fetch it.
        // Let's rely on fetchHistory for now to keep it simple, or add manually if we have the object.
        get().fetchHistory('workspace');
    },

    clearHistory: async () => {
        // Backend API needed for clear history? 
        // Or just clear local? 
        set({ history: [] });
    },

    removeFromHistory: (id) => set(state => ({
        history: state.history.filter(h => h.id !== id)
    })),

    // --- Collection Actions ---
    toggleCollectionCollapse: (colId) => set(state => ({
        collections: state.collections.map(c =>
            c.id === colId ? { ...c, collapsed: !c.collapsed } : c
        )
    })),

    createCollection: async (name) => {
        const { activeWorkspaceId } = get();
        try {
            const data = await collectionApi.createCollection(activeWorkspaceId, { name: name || 'New Collection' });
            // Backend returns collection object directly
            const newCol = { ...data, itemIds: [], workspaceId: activeWorkspaceId }; // Ensure itemIds and workspaceId exist
            // Add to state
            set(state => ({ collections: [...state.collections, newCol] }));
        } catch (error) {
            console.warn("Create Collection Error:", error.response?.data || error);
        }
    },

    createRequest: async (colId, name, protocol = 'http') => {
        try {
            const protoToUse = protocol || get().lastProtocol || 'http';
            const data = await requestApi.createRequest(colId, {
                name: name || 'New Request',
                protocol: protoToUse,
                method: 'GET',
                url: 'https://api.example.com' // Default placeholder URL
            });

            const newReq = data;
            if (!newReq) return;

            set(state => {
                const newRequestStates = { ...state.requestStates, [newReq.id]: { ...newReq, collectionId: colId } };
                const newCollections = state.collections.map(col =>
                    col.id === colId ? { ...col, itemIds: [...(col.itemIds || []), newReq.id], collapsed: false } : col
                );

                return {
                    requestStates: newRequestStates,
                    collections: newCollections,
                    openTabs: [...state.openTabs, newReq.id],
                    activeTabId: newReq.id,
                    unsavedRequests: new Set(state.unsavedRequests),
                    lastProtocol: protoToUse,
                    activeView: 'runner'
                };
            });
        } catch (error) {
            console.warn("Create Request Error:", error.response?.data || error);
        }
    },

    createDetachedRequest: (protocol = null) => {
        // Detached requests might not be supported by backend yet, or treated as "Drafts" in a special collection.
        // For now, let's keep it local-only until saved?
        // OR: specific endpoint for adhoc/drafts.
        // Let's implement as local-only for now, then define "save" later.
        // WARN: Logic below is local-only.
        set(state => {
            const newId = createId();
            const protoToUse = protocol || state.lastProtocol

            const newReq = {
                id: newId,
                collectionId: null,
                name: 'Untitled Request',
                method: 'GET',
                protocol: protoToUse,
                url: '',
                params: [],
                cookies: [],
                auth: { type: 'noauth' },
                body: { type: 'none', language: 'json', formdata: [] },
                scripts: { pre: '', post: '' },
                pinned: false,
                isDetached: true // Marker
            };

            const newTabs = [...state.openTabs];
            if (state.previewTabId) {
                const idx = newTabs.indexOf(state.previewTabId);
                if (idx !== -1) newTabs[idx] = newId;
                else newTabs.push(newId);
            } else {
                newTabs.push(newId);
            }

            return {
                requestStates: { ...state.requestStates, [newId]: newReq },
                openTabs: newTabs,
                activeTabId: newId,
                unsavedRequests: new Set(state.unsavedRequests).add(newId),
                lastProtocol: protoToUse,
                activeView: 'runner'
            };
        });
    },

    attachRequestToCollection: (reqId, colId, newName) => set(state => {
        const req = state.requestStates[reqId];
        if (!req) return {};

        const updatedReq = { ...req, collectionId: colId, name: newName || req.name };
        const newRequestStates = { ...state.requestStates, [reqId]: updatedReq };

        const newCollections = state.collections.map(c =>
            c.id === colId ? { ...c, itemIds: [...c.itemIds, reqId] } : c
        );

        const newUnsaved = new Set(state.unsavedRequests);
        newUnsaved.delete(reqId);

        return {
            requestStates: newRequestStates,
            collections: newCollections,
            unsavedRequests: newUnsaved
        };
    }),

    togglePinItem: (id) => set(state => {
        // 1. COLLECTIONS
        const colIndex = state.collections.findIndex(c => c.id === id);
        if (colIndex !== -1) {
            const targetCol = state.collections[colIndex];
            const isNowPinned = !targetCol.pinned;
            const updatedTarget = { ...targetCol, pinned: isNowPinned };
            const others = state.collections.filter(c => c.id !== id);
            const othersPinned = others.filter(c => c.pinned);
            const othersUnpinned = others.filter(c => !c.pinned);
            let newCollections;
            if (isNowPinned) newCollections = [updatedTarget, ...othersPinned, ...othersUnpinned];
            else newCollections = [...othersPinned, updatedTarget, ...othersUnpinned];
            return { collections: newCollections };
        }

        // 2. REQUESTS
        const req = state.requestStates[id];
        if (req) {
            const isNowPinned = !req.pinned;
            const newRequestStates = { ...state.requestStates, [id]: { ...req, pinned: isNowPinned } };
            let newCollections = state.collections;
            if (req.collectionId) {
                newCollections = state.collections.map(col => {
                    if (col.id === req.collectionId) {
                        const otherIds = col.itemIds.filter(itemId => itemId !== id);
                        const othersPinned = [];
                        const othersUnpinned = [];
                        otherIds.forEach(itemId => {
                            const r = newRequestStates[itemId];
                            if (r && r.pinned) othersPinned.push(itemId);
                            else othersUnpinned.push(itemId);
                        });
                        let newItemIds;
                        if (isNowPinned) newItemIds = [id, ...othersPinned, ...othersUnpinned];
                        else newItemIds = [...othersPinned, id, ...othersUnpinned];
                        return { ...col, itemIds: newItemIds };
                    }
                    return col;
                });
            }
            return { requestStates: newRequestStates, collections: newCollections };
        }

        // 3. MONITORS
        const mon = state.monitorStates[id];
        if (mon) {
            return {
                monitorStates: {
                    ...state.monitorStates,
                    [id]: { ...mon, pinned: !mon.pinned }
                }
            };
        }

        // 4. ENVIRONMENTS
        const wsId = state.activeWorkspaceId;
        const envs = state.workspaceEnvironments[wsId] || [];
        const envIdx = envs.findIndex(e => e.id === id);
        if (envIdx !== -1) {
            const newEnvs = [...envs];
            newEnvs[envIdx] = { ...newEnvs[envIdx], pinned: !newEnvs[envIdx].pinned };
            return {
                workspaceEnvironments: {
                    ...state.workspaceEnvironments,
                    [wsId]: newEnvs
                }
            };
        }

        return {};
    }),

    duplicateItem: (id) => set(state => {
        // 1. Collections
        const col = state.collections.find(c => c.id === id);
        if (col) {
            const newColId = createId();
            const newCol = { ...col, id: newColId, name: `${col.name} Copy`, itemIds: [] };
            return { collections: [...state.collections, newCol] };
        }

        // 2. Requests
        const req = state.requestStates[id];
        if (req) {
            const newId = createId();
            const newReq = { ...req, id: newId, name: `${req.name} Copy` };
            if (req.collectionId) {
                const newCollections = state.collections.map(c =>
                    c.id === req.collectionId ? { ...c, itemIds: [...c.itemIds, newId] } : c
                );
                return { requestStates: { ...state.requestStates, [newId]: newReq }, collections: newCollections };
            } else {
                return { requestStates: { ...state.requestStates, [newId]: newReq } };
            }
        }

        // 3. Monitors
        const mon = state.monitorStates[id];
        if (mon) {
            const newId = createId();
            const newMon = { ...mon, id: newId, name: `${mon.name} Copy`, pinned: false };
            return {
                monitorStates: { ...state.monitorStates, [newId]: newMon }
            };
        }

        return {};
    }),

    deleteItem: async (id) => {
        // 1. Collection
        const isCollection = get().collections.find(c => c.id === id);
        if (isCollection) {
            try {
                await collectionApi.deleteCollection(id);
                set(state => ({ collections: state.collections.filter(c => c.id !== id) }));
            } catch (e) { console.warn(e); }
            return;
        }

        // 2. Monitor
        if (get().monitorStates[id]) {
            get().deleteMonitor(id); // Already defined, maybe needs API too?
            return;
        }

        // 3. Request
        const req = get().requestStates[id];
        if (req) {
            try {
                if (!req.isDetached) await requestApi.deleteRequest(id);

                set(state => {
                    const { [id]: deleted, ...remainingRequests } = state.requestStates;
                    const newCollections = state.collections.map(c => ({ ...c, itemIds: c.itemIds.filter(itemId => itemId !== id) }));
                    const newTabs = state.openTabs.filter(t => t !== id);
                    const newActive = state.activeTabId === id ? (newTabs[newTabs.length - 1] || null) : state.activeTabId;
                    return { requestStates: remainingRequests, collections: newCollections, openTabs: newTabs, activeTabId: newActive };
                });
            } catch (e) { console.warn(e); }
        }
    },

    renameItem: async (id, newName) => {
        console.log("renameItem called with:", { id, newName });
        console.log("Current collections:", get().collections);

        // 1. Collection
        const isCollection = get().collections.find(c => c.id === id);
        console.log("Found collection?", isCollection);
        if (isCollection) {
            try {
                console.log("Renaming collection:", { id, newName });
                await collectionApi.updateCollection(id, { name: newName });
                console.log("Collection renamed successfully");
                set(state => ({
                    collections: state.collections.map(c => c.id === id ? { ...c, name: newName } : c)
                }));
            } catch (e) {
                console.warn("Rename Collection Error:", e.response?.data || e);
            }
            return;
        }

        // 2. Request
        const req = get().requestStates[id];
        if (req) {
            try {
                await requestApi.updateRequest(id, { name: newName });
                set(state => ({
                    requestStates: { ...state.requestStates, [id]: { ...req, name: newName } }
                }));
            } catch (e) { console.warn(e); }
            return;
        }

        // 3. Environment
        const wsId = get().activeWorkspaceId;
        const envs = get().workspaceEnvironments[wsId] || [];
        const envIdx = envs.findIndex(e => e.id === id);
        if (envIdx !== -1) {
            try {
                await environmentApi.updateEnvironment(id, { name: newName });
                const newEnvs = [...envs];
                newEnvs[envIdx] = { ...newEnvs[envIdx], name: newName };
                set(state => ({
                    workspaceEnvironments: { ...state.workspaceEnvironments, [wsId]: newEnvs }
                }));
            } catch (e) { console.warn(e); }
        }
    },

    duplicateItem: async (id) => {
        // 1. Collection
        const collection = get().collections.find(c => c.id === id);
        if (collection) {
            try {
                const newCol = await collectionApi.createCollection(get().activeWorkspaceId, {
                    name: `${collection.name} Copy`
                });
                set(state => ({
                    collections: [...state.collections, { ...newCol, itemIds: [], workspaceId: get().activeWorkspaceId }]
                }));
            } catch (e) { console.warn(e); }
            return;
        }

        // 2. Request
        const req = get().requestStates[id];
        if (req && req.collectionId) {
            try {
                const newReq = await requestApi.createRequest(req.collectionId, {
                    name: `${req.name} Copy`,
                    protocol: req.protocol,
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    body: req.body,
                    params: req.params
                });
                set(state => ({
                    requestStates: { ...state.requestStates, [newReq.id]: { ...newReq, collectionId: req.collectionId } },
                    collections: state.collections.map(c =>
                        c.id === req.collectionId ? { ...c, itemIds: [...(c.itemIds || []), newReq.id] } : c
                    )
                }));
            } catch (e) { console.warn(e); }
        }
    },

    moveCollection: (activeId, overId) => set(state => {
        const activeCol = state.collections.find(c => c.id === activeId);
        const overCol = state.collections.find(c => c.id === overId);

        // GUARD: Cannot move pinned items, and cannot drop ONTO a pinned item
        if (activeCol?.pinned || overCol?.pinned) return {};

        const activeIndex = state.collections.findIndex(c => c.id === activeId);
        const overIndex = state.collections.findIndex(c => c.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
            const newCollections = [...state.collections];
            const [moved] = newCollections.splice(activeIndex, 1);
            newCollections.splice(overIndex, 0, moved);
            return { collections: newCollections };
        }
        return {};
    }),

    // --- Reorder Requests ---
    moveRequest: (activeId, overId) => set(state => {
        const activeReq = state.requestStates[activeId];
        const overReq = state.requestStates[overId];

        if (activeReq?.pinned) return {};
        if (overReq?.pinned) return {};

        const sourceCol = state.collections.find(c => c.itemIds.includes(activeId));
        let targetCol = state.collections.find(c => c.id === overId);
        if (!targetCol) targetCol = state.collections.find(c => c.itemIds.includes(overId));

        if (!sourceCol || !targetCol) return {};

        const newCollections = state.collections.map(col => ({
            ...col,
            itemIds: [...col.itemIds]
        }));

        const sCol = newCollections.find(c => c.id === sourceCol.id);
        const tCol = newCollections.find(c => c.id === targetCol.id);

        // SAME COLLECTION SORT
        if (sCol.id === tCol.id) {
            const oldIndex = sCol.itemIds.indexOf(activeId);
            let newIndex;
            if (overId === tCol.id) newIndex = 0;
            else newIndex = sCol.itemIds.indexOf(overId);

            if (newIndex === 0 && sCol.itemIds.length > 0) {
                const topItemId = sCol.itemIds[0];
                if (state.requestStates[topItemId]?.pinned && topItemId !== activeId) {
                    return {};
                }
            }

            sCol.itemIds.splice(oldIndex, 1);
            sCol.itemIds.splice(newIndex, 0, activeId);
        }
        // MOVE TO DIFFERENT COLLECTION
        else {
            const oldIndex = sCol.itemIds.indexOf(activeId);
            sCol.itemIds.splice(oldIndex, 1);

            let newIndex;
            if (overId === tCol.id) newIndex = tCol.itemIds.length;
            else newIndex = tCol.itemIds.indexOf(overId);

            if (newIndex < tCol.itemIds.length) {
                const itemAtNewPos = state.requestStates[tCol.itemIds[newIndex]];
                if (itemAtNewPos?.pinned) return {};
            }

            tCol.itemIds.splice(newIndex, 0, activeId);

            const newRequestStates = { ...state.requestStates };
            newRequestStates[activeId] = { ...newRequestStates[activeId], collectionId: targetCol.id };
            return { collections: newCollections, requestStates: newRequestStates };
        }

        return { collections: newCollections };
    }),

    // --- Tab Management ---
    openTabs: [],
    activeTabId: null,
    previewTabId: null,
    unsavedRequests: new Set(),

    openTab: (id, isPreview = false) => set(state => {
        const isAlreadyOpen = state.openTabs.includes(id);

        // --- LOGIC: Determine what type of object this ID is to set the View correctly ---
        let nextView = 'runner'; // default
        if (state.monitorStates[id]) {
            nextView = 'monitor';
        } else {
            // Check if environment
            const wsId = state.activeWorkspaceId;
            const envs = state.workspaceEnvironments[wsId] || [];
            const isEnv = envs.some(e => e.id === id);
            if (isEnv) nextView = 'environment';
            else nextView = 'runner'; // Fallback to request runner
        }
        // -------------------------------------------------------------------------------

        if (isAlreadyOpen) {
            if (!isPreview && state.previewTabId === id) {
                return { activeTabId: id, previewTabId: null, activeView: nextView };
            }
            return { activeTabId: id, activeView: nextView };
        }

        let newTabs = [...state.openTabs];
        let newPreviewId = state.previewTabId;

        if (isPreview) {
            if (state.previewTabId) {
                const previewIdx = newTabs.indexOf(state.previewTabId);
                if (previewIdx !== -1) {
                    newTabs[previewIdx] = id;
                } else {
                    newTabs.push(id);
                }
            } else {
                newTabs.push(id);
            }
            newPreviewId = id;
        } else {
            newTabs.push(id);
        }

        return {
            openTabs: newTabs,
            activeTabId: id,
            previewTabId: newPreviewId,
            activeView: nextView // <--- FIX: Switch View when opening new tab
        };
    }),

    markTabPermanent: (id) => set(state => {
        if (state.previewTabId === id) {
            return { previewTabId: null };
        }
        return {};
    }),

    closeTab: (id) => set(state => {
        const newTabs = state.openTabs.filter(t => t !== id);
        let newActive = state.activeTabId;
        let nextView = state.activeView;

        // If closing the active tab, switch to the last available one
        if (id === state.activeTabId) {
            newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;

            // If we switched tabs, we must update the view
            if (newActive) {
                if (state.monitorStates[newActive]) nextView = 'monitor';
                else {
                    const wsId = state.activeWorkspaceId;
                    const envs = state.workspaceEnvironments[wsId] || [];
                    if (envs.some(e => e.id === newActive)) nextView = 'environment';
                    else nextView = 'runner';
                }
            } else {
                nextView = 'runner'; // Default if no tabs
            }
        }

        let newPreview = state.previewTabId === id ? null : state.previewTabId;
        return { openTabs: newTabs, activeTabId: newActive, previewTabId: newPreview, activeView: nextView };
    }),

    saveRequest: async (id) => {
        const req = get().requestStates[id];
        if (!req) return;

        try {
            if (req.isDetached) {
                // "Saving" a detached request usually means attaching it to a collection?
                // Or just saving locally? 
                // If the user hasn't selected a collection, we can't really save it to backend unless backend supports drafts.
                // For now, do nothing or prompt user.
                // Assuming this action is triggered by CMD+S on a request.
                console.warn("Cannot save detached request without collection");
                return;
            }

            // Update valid fields
            const updateData = {
                name: req.name,
                method: req.method,
                url: req.url,
                params: req.params,
                headers: req.headers, // if we track headers
                body: req.body,
                auth: req.auth,
            };

            await requestApi.updateRequest(id, updateData);

            set(state => {
                const newSet = new Set(state.unsavedRequests);
                newSet.delete(id);
                return { unsavedRequests: newSet };
            });
            return true;
        } catch (error) {
            // Use console.warn to avoid Next.js error overlay
            console.warn("Save Request Error (Handled):", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message
            });
            return false;
        }
    },

    updateActiveRequest: (field, value) => set(state => {
        const id = state.activeTabId;
        if (!id) return {};
        return {
            unsavedRequests: new Set(state.unsavedRequests).add(id),
            requestStates: {
                ...state.requestStates,
                [id]: { ...state.requestStates[id], [field]: value }
            }
        };
    }),

    updateActiveRequestDeep: (pathArray, value) => set(state => {
        const id = state.activeTabId;
        if (!id) return {};

        const req = state.requestStates[id];
        const newReq = JSON.parse(JSON.stringify(req));

        let current = newReq;
        for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) current[pathArray[i]] = {};
            current = current[pathArray[i]];
        }
        current[pathArray[pathArray.length - 1]] = value;

        return {
            unsavedRequests: new Set(state.unsavedRequests).add(id),
            requestStates: { ...state.requestStates, [id]: newReq }
        };
    }),

    updateRequestListConfig: (listName, index, key, value) => set(state => {
        const id = state.activeTabId;
        const req = state.requestStates[id];
        if (!req) return {};

        let currentList;
        let isNested = false;

        if (listName === 'body.formdata') {
            currentList = Array.isArray(req.body?.formdata) ? [...req.body.formdata] : [];
            isNested = true;
        } else {
            const field = req[listName];
            currentList = Array.isArray(field) ? [...field] : [];
        }

        if (!currentList[index]) currentList[index] = { key: '', value: '', active: true };
        currentList[index][key] = value;

        if (index === currentList.length - 1 && (key === 'key' || key === 'value') && value !== '') {
            currentList.push({ key: '', value: '', active: true });
        }

        let newReq = { ...req };
        if (isNested) {
            newReq.body = { ...newReq.body, formdata: currentList };
        } else {
            newReq[listName] = currentList;
        }

        return {
            unsavedRequests: new Set(state.unsavedRequests).add(id),
            requestStates: {
                ...state.requestStates,
                [id]: newReq
            }
        };
    }),

    removeRequestListItem: (listName, index) => set(state => {
        const id = state.activeTabId;
        const req = state.requestStates[id];
        if (!req) return {};

        let currentList;
        let isNested = false;

        if (listName === 'body.formdata') {
            currentList = [...(req.body?.formdata || [])];
            isNested = true;
        } else {
            currentList = [...(req[listName] || [])];
        }

        currentList.splice(index, 1);

        let newReq = { ...req };
        if (isNested) {
            newReq.body = { ...newReq.body, formdata: currentList };
        } else {
            newReq[listName] = currentList;
        }

        return {
            unsavedRequests: new Set(state.unsavedRequests).add(id),
            requestStates: {
                ...state.requestStates,
                [id]: newReq
            }
        };
    }),

    /* OLD renameItem - DISABLED - using async version at line 689
    renameItem: (id, newName, markAsUnsaved = true) => set(state => {
        const newCols = state.collections.map(c => c.id === id ? { ...c, name: newName } : c);
        const newReqs = { ...state.requestStates };
        if (newReqs[id]) newReqs[id] = { ...newReqs[id], name: newName };

        const newMonitors = { ...state.monitorStates };
        if (newMonitors[id]) newMonitors[id] = { ...newMonitors[id], name: newName };

        const wsId = state.activeWorkspaceId;
        const newWorkspaceEnvironments = { ...state.workspaceEnvironments };
        const envs = newWorkspaceEnvironments[wsId] || [];
        const envIdx = envs.findIndex(e => e.id === id);

        if (envIdx !== -1) {
            const newEnvs = [...envs];
          
            newEnvs[envIdx] = { ...newEnvs[envIdx], name: newName };
            newWorkspaceEnvironments[wsId] = newEnvs;

            if (markAsUnsaved) {
                const newUnsaved = new Set(state.unsavedRequests).add(id);
                return { collections: newCols, requestStates: newReqs, monitorStates: newMonitors, workspaceEnvironments: newWorkspaceEnvironments, unsavedRequests: newUnsaved, _ts: Date.now() };
            }
            return { collections: newCols, requestStates: newReqs, monitorStates: newMonitors, workspaceEnvironments: newWorkspaceEnvironments, _ts: Date.now() };
        }

        return { collections: newCols, requestStates: newReqs, monitorStates: newMonitors, _ts: Date.now() };
    }), */

    isLoading: false,
    response: null, error: null,
    executeRequest: async () => {
        const state = get();
        const activeId = state.activeTabId;
        const req = state.requestStates[activeId];

        if (!req) return;

        set({ isLoading: true, error: null, response: null });
        const delay = 500 + Math.random() * 1000;

        try {
            // Check if detached
            if (req.isDetached) {
                // Ad-hoc execution
                const result = await requestApi.executeAdHocRequest({
                    workspaceId: state.activeWorkspaceId,
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    body: req.body,
                    params: req.params,
                    environmentId: null // TODO: Support environment selection
                });
                get().addToHistory(req, result);
                set({ isLoading: false, response: result });
            } else {
                // Saved request execution - save current state first to ensure latest changes are used
                if (state.unsavedRequests.has(activeId)) {
                    const saved = await get().saveRequest(activeId);
                    // If save failed (e.g. 403), we still might want to try executing if the user wants to test current server state,
                    // but usually, if you can't save, it's better to just try and catch the execution error too.
                    // However, we'll continue since we might want to execute what's ALREADY on the server.
                }

                // Get active environment ID
                const envs = state.workspaceEnvironments[state.activeWorkspaceId] || [];
                const activeEnv = envs[state.selectedEnvIndex];
                const envId = activeEnv ? activeEnv.id : null;

                const result = await requestApi.executeRequest(activeId, envId);
                // executionResult history is added by backend, but we might want to update local history view
                // Result contains historyId. 
                get().addToHistory(req, result);
                set({ isLoading: false, response: result });
            }
        } catch (error) {
            const status = error.response?.status;
            let errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;

            if (status === 403) {
                errorMessage = "You do not have permissions to execute requests";
            }

            // Use console.warn for ALL errors to avoid triggering the Next.js error overlay
            console.warn("Execution Error (Handled):", {
                status,
                message: errorMessage,
                original: error.message
            });

            set({ isLoading: false, error: errorMessage });
        }
    },

    executeWorkflow: async (workflowId) => {
        set({ isLoading: true, error: null, response: null });
        try {
            const result = await workflowApi.executeWorkflow(workflowId);
            set({
                isLoading: false,
                // Mark this response as a workflow report
                response: { ...result.report, isWorkflow: true }
            });
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            console.warn("Workflow Execution Error (Handled):", errorMessage);
            set({ isLoading: false, error: errorMessage });
        }
    },

    // --- Annotations ---
    requestNotes: {},
    spanNotes: {},
    updateRequestNote: (id, note) => set(state => ({ requestNotes: { ...state.requestNotes, [id]: note } })),
    addSpanNote: (spanId, note) => set(state => ({ spanNotes: { ...state.spanNotes, [spanId]: note } })),

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
}));