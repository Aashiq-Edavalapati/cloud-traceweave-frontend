import { collectionApi } from '@/api/collection.api';
import { requestApi } from '@/api/request.api'; // <-- Added this import

export const createCollectionSlice = (set, get) => ({
    collections: [],
    requestStates: {}, 

    fetchCollections: async (workspaceId) => {
        try {
            const data = await collectionApi.getCollections(workspaceId);
            
            // Flatten the nested tree from the backend into a 1D array
            const flattenCollections = (cols) => {
                let result = [];
                cols.forEach(c => {
                    const { children, ...rest } = c;
                    result.push(rest);
                    if (children && children.length > 0) {
                        result = result.concat(flattenCollections(children));
                    }
                });
                return result;
            };

            const rawCollections = flattenCollections(data || []);

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
                    parentId: col.parentId || null, 
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
        const { collections } = get();
        const originalCollections = get().collections;
        const originalRequestStates = get().requestStates;

        // Recursive helper to find all descendant collection IDs
        const getAllDescendantIds = (parentId, allCols) => {
            let ids = [];
            const children = allCols.filter(c => c.parentId === parentId);
            children.forEach(child => {
                ids.push(child.id);
                ids = ids.concat(getAllDescendantIds(child.id, allCols));
            });
            return ids;
        };

        const idsToDelete = [id, ...getAllDescendantIds(id, collections)];

        // Update frontend state immediately
        set(state => {
            const newRequestStates = { ...state.requestStates };
            const collectionsToKeep = state.collections.filter(c => !idsToDelete.includes(c.id));
            
            idsToDelete.forEach(colId => {
                const col = state.collections.find(c => c.id === colId);
                if (col && col.itemIds) {
                    col.itemIds.forEach(reqId => delete newRequestStates[reqId]);
                }
            });

            return { 
                collections: collectionsToKeep,
                requestStates: newRequestStates
            };
        });

        try {
            await collectionApi.deleteCollection(id);
        } catch (e) { 
            console.warn("Failed to delete collection from DB", e); 
           
            set({ 
                collections: originalCollections, 
                requestStates: originalRequestStates 
            });
        }
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

        // Anti-Cyclic Check
        let currentParent = overCol.parentId;
        while (currentParent) {
            if (currentParent === activeId) return {}; 
            const parent = state.collections.find(c => c.id === currentParent);
            currentParent = parent?.parentId;
        }

        const activeIndex = state.collections.findIndex(c => c.id === activeId);
        const overIndex = state.collections.findIndex(c => c.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
            const newCollections = [...state.collections];
            const [moved] = newCollections.splice(activeIndex, 1);
            
            moved.parentId = overCol.parentId || null;
            newCollections.splice(overIndex, 0, moved);

            // Recalculate order for siblings in the new parent
            const siblings = newCollections.filter(c => c.parentId === moved.parentId);
            siblings.forEach((sibling, idx) => {
                // Update state order
                sibling.order = idx; 
                // Only send API calls for the ones that actually changed position (optimization)
                if (sibling.id === activeId) {
                    collectionApi.updateCollection(sibling.id, { 
                        parentId: sibling.parentId, 
                        order: idx 
                    }).catch(console.warn);
                }
            });

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

        let newIndex;

        if (sCol.id === tCol.id) {
            const oldIndex = sCol.itemIds.indexOf(activeId);
            newIndex = overId === tCol.id ? 0 : sCol.itemIds.indexOf(overId);

            if (newIndex === 0 && sCol.itemIds.length > 0) {
                const topItemId = sCol.itemIds[0];
                if (state.requestStates[topItemId]?.pinned && topItemId !== activeId) return {};
            }
            sCol.itemIds.splice(oldIndex, 1);
            sCol.itemIds.splice(newIndex, 0, activeId);
        } else {
            const oldIndex = sCol.itemIds.indexOf(activeId);
            sCol.itemIds.splice(oldIndex, 1);

            newIndex = overId === tCol.id ? tCol.itemIds.length : tCol.itemIds.indexOf(overId);

            if (newIndex < tCol.itemIds.length) {
                const itemAtNewPos = state.requestStates[tCol.itemIds[newIndex]];
                if (itemAtNewPos?.pinned) return {};
            }

            tCol.itemIds.splice(newIndex, 0, activeId);
        }

        // Update DB with new order index and collectionId
        requestApi.updateRequest(activeId, { 
            collectionId: targetCol.id,
            order: newIndex 
        }).catch(console.warn);

        const newRequestStates = { ...state.requestStates };
        newRequestStates[activeId] = { ...newRequestStates[activeId], collectionId: targetCol.id };
        return { collections: newCollections, requestStates: newRequestStates };
    }),

    duplicateCollection: async (id) => {
        const { activeWorkspaceId, fetchCollections } = get();
        try {
            await collectionApi.duplicateCollection(id);
            // Just refetch the tree to get the perfect deep-cloned state
            await fetchCollections(activeWorkspaceId);
        } catch (e) {
            console.warn("Deep Duplication Failed:", e);
        }
    },
});