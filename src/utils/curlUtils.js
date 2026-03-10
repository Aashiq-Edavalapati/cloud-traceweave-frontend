/**
 * 1. CLI Tokenizer: Safely parses a string into arguments exactly like a terminal
 */
const tokenizeArgs = (cmd) => {
    const args = [];
    let currentArg = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let isEscaped = false;

    // Clean up bash line continuations before parsing
    const cleanCmd = cmd.replace(/\\\r?\n/g, ' ');

    for (let i = 0; i < cleanCmd.length; i++) {
        const char = cleanCmd[i];

        if (isEscaped) {
            currentArg += char;
            isEscaped = false;
            continue;
        }

        if (char === '\\' && !inSingleQuote) {
            isEscaped = true;
            continue;
        }

        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            continue;
        }

        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }

        if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
            if (currentArg.length > 0) {
                args.push(currentArg);
                currentArg = '';
            }
            continue;
        }

        currentArg += char;
    }

    if (currentArg.length > 0) args.push(currentArg);
    return args;
};

/**
 * 2. Parse cURL to HTTP Config (Import)
 */
export const parseCurlToConfig = (curlString) => {
    // Initialize strictly to match your standard state shape
    const config = {
        method: 'GET',
        url: '',
        headers: [],
        params: [],
        body: { type: 'none', language: 'json', formdata: [], urlencoded: [], raw: '' },
        auth: { type: 'none', basic: { username: '', password: '' }, bearer: { token: '' } }
    };

    if (!curlString || typeof curlString !== 'string') return config;

    const tokens = tokenizeArgs(curlString);
    let rawDataParts = [];
    let hasFormData = false;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.toLowerCase() === 'curl' || token.toLowerCase() === 'curl.exe') continue;

        // --- HTTP METHOD ---
        if (token === '-X' || token === '--request') {
            if (i + 1 < tokens.length) config.method = tokens[++i].toUpperCase();
            continue;
        }

        // --- HEADERS & SMART AUTH MAPPING ---
        if (token === '-H' || token === '--header') {
            if (i + 1 < tokens.length) {
                const headerStr = tokens[++i];
                const splitIdx = headerStr.indexOf(':');
                if (splitIdx > -1) {
                    const key = headerStr.slice(0, splitIdx).trim();
                    const value = headerStr.slice(splitIdx + 1).trim();

                    // Magic: Map Authorization header to Auth UI
                    if (key.toLowerCase() === 'authorization') {
                        if (value.toLowerCase().startsWith('bearer ')) {
                            config.auth.type = 'bearer';
                            config.auth.bearer.token = value.substring(7).trim();
                            continue; // Don't add to headers array
                        } else if (value.toLowerCase().startsWith('basic ')) {
                            try {
                                const decoded = atob(value.substring(6).trim());
                                const [username, ...passParts] = decoded.split(':');
                                config.auth.type = 'basic';
                                config.auth.basic.username = username || '';
                                config.auth.basic.password = passParts.join(':') || '';
                                continue; // Don't add to headers array
                            } catch (e) {
                                // If decoding fails, fallback to pushing it as a regular header
                            }
                        }
                    }

                    // Smart Content-Type Mapping
                    if (key.toLowerCase() === 'content-type') {
                        const v = value.toLowerCase();
                        if (v.includes('application/json')) {
                            config.body.type = 'raw';
                            config.body.language = 'json';
                        } else if (v.includes('application/x-www-form-urlencoded')) {
                            config.body.type = 'urlencoded';
                        } else if (v.includes('multipart/form-data')) {
                            config.body.type = 'formdata';
                        } else if (v.includes('application/xml') || v.includes('text/xml')) {
                            config.body.type = 'raw';
                            config.body.language = 'xml';
                        } else if (v.includes('text/html')) {
                            config.body.type = 'raw';
                            config.body.language = 'html';
                        } else if (v.includes('text/plain')) {
                            config.body.type = 'raw';
                            config.body.language = 'text';
                        }
                    }

                    config.headers.push({ key, value, active: true });
                }
            }
            continue;
        }

        // --- DIRECT BASIC AUTH (-u) ---
        if (token === '-u' || token === '--user') {
            if (i + 1 < tokens.length) {
                const authStr = tokens[++i];
                const [username, ...passParts] = authStr.split(':');
                config.auth.type = 'basic';
                config.auth.basic.username = username || '';
                config.auth.basic.password = passParts.join(':') || '';
            }
            continue;
        }

        // --- SHORTCUT HEADERS ---
        if (token === '-A' || token === '--user-agent') {
            if (i + 1 < tokens.length) config.headers.push({ key: 'User-Agent', value: tokens[++i], active: true });
            continue;
        }
        if (token === '-e' || token === '--referer') {
            if (i + 1 < tokens.length) config.headers.push({ key: 'Referer', value: tokens[++i], active: true });
            continue;
        }
        if (token === '-b' || token === '--cookie') {
            if (i + 1 < tokens.length) config.headers.push({ key: 'Cookie', value: tokens[++i], active: true });
            continue;
        }

        // --- BODY DATA (-d, --data) ---
        if (['-d', '--data', '--data-raw', '--data-binary', '--data-urlencode'].includes(token)) {
            if (config.method === 'GET') config.method = 'POST';
            if (i + 1 < tokens.length) rawDataParts.push(tokens[++i]);
            continue;
        }

        // --- MULTIPART FORM DATA (-F) ---
        if (token === '-F' || token === '--form') {
            if (config.method === 'GET') config.method = 'POST';
            hasFormData = true;
            config.body.type = 'formdata';
            if (i + 1 < tokens.length) {
                const formStr = tokens[++i];
                const splitIdx = formStr.indexOf('=');
                if (splitIdx > -1) {
                    let key = formStr.slice(0, splitIdx);
                    let val = formStr.slice(splitIdx + 1);
                    let valueType = 'text';
                    if (val.startsWith('@')) {
                        valueType = 'file';
                        val = val.substring(1);
                    }
                    config.body.formdata.push({ key, value: val, active: true, valueType });
                }
            }
            continue;
        }

        // --- URL PARSING ---
        if (token.startsWith('http://') || token.startsWith('https://')) {
            config.url = token;
        } else if (!config.url && !token.startsWith('-')) {
            config.url = 'http://' + token; // Fallback
        }
    }

    // --- PROCESS ACCUMULATED BODY DATA ---
    if (rawDataParts.length > 0 && !hasFormData) {
        const rawDataStr = rawDataParts.join('&');
        try {
            JSON.parse(rawDataStr);
            config.body.type = 'raw';
            config.body.language = 'json';
            config.body.raw = rawDataStr;
        } catch {
            // If it's not JSON, check if it looks like x-www-form-urlencoded
            if (rawDataStr.includes('=') && !rawDataStr.includes('{')) {
                config.body.type = 'urlencoded';
                config.body.urlencoded = rawDataStr.split('&').map(part => {
                    const [k, v] = part.split('=');
                    return { key: decodeURIComponent(k || ''), value: decodeURIComponent(v || ''), active: true, valueType: 'text' };
                });
            } else {
                config.body.type = 'raw';
                config.body.language = 'text';
                config.body.raw = rawDataStr;
            }
        }
    }

    // --- EXTRACT QUERY PARAMS FROM URL ---
    try {
        if (config.url) {
            const urlObj = new URL(config.url);
            urlObj.searchParams.forEach((value, key) => {
                config.params.push({ key, value, active: true });
            });
            config.url = urlObj.origin + urlObj.pathname;
        }
    } catch (e) { /* keep raw url if invalid */ }

    // Pad empty rows for UI ease of use
    if (config.headers.length === 0) config.headers.push({ key: '', value: '', active: true });
    if (config.params.length === 0) config.params.push({ key: '', value: '', active: true });
    if (config.body.formdata.length === 0) config.body.formdata.push({ key: '', value: '', active: true, valueType: 'text' });
    if (config.body.urlencoded.length === 0) config.body.urlencoded.push({ key: '', value: '', active: true, valueType: 'text' });

    return config;
};

