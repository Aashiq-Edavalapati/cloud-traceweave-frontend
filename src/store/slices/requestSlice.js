import { requestApi } from '@/api/request.api';
import { createId } from '@/utils/helpers';

// --- FACTORY: Protocol-Specific Defaults ---
// This ensures that when you create a request, it has the exact fields that protocol needs.
const getDefaultConfig = (protocol) => {
    switch (protocol) {
        case 'graphql':
            return {
                method: 'POST', // GraphQL is strictly POST
                url: '',
                headers: [],
                body: { 
                    type: 'graphql', 
                    graphql: { query: '', variables: '{}' } 
                },
                auth: { type: 'noauth' }
            };
        case 'grpc':
            return {
                url: '',
                service: '',
                method: '',
                metadata: [],
                message: '{}',
                auth: { type: 'noauth' }
            };
        case 'ws':
            return {
                url: '',
                headers: [],
                messages: [],
                auth: { type: 'noauth' }
            };
        case 'http':
        default:
            return {
                method: 'GET',
                url: '',
                headers: [],
                params: [],
                body: { type: 'none', language: 'json', formdata: [] },
                auth: { type: 'noauth' }
            };
    }
};

// Define fields that live at the root of the request object (everything else goes into config)
const TOP_LEVEL_FIELDS = ['id', 'collectionId', 'name', 'protocol', 'pinned', 'isDetached', 'cookies', 'scripts'];

