import { collectionApi } from '@/api/collection.api';

export const createCollectionSlice = (set, get) => ({
    collections: [],
    requestStates: {}, // Assuming this is managed here or merged from another slice

    fetchCollections: async (workspaceId) => {
        try {
            const data = await collectionApi.getCollections(workspaceId);
            const rawCollections = data || [];

            const newRequestStates = { ...get().requestStates };
            const normalizedCollections = rawCollections.map(col => {
                const colRequests = col.requests || [];
                const itemIds = colRequests.map(r => r.id);

                colRequests.forEach(r => {
                    newRequestStates[r.id] = { ...r, collectionId: col.id };
                });

                return {
                    ...col,
                    workspaceId: workspaceId,
                    itemIds: itemIds,
                    parentId: col.parentId || null, // Ensure parentId is tracked
                    requests: undefined 
                };
            });

            set({
                collections: normalizedCollections,
                requestStates: newRequestStates
            });

        } catch (error) { console.warn(error); }
    },

    getFilteredCollections: () => {
        const { collections, requestStates, activeWorkspaceId } = get();
        return collections
            .filter(c => c.workspaceId === activeWorkspaceId)
            .map(c => ({
                ...c,
                items: c.itemIds.map(id => requestStates[id]).filter(Boolean)
            }));
    },

    // Updated to accept parentId
    createCollection: async (name, parentId = null) => {
        const { activeWorkspaceId } = get();
        try {
            const payload = { name: name || 'New Collection' };
            if (parentId) payload.parentId = parentId;

            const data = await collectionApi.createCollection(activeWorkspaceId, payload);
            const newCol = { 
                ...data, 
                itemIds: [], 
                workspaceId: activeWorkspaceId,
                parentId: parentId 
            };
            set(state => ({ collections: [...state.collections, newCol] }));
        } catch (error) {
            console.warn("Create Collection Error:", error.response?.data || error);
        }
    },

    toggleCollectionCollapse: (colId) => set(state => ({
        collections: state.collections.map(c =>
            c.id === colId ? { ...c, collapsed: !c.collapsed } : c
        )
    })),

    duplicateCollection: async (id) => {
        const { activeWorkspaceId, collections } = get();
        const collection = collections.find(c => c.id === id);
        
        if (collection) {
            try {
                const payload = { name: `${collection.name} Copy` };
                if (collection.parentId) payload.parentId = collection.parentId;

                const newColData = await collectionApi.createCollection(activeWorkspaceId, payload);
                const newCol = { ...newColData, itemIds: [], workspaceId: activeWorkspaceId, parentId: collection.parentId };
                set(state => ({ collections: [...state.collections, newCol] }));
            } catch (e) { console.warn(e); }
        }
    },

    renameCollection: async (id, newName) => {
        set(state => ({
            collections: state.collections.map(c => c.id === id ? { ...c, name: newName } : c)
        }));
        try {
            await collectionApi.updateCollection(id, { name: newName });
        } catch (e) { console.warn(e); }
    },

    deleteCollection: async (id) => {
        try {
            await collectionApi.deleteCollection(id);
            set(state => ({ 
                collections: state.collections.filter(c => c.id !== id && c.parentId !== id) // Also remove immediate children from state
            }));
        } catch (e) { console.warn(e); }
    },

    toggleCollectionPin: (id) => set(state => {
        const colIndex = state.collections.findIndex(c => c.id === id);
        if (colIndex === -1) return {};

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
    }),

    moveCollection: (activeId, overId) => set(state => {
        const activeCol = state.collections.find(c => c.id === activeId);
        const overCol = state.collections.find(c => c.id === overId);

        if (!activeCol || !overCol || activeCol.pinned || overCol.pinned) return {};

        // Anti-Cyclic Check: Prevent dragging a parent into its own child
        let currentParent = overCol.parentId;
        while (currentParent) {
            if (currentParent === activeId) return {}; // Abort move
            const parent = state.collections.find(c => c.id === currentParent);
            currentParent = parent?.parentId;
        }

        const activeIndex = state.collections.findIndex(c => c.id === activeId);
        const overIndex = state.collections.findIndex(c => c.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
            const newCollections = [...state.collections];
            const [moved] = newCollections.splice(activeIndex, 1);
            
            // Make them siblings by inheriting the overCol's parentId
            moved.parentId = overCol.parentId || null;
            
            newCollections.splice(overIndex, 0, moved);

            // Optional: You can trigger an async API call here to persist the parentId change
            // collectionApi.updateCollection(activeId, { parentId: moved.parentId }).catch(console.warn);

            return { collections: newCollections };
        }
        return {};
    }),

    moveRequest: (activeId, overId) => set(state => {
        const activeReq = state.requestStates[activeId];
        const overReq = state.requestStates[overId];

        if (activeReq?.pinned || overReq?.pinned) return {};

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

        if (sCol.id === tCol.id) {
            const oldIndex = sCol.itemIds.indexOf(activeId);
            let newIndex = overId === tCol.id ? 0 : sCol.itemIds.indexOf(overId);

            if (newIndex === 0 && sCol.itemIds.length > 0) {
                const topItemId = sCol.itemIds[0];
                if (state.requestStates[topItemId]?.pinned && topItemId !== activeId) return {};
            }
            sCol.itemIds.splice(oldIndex, 1);
            sCol.itemIds.splice(newIndex, 0, activeId);
        } else {
            const oldIndex = sCol.itemIds.indexOf(activeId);
            sCol.itemIds.splice(oldIndex, 1);

            let newIndex = overId === tCol.id ? tCol.itemIds.length : tCol.itemIds.indexOf(overId);

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
});