/**
 * 3. Generate cURL from HTTP Config (Export)
 */
export const generateCurlFromConfig = (config, envResolver = null) => {
    if (!config) return '';

    const interpolate = (str) => {
        if (!str || typeof str !== 'string' || !envResolver) return str;
        return str.replace(/\{\{(.*?)\}\}/g, (match, varName) => {
            const resolved = envResolver(varName.trim());
            return resolved !== null && resolved !== undefined ? resolved : match;
        });
    };

    let curl = `curl -X ${config.method || 'GET'}`;
    const escapeBash = (str) => `'${interpolate(str || '').replace(/'/g, "'\\''")}'`;

    // 1. URL & Params
    let finalUrl = config.url || '';
    const paramsRaw = Array.isArray(config.params) ? config.params : Object.values(config.params || {});
    const activeParams = paramsRaw.filter(p => p && p.active !== false && p.key);
    if (activeParams.length > 0) {
        const queryString = activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || '')}`).join('&');
        finalUrl += finalUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
    }
    curl += ` \\\n  ${escapeBash(finalUrl)}`;

    // 2. Headers
    const headersRaw = Array.isArray(config.headers) ? config.headers : Object.values(config.headers || {});
    const activeHeaders = headersRaw.filter(h => h && h.active !== false && h.key);
    let hasContentType = false;
    activeHeaders.forEach(h => {
        if (h.key.toLowerCase() === 'content-type') hasContentType = true;
        curl += ` \\\n  -H ${escapeBash(`${h.key}: ${h.value || ''}`)}`;
    });

    // Smart headers for Body if missing
    if (config.body && !['GET', 'HEAD'].includes(config.method) && !hasContentType) {
        if (config.body.type === 'raw') {
            if (config.body.language === 'json') curl += ` \\\n  -H 'Content-Type: application/json'`;
            else if (config.body.language === 'xml') curl += ` \\\n  -H 'Content-Type: application/xml'`;
            else if (config.body.language === 'html') curl += ` \\\n  -H 'Content-Type: text/html'`;
            else if (config.body.language === 'text') curl += ` \\\n  -H 'Content-Type: text/plain'`;
        } else if (config.body.type === 'json') {
            curl += ` \\\n  -H 'Content-Type: application/json'`;
        } else if (config.body.type === 'urlencoded') {
            const activeUrlEncoded = (config.body.urlencoded || []).filter(f => f.active !== false && f.key);
            if (activeUrlEncoded.length > 0) {
                curl += ` \\\n  -H 'Content-Type: application/x-www-form-urlencoded'`;
            }
        }
    }

    // 3. Authorization
    if (config.auth && config.auth.type !== 'none') {
        if (config.auth.type === 'basic' && config.auth.basic?.username) {
            curl += ` \\\n  -u ${escapeBash(`${config.auth.basic.username}:${config.auth.basic.password || ''}`)}`;
        } else if (config.auth.type === 'bearer' && config.auth.bearer?.token) {
            curl += ` \\\n  -H ${escapeBash(`Authorization: Bearer ${config.auth.bearer.token}`)}`;
        }
    }

    // 4. Body
    if (config.body && !['GET', 'HEAD'].includes(config.method)) {
        if (['raw', 'json', 'text', 'xml', 'html'].includes(config.body.type)) {
            const rawText = config.body.raw || '';
            if (rawText) curl += ` \\\n  -d ${escapeBash(rawText)}`;
            
        } else if (config.body.type === 'formdata') {
            const formDataRaw = Array.isArray(config.body.formdata) ? config.body.formdata : Object.values(config.body.formdata || {});
            const activeForm = formDataRaw.filter(f => f && f.active !== false && f.key);
            activeForm.forEach(f => {
                if (f.valueType === 'file') {
                    curl += ` \\\n  -F ${escapeBash(`${f.key}=@${f.path || f.value?.name || 'file'}`)}`;
                } else {
                    curl += ` \\\n  -F ${escapeBash(`${f.key}=${f.value || ''}`)}`;
                }
            });
            
        } else if (config.body.type === 'urlencoded') {
            const urlEncodedRaw = Array.isArray(config.body.urlencoded) ? config.body.urlencoded : Object.values(config.body.urlencoded || {});
            const activeUrlEncoded = urlEncodedRaw.filter(f => f && f.active !== false && f.key);
            if (activeUrlEncoded.length > 0) {
                const formDataStr = activeUrlEncoded.map(f => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value || '')}`).join('&');
                curl += ` \\\n  -d ${escapeBash(formDataStr)}`;
            }
        }
    }

    return curl;
};

