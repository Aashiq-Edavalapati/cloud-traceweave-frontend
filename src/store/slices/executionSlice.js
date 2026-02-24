import { requestApi } from '@/api/request.api';
import { workflowApi } from '@/api/workflow.api';
import { workspaceApi } from '@/api/workspace.api';

// --- Helpers (Keep exactly as they are) ---
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
        .map(c => `${c.key}=${c.value}`)
        .join('; ');
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
            let hasFiles = false; // Flag to determine how we send payload

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
                            
                            // 1. Check valueType (which survives reloads) OR instanceof File
                            if (item.valueType === 'file' || item.value instanceof File) {
                                if (item.value instanceof File) {
                                    hasFiles = true;
                                }
                                // Tell backend it's a file, even if the actual File object was lost
                                return { key: item.key, isFile: true }; 
                            }
                            
                            // 2. Protect against corrupted objects passing as text values
                            let safeValue = item.value;
                            if (typeof safeValue === 'object' && safeValue !== null) {
                                safeValue = ''; // Strip dead objects so they don't crash the server
                            }
                            
                            return { key: item.key, value: safeValue, isFile: false };
                        }).filter(Boolean);

                        finalBodyPayload = { type: 'formdata', formdata: processedFormData };
                        delete userHeaders['Content-Type'];
                        delete impliedHeaders['Content-Type'];
                    } else if (bodyType === 'binary') {
                        if (req.config.body.binaryFile instanceof File) {
                            hasFiles = true;
                            finalBodyPayload = { type: 'binary', binaryFile: { isFile: true } };
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
                            parsedVariables =
                                typeof gql.variables === 'string'
                                    ? JSON.parse(gql.variables || '{}')
                                    : gql.variables;
                        } catch {
                            throw new Error('Invalid JSON in GraphQL variables');
                        }
                    }

                    finalBodyPayload = {
                        graphql: {
                            query: gql.query || '',
                            variables: parsedVariables,
                        }
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
                    if (finalHeaders['Cookie']) finalHeaders['Cookie'] += `; ${cookieHeader}`;
                    else finalHeaders['Cookie'] = cookieHeader;
                }

                finalConfig = { ...finalConfig, headers: finalHeaders, params: userParams };
            } 
            // grpc / ws skipped here for brevity...

            // --- PAYLOAD CONSTRUCTION ---
            const envs = state.workspaceEnvironments[state.activeWorkspaceId] || [];
            const activeEnv = envs[state.selectedEnvIndex];
            const envId = activeEnv ? activeEnv.id : null;
            const envValues = activeEnv?.variables || {};

            let apiPayload;

            // If we have actual file objects, switch to multipart/form-data
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

                // Append the raw files so Multer can grab them
                if (req.config.body?.type === 'formdata') {
                    req.config.body.formdata.forEach(item => {
                        if (item.active && item.key && item.value instanceof File) {
                            apiPayload.append(item.key, item.value);
                        }
                    });
                } else if (req.config.body?.type === 'binary' && req.config.body.binaryFile instanceof File) {
                    apiPayload.append('binary_upload', req.config.body.binaryFile);
                }
            } 
            // Otherwise, normal JSON payload
            else {
                if (req.isDetached) {
                    apiPayload = { workspaceId: state.activeWorkspaceId, protocol: req.protocol, config: finalConfig, environmentId: envId,  environmentValues: envValues || null };
                } else {
                    apiPayload = { environmentId: envId, environmentValues: envValues || null, overrides: { config: finalConfig } };
                }
            }

            // --- EXECUTION ---
            if (req.isDetached) {
                const result = await requestApi.executeAdHocRequest(apiPayload);
                get().addToHistory(req, result);
                set({ isLoading: false, response: result });
            } else {
                if (state.unsavedRequests.has(activeId)) {
                    await get().saveRequest(activeId);
                }
                const result = await requestApi.executeRequest(activeId, apiPayload);
                console.log("===== RENDERER RECEIVED =====");
                console.log(result);
                console.log("=============================");
                get().addToHistory(req, result);
                set({ isLoading: false, response: result });
            }

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
            if (scope === 'workspace' && activeWorkspaceId) {
                const response = await workspaceApi.getWorkspaceHistory(activeWorkspaceId, { page, limit });
                const historyItems = response.data || [];
                const pagination = response.pagination || {};
                
                set((state) => ({ 
                    // Replace on page 1, append on subsequent pages
                    history: page === 1 ? historyItems : [...state.history, ...historyItems] 
                }));

                return pagination; // Return this so the UI knows if it should show "Load More"
            }
        } catch (error) { 
            console.warn('Failed to fetch history:', error); 
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