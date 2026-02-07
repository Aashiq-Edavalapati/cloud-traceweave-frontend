import { create } from 'zustand';

// Utilities
const createId = () => Math.random().toString(36).substr(2, 9);

// --- INITIAL DATA ---
const WORKSPACES = [
  { id: 'ws-1', name: 'My Workspace', role: 'Admin' },
  { id: 'ws-2', name: 'Team Alpha', role: 'Member' }
];

const INITIAL_COLLECTIONS = [
  { id: 'col-1', workspaceId: 'ws-1', name: 'TraceWeave Core', collapsed: false, pinned: false, itemIds: ['req-1', 'req-2'] },
  { id: 'col-2', workspaceId: 'ws-2', name: 'Alpha API', collapsed: false, pinned: false, itemIds: ['req-3'] }
];

const INITIAL_REQUESTS = {
  'req-1': { 
      id: 'req-1', collectionId: 'col-1', name: 'Register User', method: 'POST', url: '{{baseURL}}/register', params: [], cookies: [], pinned: false,
      auth: { type: 'noauth' },
      body: { type: 'raw', raw: '{\n  "email": "user@example.com"\n}', language: 'json', formdata: [], binaryPath: '' },
      scripts: { pre: '', post: '' }
  },
  'req-2': { 
      id: 'req-2', collectionId: 'col-1', name: 'Health Check', method: 'GET', url: '{{baseURL}}/health', params: [], cookies: [], pinned: false,
      auth: { type: 'noauth' },
      body: { type: 'none', language: 'json', formdata: [] },
      scripts: { pre: '', post: '' }
  },
  'req-3': { 
      id: 'req-3', collectionId: 'col-2', name: 'Alpha Status', method: 'GET', url: '{{baseURL}}/status', params: [], cookies: [], pinned: false,
      auth: { type: 'noauth' },
      body: { type: 'none', language: 'json', formdata: [] },
      scripts: { pre: '', post: '' }
  }
};

const ENVIRONMENTS = {
  'ws-1': [
      { id: 'env-1', name: 'Production', variables: [{ key: 'baseURL', value: 'https://api.traceweave.com', enabled: true }] },
      { id: 'env-2', name: 'Local', variables: [{ key: 'baseURL', value: 'http://localhost:3000', enabled: true }] }
  ],
  'ws-2': [
      { id: 'env-3', name: 'Staging', variables: [{ key: 'baseURL', value: 'https://staging.alpha.com', enabled: true }] }
  ]
};

