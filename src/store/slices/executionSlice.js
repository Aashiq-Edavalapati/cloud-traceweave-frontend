import { requestApi } from '@/api/request.api';
import { workflowApi } from '@/api/workflow.api';
import { workspaceApi } from '@/api/workspace.api';

// --- Helpers 
const formatListToObject = (listOrObject) => {
    if (!listOrObject) return {};
    if (!Array.isArray(listOrObject) && typeof listOrObject === 'object') return listOrObject;
    if (!Array.isArray(listOrObject)) return {};
    
    return listOrObject.reduce((acc, item) => {
        if (item.key && item.active !== false) acc[item.key] = item.value;
        return acc;
    }, {});
};

const formatCookiesToHeader = (cookieList) => {
    if (!Array.isArray(cookieList) || cookieList.length === 0) return null;
    return cookieList
        .filter(c => c.key && c.active !== false)
        .map(c => `${c.key}=${c.value !== undefined ? c.value : ''}`)
        .join('; ');
};

const resolveUrlWithEnvs = (url, envValues) => {
    if (!url) return '';
    return url.replace(/{{([^}]+)}}/g, (match, key) => {
        return envValues[key.trim()] || match; // Replace {{var}} with value, or keep as is
    });
};

const isLocalhostUrl = (urlString) => {
    if (!urlString) return false;
    try {
        // Detect ANY protocol (http, ws, wss, grpc, etc.) before parsing
        const hasProtocol = /^[a-zA-Z]+:\/\//.test(urlString);
        const urlToParse = hasProtocol ? urlString : `http://${urlString}`;
        const parsedUrl = new URL(urlToParse);
        const hostname = parsedUrl.hostname.toLowerCase();
        
        // Catch standard local loopbacks
        return ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(hostname);
    } catch (e) {
        return false; 
    }
};

