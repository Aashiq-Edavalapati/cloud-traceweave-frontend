'use client';
import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Trash2, Eye, EyeOff, Info } from 'lucide-react';

export default function HeadersEditor() {
    const store = useAppStore();
    const activeId = store.activeTabId;
    const req = store.requestStates[activeId];
    const [showAuto, setShowAuto] = useState(false);
    
    // --- UPDATED AUTO-GENERATED HEADERS LOGIC ---
    const autoHeaders = useMemo(() => {
        if (!req || !req.config) return [];

        const config = req.config;
        let host = '';
        try { host = new URL(config.url).hostname; } catch {}

        const autos = [
            // Standard Connection Headers
            { key: 'Host', value: host || '<calculated when request is sent>', desc: 'Added automatically' },
            { key: 'User-Agent', value: 'TraceWeaveRuntime/1.0', desc: 'Added automatically' },
            { key: 'Accept', value: '*/*', desc: 'Added automatically' },
            { key: 'Accept-Encoding', value: 'gzip, deflate, br', desc: 'Added automatically' },
            { key: 'Connection', value: 'keep-alive', desc: 'Added automatically' },
            
            // Postman-like defaults
            { key: 'Cache-Control', value: 'no-cache', desc: 'Added automatically' }, 
            { key: 'Content-Length', value: '<calculated when request is sent>', desc: 'Added automatically' },
        ];

        // FIX: Removed the ['POST', 'PUT'...] restriction. 
        // If there is a body configured, we should show the header regardless of the HTTP method.
        if (req.protocol === 'graphql') {
             autos.push({ key: 'Content-Type', value: 'application/json', desc: 'Added based on GraphQL protocol' });
        } else if (req.protocol === 'http') {
             const bodyType = config.body?.type;
             const bodyLang = config.body?.language;
             
             if (bodyType === 'raw' && bodyLang === 'json') {
                 autos.push({ key: 'Content-Type', value: 'application/json', desc: 'Added based on JSON body' });
             } else if (bodyType === 'urlencoded') {
                 autos.push({ key: 'Content-Type', value: 'application/x-www-form-urlencoded', desc: 'Added based on Form URL-Encoded body' });
             } else if (bodyType === 'formdata') {
                 autos.push({ key: 'Content-Type', value: 'multipart/form-data; boundary=<calculated>', desc: 'Added based on Form-Data body' });
             }
        }

        // ==========================================
        // 🔐 INJECT AUTH PREVIEW INTO HEADERS
        // ==========================================
        const auth = config.auth;
        if (auth && auth.type !== 'noauth') {
            if (auth.type === 'bearer') {
                 const previewToken = auth.bearer?.token ? `${auth.bearer.token.substring(0, 10)}...` : '<empty>';
                 autos.push({ key: 'Authorization', value: `Bearer ${previewToken}`, desc: 'Added from Authorization tab' });
            } 
            else if (auth.type === 'basic') {
                 autos.push({ key: 'Authorization', value: `Basic <credentials>`, desc: 'Added from Authorization tab' });
            }
            else if (auth.type === 'apikey' && auth.apikey?.in === 'header') {
                 const keyName = auth.apikey.key || 'x-api-key';
                 const valPreview = auth.apikey.value ? `${auth.apikey.value.substring(0, 5)}...` : '<empty>';
                 autos.push({ key: keyName, value: valPreview, desc: 'Added from Authorization tab' });
            }
        }

        // ==========================================
        // 🍪 INJECT COOKIE PREVIEW INTO HEADERS
        // ==========================================
        if (req.cookies && req.cookies.length > 0) {
            const activeCookies = req.cookies.filter(c => c.key && c.active !== false);
            if (activeCookies.length > 0) {
                 const cookieStr = activeCookies.map(c => `${c.key}=${c.value}`).join('; ');
                 // Truncate for display
                 const preview = cookieStr.length > 30 ? cookieStr.substring(0, 30) + '...' : cookieStr;
                 autos.push({ key: 'Cookie', value: preview, desc: 'Added from Cookies tab' });
            }
        }

        return autos;
    }, [req]);

    // Data Normalization (Legacy cleanup)
    useEffect(() => {
        if (!req || !req.config) return;
        const h = req.config.headers;
        if (h && typeof h === 'object' && !Array.isArray(h)) {
            const convertedHeaders = Object.entries(h).map(([key, value]) => ({
                key, value: String(value), active: true
            }));
            store.updateActiveRequestDeep(['config', 'headers'], convertedHeaders);
        }
    }, [req, store]);

    if (!req) return null;

    const headers = Array.isArray(req.config?.headers) ? req.config.headers : [];

    // Check if a user header overrides an auto header
    const overriddenKeys = headers.filter(h => h.key && h.active !== false).map(h => h.key.toLowerCase());

    const updateHeader = (index, key, value) => {
        if (headers.length === 0 && index === 0) {
            store.updateRequestListConfig('headers', 0, 'key', key);
            store.updateRequestListConfig('headers', 0, 'value', value);
        } else {
            store.updateRequestListConfig('headers', index, key, value);
        }
    };

    const removeHeader = (index) => {
        store.removeRequestListItem('headers', index);
    };

    const toggleActive = (index) => {
        const currentVal = headers[index].active !== false; 
        store.updateRequestListConfig('headers', index, 'active', !currentVal);
    };

    const addNewHeader = () => {
        const newIndex = headers.length;
        store.updateRequestListConfig('headers', newIndex, 'key', '');
    };

    return (
        <div className="flex flex-col h-full bg-bg-base relative overflow-hidden">
            
            {/* --- AUTO-GENERATED HEADERS (Expanded) --- */}
            <div className="border-b border-border-subtle bg-bg-panel shrink-0">
                <button 
                    onClick={() => setShowAuto(!showAuto)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary w-full text-left transition-colors"
                >
                    {showAuto ? <Eye size={14}/> : <EyeOff size={14}/>}
                    <span>{showAuto ? 'Hide' : 'Show'} auto-generated headers ({autoHeaders.length})</span>
                </button>

                {showAuto && (
                    <div className="bg-bg-base/50 border-t border-border-subtle max-h-[200px] overflow-y-auto custom-scrollbar">
                         <div className="grid grid-cols-[30px_1fr_1fr_1fr] text-[10px] text-text-secondary py-1.5 px-2 uppercase tracking-wider font-semibold border-b border-border-subtle/50">
                             <div></div>
                             <div className="px-2">Key</div>
                             <div className="px-2">Value</div>
                             <div className="px-2 text-right">Description</div>
                         </div>
                         {autoHeaders.map((h, i) => {
                             const isOverridden = overriddenKeys.includes(h.key.toLowerCase());
                             return (
                                 <div key={i} className={`grid grid-cols-[30px_1fr_1fr_1fr] text-xs py-1.5 px-2 border-b border-border-subtle/50 last:border-0 ${isOverridden ? 'opacity-30 line-through' : 'text-text-muted'}`}>
                                     <div className="flex justify-center items-center"><Info size={12}/></div>
                                     <div className="px-2 font-mono text-text-primary">{h.key}</div>
                                     <div className="px-2 font-mono italic truncate" title={h.value}>{h.value}</div>
                                     <div className="px-2 text-[10px] text-right truncate" title={h.desc}>
                                        {isOverridden ? 'Overridden below' : h.desc}
                                     </div>
                                 </div>
                             );
                         })}
                    </div>
                )}
            </div>

            {/* --- USER HEADERS LIST --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div className="border border-border-subtle rounded overflow-hidden select-none">
                    <div className="grid grid-cols-[30px_1fr_1fr_30px] bg-bg-input border-b border-border-subtle text-[10px] font-semibold text-text-secondary py-1.5 uppercase tracking-wider">
                        <div className="pl-3"></div>
                        <div className="pl-3">Key</div>
                        <div className="pl-2 border-l border-border-subtle">Value</div>
                        <div></div>
                    </div>

                    {headers.map((header, index) => (
                        <div key={index} className="grid grid-cols-[30px_1fr_1fr_30px] border-b border-border-subtle text-xs text-text-primary group hover:bg-bg-input/50 transition-colors">
                            <div className="flex items-center justify-center border-r border-transparent">
                                <input 
                                    type="checkbox" 
                                    checked={header.active !== false}
                                    onChange={() => toggleActive(index)}
                                    className="accent-brand-primary cursor-pointer"
                                />
                            </div>
                            <input
                                type="text" 
                                placeholder="Key" 
                                value={header.key}
                                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                className={`bg-transparent px-3 py-1.5 focus:outline-none placeholder:text-text-muted font-mono ${header.active === false ? 'line-through opacity-50' : ''}`}
                            />
                            <input
                                type="text" 
                                placeholder="Value" 
                                value={header.value}
                                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                className={`bg-transparent px-2 py-1.5 border-l border-border-subtle focus:outline-none placeholder:text-text-muted font-mono ${header.active === false ? 'line-through opacity-50' : ''}`}
                            />
                            <div
                                className="flex justify-center items-center opacity-0 group-hover:opacity-100 cursor-pointer text-text-secondary hover:text-red-500"
                                onClick={() => removeHeader(index)}
                            >
                                <Trash2 size={14} />
                            </div>
                        </div>
                    ))}
                    
                    <div 
                        className="p-2 text-xs text-text-muted cursor-pointer hover:bg-bg-input/30 flex items-center gap-2 transition-colors"
                        onClick={addNewHeader}
                    >
                        <span>+ Add header</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