const generateMockTrace = () => [
    { id: 'sp-1', service: 'API Gateway', name: 'request_in', duration: 15, status: 200, offset: 0 },
    { id: 'sp-2', service: 'Auth Service', name: 'verify_token', duration: 45, status: 200, offset: 15 },
    { id: 'sp-3', service: 'User Service', name: 'db_query', duration: 120, status: 200, offset: 60 },
];

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
  activeWorkspaceId: 'ws-1', 
  availableWorkspaces: WORKSPACES,
  workspaceMembers: [], 
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id, activeSidebarItem: 'Collections' }),

  // --- Environment State ---
  selectedEnvIndex: 0, 
  setSelectedEnvIndex: (idx) => set({ selectedEnvIndex: idx }),
  
  getEnvVariable: (key) => {
    const { activeWorkspaceId, selectedEnvIndex } = get();
    const envs = ENVIRONMENTS[activeWorkspaceId] || [];
    const activeEnv = envs[selectedEnvIndex];
    if (!activeEnv || !activeEnv.variables) return null;
    const found = activeEnv.variables.find(v => v.key === key && v.enabled);
    return found ? found.value : null;
  },

  getEnvironmentById: (id) => {
    const { activeWorkspaceId } = get();
    const envs = ENVIRONMENTS[activeWorkspaceId] || [];
    return envs.find(e => e.id === id);
  },
  
  getWorkspaceEnvironments: () => {
    const { activeWorkspaceId } = get();
    const envs = ENVIRONMENTS[activeWorkspaceId] || [];
    // Filter out temporary (unsaved) environments from Sidebar list
    return envs.filter(e => !e.isTemp);
  },

  createEnvironment: ({ name, variables, isTemp = false } = {}) => set(state => {
      const wsId = state.activeWorkspaceId;
      const newId = createId();
      const newEnv = { 
          id: newId, 
          name: name || 'Untitled Environment', 
          variables: variables || [],
          isTemp: isTemp 
      };
      const currentEnvs = ENVIRONMENTS[wsId] || [];
      ENVIRONMENTS[wsId] = [...currentEnvs, newEnv]; 
      
      const currentTabs = [...state.openTabs];
      if (!currentTabs.includes(newId)) currentTabs.push(newId);
      
      const newUnsaved = new Set(state.unsavedRequests);
      if (isTemp) newUnsaved.add(newId);

      return { 
          activeTabId: newId,
          openTabs: currentTabs,
          unsavedRequests: newUnsaved,
          activeView: 'environment', // <--- FIX: Switch view to Environment Editor
          _ts: Date.now() 
      }; 
  }),

  saveEnvironment: (envId) => set(state => {
      const wsId = state.activeWorkspaceId;
      const envs = ENVIRONMENTS[wsId] || [];
      const idx = envs.findIndex(e => e.id === envId);

      if (idx !== -1) {
          const updatedEnv = { ...envs[idx], isTemp: false };
          ENVIRONMENTS[wsId][idx] = updatedEnv;

          const newUnsaved = new Set(state.unsavedRequests);
          newUnsaved.delete(envId);

          return { 
              unsavedRequests: newUnsaved,
              _ts: Date.now() 
          };
      }
      return {};
  }),
  
  deleteEnvironment: (envId) => set(state => {
      const wsId = state.activeWorkspaceId;
      const currentEnvs = ENVIRONMENTS[wsId] || [];
      ENVIRONMENTS[wsId] = currentEnvs.filter(e => e.id !== envId);
      
      const newTabs = state.openTabs.filter(t => t !== envId);
      const newActive = state.activeTabId === envId ? (newTabs[newTabs.length - 1] || null) : state.activeTabId;

      if (state.selectedEnvIndex >= ENVIRONMENTS[wsId].length) {
          return { selectedEnvIndex: 0, openTabs: newTabs, activeTabId: newActive };
      }
      return { openTabs: newTabs, activeTabId: newActive, _ts: Date.now() };
  }),

  updateEnvironment: (envId, updates) => set(state => {
      const wsId = state.activeWorkspaceId;
      const envs = ENVIRONMENTS[wsId] || [];
      const idx = envs.findIndex(e => e.id === envId);
      if (idx !== -1) {
          ENVIRONMENTS[wsId][idx] = { ...envs[idx], ...updates };
          return { _ts: Date.now() };
      }
      return {};
  }),

  addEnvironmentVariable: (envId, { key, value, enabled }) => set(state => {
      const wsId = state.activeWorkspaceId;
      const envs = ENVIRONMENTS[wsId] || [];
      const idx = envs.findIndex(e => e.id === envId);
      if (idx !== -1) {
          const env = envs[idx];
          const newVars = [...(env.variables || []), { key, value, enabled }];
          ENVIRONMENTS[wsId][idx] = { ...env, variables: newVars };
          return { 
              unsavedRequests: new Set([...state.unsavedRequests, envId]),
              _ts: Date.now() 
          };
      }
      return {};
  }),

  updateEnvironmentVariable: (envId, varIndex, field, value) => set(state => {
    const wsId = state.activeWorkspaceId;
    const envs = ENVIRONMENTS[wsId];
    const envIndex = envs.findIndex(e => e.id === envId);
    if (envIndex === -1) return {};

    const env = envs[envIndex];
    // Ensure variables array exists
    const currentVars = env.variables || [];
    if (!currentVars[varIndex]) return {};

    const newVars = [...currentVars];
    newVars[varIndex] = { ...newVars[varIndex], [field]: value };
    ENVIRONMENTS[wsId][envIndex] = { ...env, variables: newVars };
    
    return { 
        unsavedRequests: new Set([...state.unsavedRequests, envId]),
        _ts: Date.now() 
    };
  }),

  removeEnvironmentVariable: (envId, varIndex) => set(state => {
    const wsId = state.activeWorkspaceId;
    const envs = ENVIRONMENTS[wsId];
    const envIndex = envs.findIndex(e => e.id === envId);
    if (envIndex === -1) return {};
    
    const env = envs[envIndex];
    const currentVars = env.variables || [];
    const newVars = currentVars.filter((_, idx) => idx !== varIndex);
    
    ENVIRONMENTS[wsId][envIndex] = { ...env, variables: newVars };
    return { 
        unsavedRequests: new Set([...state.unsavedRequests, envId]),
        _ts: Date.now() 
    };
  }),

  // --- Collections & Request State ---
  collections: INITIAL_COLLECTIONS,
  requestStates: INITIAL_REQUESTS,
  lastProtocol: 'http',
  
  // --- MONITOR STATE ---
  monitorStates: {
      'monitor-1': { id: 'monitor-1', name: 'Performance Monitor', type: 'monitor', pinned: false, status: 'healthy', interval: 5000 }
  },

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
  history: [
    { id: 'hist-1', workspaceId: 'ws-1', method: 'GET', url: 'https://api.google.com', status: 200, time: 145, date: new Date().toISOString() },
    { id: 'hist-2', workspaceId: 'ws-1', method: 'POST', url: '{{baseURL}}/auth', status: 401, time: 230, date: new Date().toISOString() }
  ],

  getHistory: () => get().history,

  getFormattedHistory: (scope = 'workspace') => {
    const { history, activeWorkspaceId } = get();
    const filtered = scope === 'all' 
        ? history 
        : history.filter(h => h.workspaceId === activeWorkspaceId);
        
    return filtered.map(h => ({
        ...h,
        timestamp: h.date, 
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  addToHistory: (req, res) => set(state => {
    const newEntry = {
        id: createId(),
        workspaceId: req.collectionId ? 'ws-1' : state.activeWorkspaceId,
        method: req.method,
        url: req.url,
        status: res.status,
        date: new Date().toISOString(),
        time: res.time || 0,
        duration: res.time || 0
    };
    return { history: [newEntry, ...state.history] };
  }),
  
  clearHistory: () => set(state => ({ history: [] })),

  removeFromHistory: (id) => set(state => ({
      history: state.history.filter(h => h.id !== id)
  })),

  // --- Collection Actions ---
  toggleCollectionCollapse: (colId) => set(state => ({
    collections: state.collections.map(c => 
      c.id === colId ? { ...c, collapsed: !c.collapsed } : c
    )
  })),

  createCollection: (name) => set(state => {
    const newCol = {
      id: createId(),
      workspaceId: state.activeWorkspaceId,
      name: name || 'New Collection',
      collapsed: false,
      itemIds: [],
      pinned: false
    };
    return { collections: [...state.collections, newCol] };
  }),

  createRequest: (colId, protocol) => set(state => {
    const newId = createId();
    const protoToUse = protocol || state.lastProtocol;
    const newReq = { 
        id: newId, 
        collectionId: colId, 
        name: 'New Request', 
        method: 'GET', 
        protocol: protoToUse,
        url: '', 
        params: [],
        cookies: [],
        auth: { type: 'noauth' },
        body: { type: 'none', language: 'json', formdata: [] },
        scripts: { pre: '', post: '' },
        pinned: false
    };
    
    const newRequestStates = { ...state.requestStates, [newId]: newReq };
    const newCollections = state.collections.map(col => 
        col.id === colId ? { ...col, itemIds: [...col.itemIds, newId], collapsed: false } : col
    );
    return {
      requestStates: newRequestStates,
      collections: newCollections,
      openTabs: [...state.openTabs, newId],
      activeTabId: newId,
      // previewTabId: state.previewTabId,
      unsavedRequests: new Set(state.unsavedRequests).add(newId),
      lastProtocol: protocol,
      activeView: 'runner' // <--- FIX: Ensure we view the Runner
    };
  }),

  createDetachedRequest: (protocol = null) => set(state => {
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
          pinned: false
      };
      const newRequestStates = { ...state.requestStates, [newId]: newReq };
      
      const newTabs = [...state.openTabs];
      if (state.previewTabId) {
          const idx = newTabs.indexOf(state.previewTabId);
          if (idx !== -1) newTabs[idx] = newId;
          else newTabs.push(newId);
      } else {
          newTabs.push(newId);
      }

      return {
          requestStates: newRequestStates,
          openTabs: newTabs,
          activeTabId: newId,
          // previewTabId: newId, // Don't make it a preview tab
          unsavedRequests: new Set(state.unsavedRequests).add(newId),
          lastProtocol: protoToUse,
          activeView: 'runner' // <--- FIX: Ensure we view the Runner
      };
  }),

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
    const envs = ENVIRONMENTS[wsId] || [];
    const envIdx = envs.findIndex(e => e.id === id);
    if (envIdx !== -1) {
        const env = envs[envIdx];
        ENVIRONMENTS[wsId][envIdx] = { ...env, pinned: !env.pinned };
        // We don't mark as unsaved for pinning, usually
        return { _ts: Date.now() };
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

  deleteItem: (id) => set(state => {
      // 1. Collection
      const isCollection = state.collections.find(c => c.id === id);
      if (isCollection) return { collections: state.collections.filter(c => c.id !== id) };
      
      // 2. Monitor
      if (state.monitorStates[id]) {
          const { [id]: deleted, ...rest } = state.monitorStates;
          const newTabs = state.openTabs.filter(t => t !== id);
          const newActive = state.activeTabId === id ? (newTabs[newTabs.length - 1] || null) : state.activeTabId;
          return { monitorStates: rest, openTabs: newTabs, activeTabId: newActive };
      }

      // 3. Request
      const { [id]: deleted, ...remainingRequests } = state.requestStates;
      const newCollections = state.collections.map(c => ({ ...c, itemIds: c.itemIds.filter(itemId => itemId !== id) }));
      const newTabs = state.openTabs.filter(t => t !== id);
      const newActive = state.activeTabId === id ? (newTabs[newTabs.length - 1] || null) : state.activeTabId;
      return { requestStates: remainingRequests, collections: newCollections, openTabs: newTabs, activeTabId: newActive };
  }),

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
  openTabs: ['req-1'], 
  activeTabId: 'req-1',
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
        const envs = ENVIRONMENTS[wsId] || [];
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
            const envs = ENVIRONMENTS[wsId] || [];
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

  saveRequest: (id) => set(state => {
    const newSet = new Set(state.unsavedRequests);
    newSet.delete(id);
    return { unsavedRequests: newSet };
  }),

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
        currentList = [...(req.body?.formdata || [])];
        isNested = true;
    } else {
        currentList = [...(req[listName] || [])];
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

  renameItem: (id, newName, markAsUnsaved = true) => set(state => {
      const newCols = state.collections.map(c => c.id === id ? { ...c, name: newName } : c);
      const newReqs = { ...state.requestStates };
      if (newReqs[id]) newReqs[id] = { ...newReqs[id], name: newName };
      
      const newMonitors = { ...state.monitorStates };
      if (newMonitors[id]) newMonitors[id] = { ...newMonitors[id], name: newName };

      const wsId = state.activeWorkspaceId;
      const envs = ENVIRONMENTS[wsId] || [];
      const envIdx = envs.findIndex(e => e.id === id);
       if (envIdx !== -1) {
          ENVIRONMENTS[wsId][envIdx] = { ...envs[envIdx], name: newName };
          
          if (markAsUnsaved) {
             const newUnsaved = new Set(state.unsavedRequests).add(id);
             return { collections: newCols, requestStates: newReqs, monitorStates: newMonitors, unsavedRequests: newUnsaved, _ts: Date.now() };
          }
      }
      
      return { collections: newCols, requestStates: newReqs, monitorStates: newMonitors, _ts: Date.now() };
  }),

  isLoading: false,
  response: null, error: null,
  executeRequest: async () => {
    const state = get();
    const activeId = state.activeTabId;
    const req = state.requestStates[activeId];
    
    if (!req) return;

    set({ isLoading: true, error: null, response: null });
    const delay = 500 + Math.random() * 1000;
    
    setTimeout(() => {
        const responseData = {
            status: 200, text: 'OK', time: Math.floor(delay), size: 1450,
            headers: { 'content-type': 'application/json', 'set-cookie': 'session=123; HttpOnly; Secure', 'server': 'TraceWeave' },
            cookies: { 'session': '123' },
            data: { success: true, message: "System operational" },
            trace: generateMockTrace()
        };
        
        get().addToHistory(req, responseData);

        set({
            isLoading: false,
            response: responseData
        });
    }, delay);
  },

  // --- Annotations ---
  requestNotes: {}, 
  spanNotes: {}, 
  updateRequestNote: (id, note) => set(state => ({ requestNotes: { ...state.requestNotes, [id]: note } })),
  addSpanNote: (spanId, note) => set(state => ({ spanNotes: { ...state.spanNotes, [spanId]: note } })),
  
  inviteMember: (email, role) => set(state => ({
    workspaceMembers: [...state.workspaceMembers, { id: createId(), name: email.split('@')[0], email, role }]
  })),
}));