export const createExecutionSlice = (set, get) => ({
    isLoading: false,
    response: null,
    error: null,
    history: [],

    executeRequest: async () => {
        const state = get();
        const activeId = state.activeTabId;
        const req = state.requestStates[activeId];

        if (!req) return;

        set({ isLoading: true, error: null, response: null });

        try {
            let finalConfig = { ...req.config };
            let hasFiles = false; 
            const isElectron = typeof window !== "undefined" && window.electronAPI;

            if (req.protocol === 'http' || req.protocol === 'graphql') {
                const userHeaders = formatListToObject(req.config.headers);
                const userParams = formatListToObject(req.config.params);
                const impliedHeaders = {};

                let finalBodyPayload = null;

                const hasHeader = (key) =>
                    Object.keys(userHeaders).some((k) => k.toLowerCase() === key.toLowerCase());

                if (req.protocol === 'http') {
                    const bodyType = req.config.body?.type;
                    const bodyLang = req.config.body?.language;

                    if (bodyType === 'raw') {
                        finalBodyPayload = { type: 'raw', raw: req.config.body.raw };
                        if (!hasHeader('content-type') && bodyLang === 'json') {
                            impliedHeaders['Content-Type'] = 'application/json';
                        }
                    }
                    else if (bodyType === 'urlencoded') {
                        const urlencodedData = [];
                        (req.config.body.urlencoded || []).forEach((item) => {
                            if (item.active && item.key) {
                                urlencodedData.push({ key: item.key, value: item.value });
                            }
                        });

                        finalBodyPayload = { type: 'urlencoded', urlencoded: urlencodedData };
                        if (!hasHeader('content-type')) {
                            impliedHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
                        }
                    } else if (bodyType === 'formdata') {
                        const processedFormData = (req.config.body.formdata || []).map(item => {
                            if (!item.active || !item.key) return null;

                            // Check for our safely stored 'path' string
                            if (item.valueType === 'file' || item.value instanceof File || item.isFile || item.path) {
                                hasFiles = true;
                                const absolutePath = item.path || item.value?.path;
                                console.log(`[Renderer Debug] Preparing file: ${item.key}, Path extracted: ${absolutePath}`);
                                
                                return { 
                                    key: item.key, 
                                    isFile: true, 
                                    path: absolutePath // We now guarantee this is a string
                                }; 
                            }
                            return { key: item.key, value: item.value, isFile: false };
                        }).filter(Boolean);

                        finalBodyPayload = { type: 'formdata', formdata: processedFormData };
                    } else if (bodyType === 'binary') {
                        if (req.config.body.binaryFile instanceof File || req.config.body.binaryFilePath) {
                            hasFiles = true;
                            const absolutePath = req.config.body.binaryFilePath || req.config.body.binaryFile?.path;
                            console.log(`[Renderer Debug] Preparing binary file. Path extracted: ${absolutePath}`);

                            finalBodyPayload = { 
                                type: 'binary', 
                                binaryFile: { 
                                    isFile: true,
                                    path: absolutePath 
                                } 
                            };
                        } else {
                            finalBodyPayload = { type: 'binary', binaryFile: null };
                        }
                    }   

                    finalConfig.body = finalBodyPayload;
                }

                if (req.protocol === 'graphql') {
                    impliedHeaders['Content-Type'] = 'application/json';
                    const gql = req.config.body?.graphql || {};

                    let parsedVariables = {};
                    if (gql.variables) {
                        try {
                            parsedVariables = typeof gql.variables === 'string'
                                ? JSON.parse(gql.variables || '{}')
                                : gql.variables;
                        } catch {
                            throw new Error('Invalid JSON in GraphQL variables');
                        }
                    }

                    finalBodyPayload = {
                        graphql: { query: gql.query || '', variables: parsedVariables }
                    };

                    finalConfig.body = finalBodyPayload;
                }

                let finalHeaders = { ...impliedHeaders, ...userHeaders };

                const auth = req.config.auth || { type: 'noauth' };
                if (auth.type === 'bearer' && auth.bearer?.token) {
                    finalHeaders['Authorization'] = `Bearer ${auth.bearer.token}`;
                } else if (auth.type === 'basic' && (auth.basic?.username || auth.basic?.password)) {
                    const credentials = btoa(`${auth.basic?.username || ''}:${auth.basic?.password || ''}`);
                    finalHeaders['Authorization'] = `Basic ${credentials}`;
                } else if (auth.type === 'apikey' && auth.apikey?.key && auth.apikey?.value) {
                    if (auth.apikey.in === 'header') finalHeaders[auth.apikey.key] = auth.apikey.value;
                    else if (auth.apikey.in === 'query') userParams[auth.apikey.key] = auth.apikey.value;
                }

                const cookieHeader = formatCookiesToHeader(req.cookies);
                if (cookieHeader) {
                    const existingCookieKey = Object.keys(finalHeaders).find(k => k.toLowerCase() === 'cookie');
                    
                    if (existingCookieKey) {
                        finalHeaders[existingCookieKey] = finalHeaders[existingCookieKey] 
                            ? `${finalHeaders[existingCookieKey]}; ${cookieHeader}` 
                            : cookieHeader;
                    } else {
                        finalHeaders['Cookie'] = cookieHeader;
                    }
                }

                finalConfig = { ...finalConfig, headers: finalHeaders, params: userParams };
            } 

            // --- PAYLOAD CONSTRUCTION ---
            const envs = state.workspaceEnvironments[state.activeWorkspaceId] || [];
            const activeEnv = envs[state.selectedEnvIndex];
            const envId = activeEnv ? activeEnv.id : null;

            // ✨ EXTRACT ENVIRONMENT VARIABLES FOR OFFLINE DESKTOP INJECTION
            const environmentValues = activeEnv ? activeEnv.variables.reduce((acc, v) => {
                if (v.key && v.active !== false) acc[v.key] = v.value;
                return acc;
            }, {}) : {};

            let apiPayload;

            if (isElectron) {
                // PASS ENVIRONMENT VALUES TO ELECTRON MAIN PROCESS
                if (req.isDetached) {
                    apiPayload = { 
                        workspaceId: state.activeWorkspaceId, 
                        protocol: req.protocol, 
                        config: finalConfig, 
                        environmentId: envId || null,
                        environmentValues 
                    };
                } else {
                    apiPayload = { 
                        environmentId: envId || null, 
                        overrides: { config: finalConfig },
                        environmentValues 
                    };
                }
            } else {
                const resolvedUrl = resolveUrlWithEnvs(finalConfig.url || '', environmentValues);

                if (isLocalhostUrl(resolvedUrl)) {
                    set({ 
                        isLoading: false, 
                        error: "⚠️ Local API Blocked\n\nWeb browsers restrict requests to local servers (localhost, 127.0.0.1) due to strict security policies.\n\nTo test local APIs, please use the Desktop Application." 
                    });
                    return;
                }

                if (hasFiles) {
                    apiPayload = new FormData();
                    if (req.isDetached) {
                        apiPayload.append('workspaceId', state.activeWorkspaceId);
                        apiPayload.append('protocol', req.protocol);
                        if (envId) apiPayload.append('environmentId', envId);
                        apiPayload.append('config', JSON.stringify(finalConfig));
                    } else {
                        if (envId) apiPayload.append('environmentId', envId);
                        apiPayload.append('overrides', JSON.stringify({ config: finalConfig }));
                    }

                    if (req.config.body?.type === 'formdata') {
                        req.config.body.formdata.forEach(item => {
                            if (item.active && item.key && item.value instanceof File) {
                                apiPayload.append(item.key, item.value);
                            }
                        });
                    }
                } else {
                    if (req.isDetached) {
                        apiPayload = { workspaceId: state.activeWorkspaceId, protocol: req.protocol, config: finalConfig, environmentId: envId || null };
                    } else {
                        apiPayload = { environmentId: envId || null, overrides: { config: finalConfig } };
                    }
                }
            }

            // --- EXECUTION ---
            let result;

            if (isElectron) {
                result = await window.electronAPI.executeRequest(apiPayload);
                if (result?.error) throw new Error(result.error);

                if (!req.isDetached && state.unsavedRequests.has(activeId)) {
                    await get().saveRequest(activeId);
                }

                // SYNC DESKTOP EXECUTION TO CLOUD HISTORY
                try {
                    // Do not await this. Let it sync in the background so it doesn't slow down the UI
                    requestApi.syncExecutionHistory({
                        requestId: req.isDetached ? null : activeId,
                        workspaceId: state.activeWorkspaceId,
                        protocol: req.protocol,
                        url: result.url || finalConfig.url, // Ensure we have the URL
                        method: finalConfig.method || 'GET',
                        responseMeta: {
                            status: result.status,
                            statusText: result.statusText,
                            time: result.duration,
                            size: result.size || 0,
                        }
                    }).then(() => {
                        // Re-fetch history to update the sidebar silently after sync
                        get().fetchHistory('workspace');
                    });
                } catch (syncErr) {
                    console.warn("Failed to sync local execution history:", syncErr);
                }
            } else {
                if (req.isDetached) {
                    result = await requestApi.executeAdHocRequest(apiPayload);
                } else {
                    if (state.unsavedRequests.has(activeId)) {
                        await get().saveRequest(activeId);
                    }
                    result = await requestApi.executeRequest(activeId, apiPayload);
                }
            }

            if (!isElectron) {
                get().addToHistory(req, result);
            }
            set({ isLoading: false, response: result });

        } catch (error) {
            const status = error.response?.status;
            let errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;

            if (status === 403) errorMessage = "You do not have permissions to execute requests";

            console.warn("Execution Error (Handled):", { status, message: errorMessage });
            set({ isLoading: false, error: errorMessage });
        }
    },

    executeWorkflow: async (workflowId) => {
        set({ isLoading: true, error: null, response: null });
        try {
            const result = await workflowApi.executeWorkflow(workflowId);
            set({
                isLoading: false,
                response: { ...result.report, isWorkflow: true }
            });
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            set({ isLoading: false, error: errorMessage });
        }
    },

    fetchHistory: async (scope = 'workspace', page = 1, limit = 20) => {
        const { activeWorkspaceId } = get();
        try {
            let response;
            
            if (scope === 'workspace' && activeWorkspaceId) {
                response = await workspaceApi.getWorkspaceHistory(activeWorkspaceId, { page, limit });
            } else if (scope === 'all') {
                response = await workspaceApi.getGlobalHistory({ page, limit }); 
            }

            if (response) {
                const historyItems = response.data || [];
                const pagination = response.pagination || {};
                
                set((state) => ({ 
                    // Replace on page 1, append on subsequent pages
                    history: page === 1 ? historyItems : [...state.history, ...historyItems] 
                }));

                return pagination; // Return this so the UI knows if it should show "Load More"
            }
        } catch (error) { 
            console.warn(`Failed to fetch ${scope} history:`, error); 
            return null;
        }
    },

    getHistory: () => get().history,

    getFormattedHistory: (scope = 'workspace') => {
        const { history } = get();
        return history.map(h => ({
            ...h,
            timestamp: h.createdAt,
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
  
    addToHistory: (req, res) => {
        get().fetchHistory('workspace');
    },

    clearHistory: async () => {
        set({ history: [] });
    },

    removeFromHistory: (id) => set(state => ({
        history: state.history.filter(h => (h._id || h.id) !== id)
    })),
});