export const createRequestSlice = (set, get) => ({
    requestStates: {},
    unsavedRequests: new Set(),
    lastProtocol: 'http',
    
    // Annotations
    requestNotes: {},
    spanNotes: {},
    updateRequestNote: (id, note) => set(state => ({ requestNotes: { ...state.requestNotes, [id]: note } })),
    addSpanNote: (spanId, note) => set(state => ({ spanNotes: { ...state.spanNotes, [spanId]: note } })),

    fetchRequestsForCollection: async (collectionId) => {
        try {
            const data = await requestApi.getRequestsByCollection(collectionId);
            const requests = data || [];
            const reqMap = {};
            requests.forEach(r => { 
                // Unpack cookies and scripts back to the top level for the UI
                reqMap[r.id] = {
                    ...r,
                    cookies: r.config?.cookies || [],
                    scripts: r.config?.scripts || { pre: '', post: '' }
                }; 
            });

            set(state => ({
                requestStates: { ...state.requestStates, ...reqMap },
            }));
        } catch (error) { console.warn(error); }
    },

    createRequest: async (colId, name, protocol = 'http') => {
        try {
            const protoToUse = protocol || get().lastProtocol || 'http';
            const initialConfig = getDefaultConfig(protoToUse);

            const data = await requestApi.createRequest(colId, {
                name: name || 'New Request',
                protocol: protoToUse,
                config: initialConfig // Store protocol-specific shape inside config
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

    createDetachedRequest: (protocol = null, customConfig = null) => {
        set(state => {
            const newId = createId();
            const protoToUse = protocol || state.lastProtocol;
            
            // USE CUSTOM CONFIG IF PROVIDED, ELSE DEFAULT
            const initialConfig = customConfig || getDefaultConfig(protoToUse);

            const newReq = {
                id: newId,
                collectionId: null,
                name: customConfig ? 'Imported cURL' : 'Untitled Request', // ✨ AUTO NAME
                protocol: protoToUse,
                config: initialConfig, 
                cookies: [],
                scripts: { pre: '', post: '' },
                pinned: false,
                isDetached: true 
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

    toggleRequestPin: (id) => set(state => {
        const req = state.requestStates[id];
        if (!req) return {};

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
    }),

    duplicateRequest: async (id) => {
        const state = get();
        const req = state.requestStates[id];
        
        if (req) {
            const newId = createId();
            const newReq = { ...req, id: newId, name: `${req.name} Copy` };

            if (req.collectionId) {
                try {
                    const newReqData = await requestApi.createRequest(req.collectionId, {
                        name: `${req.name} Copy`,
                        protocol: req.protocol,
                        config: req.config // Generalized: Just copy the entire config block
                    });
                    set(state => ({
                        requestStates: { ...state.requestStates, [newReqData.id]: { ...newReqData, collectionId: req.collectionId } },
                        collections: state.collections.map(c =>
                            c.id === req.collectionId ? { ...c, itemIds: [...(c.itemIds || []), newReqData.id] } : c
                        )
                    }));
                } catch (e) { console.warn(e); }
            } else {
                set(state => ({
                    requestStates: { ...state.requestStates, [newId]: newReq }
                }));
            }
        }
    },

    renameRequest: async (id, newName) => {
        const req = get().requestStates[id];
        if (!req) return;
        set(state => ({
            requestStates: { ...state.requestStates, [id]: { ...req, name: newName } }
        }));
        try {
            await requestApi.updateRequest(id, { name: newName });
        } catch (e) { console.warn(e); }
    },

    deleteRequest: async (id) => {
        const req = get().requestStates[id];
        if (!req) return;

        try {
            if (!req.isDetached) await requestApi.deleteRequest(id);

            set(state => {
                const { [id]: deleted, ...remainingRequests } = state.requestStates;
                const newCollections = state.collections.map(c => ({ 
                    ...c, 
                    itemIds: c.itemIds.filter(itemId => itemId !== id) 
                }));
                const newTabs = state.openTabs.filter(t => t !== id);
                const newActive = state.activeTabId === id ? (newTabs[newTabs.length - 1] || null) : state.activeTabId;

                return { 
                    requestStates: remainingRequests, 
                    collections: newCollections, 
                    openTabs: newTabs, 
                    activeTabId: newActive 
                };
            });
        } catch (e) { console.warn(e); }
    },

    updateActiveRequest: (field, value) => set(state => {
        const id = state.activeTabId;
        if (!id) return {};

        const req = state.requestStates[id];
        
        // Generalized Logic: If it's not a root-level concept (like name, protocol), put it in config.
        if (!TOP_LEVEL_FIELDS.includes(field)) {
             return {
                unsavedRequests: new Set(state.unsavedRequests).add(id),
                requestStates: {
                    ...state.requestStates,
                    [id]: { 
                        ...req, 
                        config: { ...req.config, [field]: value } 
                    }
                }
            };
        }

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

        // Note: For deep updates to protocol configs, components should pass ['config', 'body', 'type']
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

    updateRequestListConfig: (listKeyArrayRaw, index, key, value) => set(state => {
        const listKeyArray = Array.isArray(listKeyArrayRaw) ? listKeyArrayRaw : [listKeyArrayRaw];
        const id = state.activeTabId;
        const req = state.requestStates[id];
        if (!req) return {};

        // 1. Extract existing files and paths before JSON.parse destroys them
        let existingFiles = {};
        let existingPaths = {};
        
        let origArray = req;
        for (let k of listKeyArray) {
            origArray = origArray?.[k];
        }
        
        if (Array.isArray(origArray)) {
            origArray.forEach((item, i) => {
                if (item.value instanceof File) existingFiles[i] = item.value;
                if (item.path) existingPaths[i] = item.path;
            });
        }

        // 2. Deep Clone
        const newReq = JSON.parse(JSON.stringify(req));
        
        // 3. Traverse cloned object
        let current = newReq;
        for (let i = 0; i < listKeyArray.length - 1; i++) {
            if (!current[listKeyArray[i]]) current[listKeyArray[i]] = {};
            current = current[listKeyArray[i]];
        }
        const arrayName = listKeyArray[listKeyArray.length - 1];
        if (!Array.isArray(current[arrayName])) {
            current[arrayName] = [];
        }

        // 4. 🔥 RESTORE MISSION: Put the files and paths back into the clone
        current[arrayName].forEach((item, i) => {
            if (existingFiles[i]) item.value = existingFiles[i];
            if (existingPaths[i]) item.path = existingPaths[i];
        });

        // 5. Apply the new UI update
        if (!current[arrayName][index]) current[arrayName][index] = { key: '', value: '', active: true, valueType: 'text' };
        current[arrayName][index][key] = value;

        // 6. 🔥 THE EXTRACTOR: If the user just uploaded a file, grab the path as a string NOW
        if (value instanceof File) {
            current[arrayName][index].path = value.path; // Save absolute path for Electron
            current[arrayName][index].isFile = true;
            current[arrayName][index].valueType = 'file';
        }

        // Auto-add new row logic
        if (index === current[arrayName].length - 1 && (key === 'key' || key === 'value') && value !== '') {
            current[arrayName].push({ key: '', value: '', active: true, valueType: 'text' });
        }

        return {
            unsavedRequests: new Set(state.unsavedRequests).add(id),
            requestStates: { ...state.requestStates, [id]: newReq }
        };
    }),

    attachFileToFormdata: (index, file, pathStr) => set(state => {
        const id = state.activeTabId;
        const req = state.requestStates[id];
        if (!req) return {};

        // Shallow clone down to the formdata array (No JSON.parse!)
        const newReq = { ...req, config: { ...req.config, body: { ...req.config.body } } };
        const newFormdata = [...(newReq.config.body.formdata || [])];
        
        if (!newFormdata[index]) {
            newFormdata[index] = { key: '', active: true, valueType: 'file' };
        }
        
        newFormdata[index] = {
            ...newFormdata[index],
            value: file,
            path: pathStr, // Save the secure path string explicitly
            isFile: true,
            valueType: 'file'
        };

        newReq.config.body.formdata = newFormdata;

        return {
            unsavedRequests: new Set(state.unsavedRequests).add(id),
            requestStates: { ...state.requestStates, [id]: newReq }
        };
    }),

    attachBinaryFile: (file, pathStr) => set(state => {
        const id = state.activeTabId;
        const req = state.requestStates[id];
        if (!req) return {};

        const newReq = { ...req, config: { ...req.config, body: { ...req.config.body } } };
        
        newReq.config.body.binaryFile = file;
        newReq.config.body.binaryFilePath = pathStr; // Save secure path

        return {
            unsavedRequests: new Set(state.unsavedRequests).add(id),
            requestStates: { ...state.requestStates, [id]: newReq }
        };
    }),

    removeRequestListItem: (listKeyArrayRaw, index) => set(state => {
        const listKeyArray = Array.isArray(listKeyArrayRaw) ? listKeyArrayRaw : [listKeyArrayRaw];
        const id = state.activeTabId;
        const req = state.requestStates[id];
        if (!req) return {};

        const newReq = JSON.parse(JSON.stringify(req));

        // Traverse
        let current = newReq;
        for (let i = 0; i < listKeyArray.length - 1; i++) {
            if (!current[listKeyArray[i]]) current[listKeyArray[i]] = {};
            current = current[listKeyArray[i]];
        }
        const arrayName = listKeyArray[listKeyArray.length - 1];
        
        if (Array.isArray(current[arrayName])) {
             current[arrayName].splice(index, 1);
        }

        return {
            unsavedRequests: new Set(state.unsavedRequests).add(id),
            requestStates: { ...state.requestStates, [id]: newReq }
        };
    }),

    saveRequest: async (id) => {
        const req = get().requestStates[id];
        if (!req) return;

        try {
            if (req.isDetached) {
                console.warn("Cannot save detached request without collection");
                return;
            }

            // console.log("Saving Request with Config:", req.config);
            // console.log("Protocol:", req.protocol);
            const safeConfig = {
                ...req.config,
                cookies: req.cookies || [],
                scripts: req.scripts || { pre: '', post: '' }
            };

            const updateData = {
                name: req.name,
                protocol: req.protocol,
                config: safeConfig 
            };

            await requestApi.updateRequest(id, updateData);

            set(state => {
                const newSet = new Set(state.unsavedRequests);
                newSet.delete(id);
                return { unsavedRequests: newSet };
            });
            return true;
        } catch (error) {
            console.warn("Save Request Error (Handled):", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message
            });
            return false;
        }
    },
});