/**
 * 4. Generate PowerShell (Because you work on Windows, this is highly recommended for testing)
 */
export const generatePowerShellFromConfig = (config, envResolver = null) => {
    if (!config) return '';

    const interpolate = (str) => {
        if (!str || typeof str !== 'string' || !envResolver) return str;
        return str.replace(/\{\{(.*?)\}\}/g, (match, varName) => {
            const resolved = envResolver(varName.trim());
            return resolved !== null && resolved !== undefined ? resolved : match;
        });
    };

    let ps = `Invoke-RestMethod -Method ${config.method || 'GET'}`;
    
    // Helper to interpolate and escape for PowerShell strings
    const escapePs = (str) => interpolate(str || '').replace(/'/g, "''");

    let finalUrl = config.url || '';
    const paramsRaw = Array.isArray(config.params) ? config.params : Object.values(config.params || {});
    const activeParams = paramsRaw.filter(p => p && p.active !== false && p.key);
    if (activeParams.length > 0) {
        const queryString = activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || '')}`).join('&');
        finalUrl += finalUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
    }
    ps += ` -Uri "${interpolate(finalUrl)}"`;

    let headersObj = {};
    
    // Auth to Headers for PowerShell
    if (config.auth && config.auth.type !== 'none') {
        if (config.auth.type === 'basic' && config.auth.basic?.username) {
            const user = interpolate(config.auth.basic.username);
            const pass = interpolate(config.auth.basic.password || '');
            const base64 = btoa(`${user}:${pass}`);
            headersObj['Authorization'] = `Basic ${base64}`;
        } else if (config.auth.type === 'bearer' && config.auth.bearer?.token) {
            headersObj['Authorization'] = `Bearer ${interpolate(config.auth.bearer.token)}`;
        }
    }

    // Standard Headers
    const headersRaw = Array.isArray(config.headers) ? config.headers : Object.values(config.headers || {});
    const activeHeaders = headersRaw.filter(h => h && h.active !== false && h.key);
    let hasContentType = false;
    activeHeaders.forEach(h => { 
        if (h.key.toLowerCase() === 'content-type') hasContentType = true;
        headersObj[h.key] = h.value; 
    });

    if (config.body && !['GET', 'HEAD'].includes(config.method) && !hasContentType) {
        if (config.body.type === 'raw' && config.body.language === 'json') headersObj['Content-Type'] = 'application/json';
        else if (config.body.type === 'json') headersObj['Content-Type'] = 'application/json';
        else if (config.body.type === 'urlencoded') {
            const urlEncodedRaw = Array.isArray(config.body.urlencoded) ? config.body.urlencoded : Object.values(config.body.urlencoded || {});
            const activeUrlEncoded = urlEncodedRaw.filter(f => f && f.active !== false && f.key);
            if (activeUrlEncoded.length > 0) headersObj['Content-Type'] = 'application/x-www-form-urlencoded';
        }
    }

    if (Object.keys(headersObj).length > 0) {
        let headersDict = Object.entries(headersObj).map(([k, v]) => `'${interpolate(k)}' = '${escapePs(v)}'`).join('; ');
        ps += ` -Headers @{ ${headersDict} }`;
    }

    // Body
    if (config.body && !['GET', 'HEAD'].includes(config.method)) {
        if (['raw', 'json'].includes(config.body.type)) {
            const rawText = config.body.raw || '';
            if (rawText) ps += ` -Body '${escapePs(rawText)}'`;
        } else if (config.body.type === 'urlencoded') {
            const urlEncodedRaw = Array.isArray(config.body.urlencoded) ? config.body.urlencoded : Object.values(config.body.urlencoded || {});
            const activeUrlEncoded = urlEncodedRaw.filter(f => f && f.active !== false && f.key);
            if (activeUrlEncoded.length > 0) {
                const formDataStr = activeUrlEncoded.map(f => `${encodeURIComponent(interpolate(f.key))}=${encodeURIComponent(interpolate(f.value || ''))}`).join('&');
                ps += ` -Body '${escapePs(formDataStr)}'`;
            }
        }
    }

    return ps;
};