'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Plus, Search, ChevronDown, ChevronRight, Save, Edit2 } from 'lucide-react';
import { requestApi } from '@/api/request.api';
import { useAppStore } from '@/store/useAppStore';
import { useModal } from '@/components/providers/ModalProvider';

// --- Helper for datetime-local input ---
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16); 
};

// --- Sub-component: Cookie Form ---
const CookieForm = ({ domain, initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        key: 'Cookie_Name',
        value: 'Cookie_Value',
        path: '/',
        secure: false,
        httpOnly: false,
        expires: '' 
    });

    const handleSubmit = () => {
        // Pass the original ID back if we are editing
        onSave({ ...formData, domain, id: initialData?._id });
    };

    return (
        <div className="bg-[#111] p-4 rounded mb-2 border border-[#333]">
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-[#666]">Name</label>
                    <input className="bg-[#222] text-xs text-[#eee] px-2 py-1 rounded border border-[#444] outline-none focus:border-[var(--brand-primary)]"
                        value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-[#666]">Value</label>
                    <input className="bg-[#222] text-xs text-[#eee] px-2 py-1 rounded border border-[#444] outline-none focus:border-[var(--brand-primary)]"
                        value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-[#666]">Domain</label>
                    <input className="bg-[#222] text-xs text-[#777] px-2 py-1 rounded border border-[#333] cursor-not-allowed"
                        value={domain} disabled />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-[#666]">Path</label>
                    <input className="bg-[#222] text-xs text-[#eee] px-2 py-1 rounded border border-[#444] outline-none focus:border-[var(--brand-primary)]"
                        value={formData.path} onChange={e => setFormData({...formData, path: e.target.value})} />
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                 <label className="flex items-center gap-2 text-xs text-[#ccc] cursor-pointer select-none">
                    <input type="checkbox" className="accent-[var(--brand-primary)]" 
                        checked={formData.secure} onChange={e => setFormData({...formData, secure: e.target.checked})} />
                    Secure
                 </label>
                 <label className="flex items-center gap-2 text-xs text-[#ccc] cursor-pointer select-none">
                    <input type="checkbox" className="accent-[var(--brand-primary)]" 
                        checked={formData.httpOnly} onChange={e => setFormData({...formData, httpOnly: e.target.checked})} />
                    HttpOnly
                 </label>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase text-[#666]">Expires (Optional)</label>
                <input 
                    type="datetime-local"
                    className="bg-[#222] text-xs text-[#eee] px-2 py-1 rounded border border-[#444] outline-none focus:border-[var(--brand-primary)]"
                    value={formData.expires} 
                    onChange={e => setFormData({...formData, expires: e.target.value})} 
                />
                <span className="text-[9px] text-[#555]">Leave empty for Session Cookie</span>
            </div>

            <div className="flex gap-2 justify-end">
                <button onClick={onCancel} className="text-xs text-[#999] hover:text-[#eee] px-3 py-1.5">Cancel</button>
                <button onClick={handleSubmit} className="text-xs bg-[var(--brand-primary)] text-white px-3 py-1.5 rounded hover:bg-[#e65b2b]">
                    {initialData ? 'Update Cookie' : 'Save Cookie'}
                </button>
            </div>
        </div>
    );
};

export default function CookieManagerModal({ isOpen, onClose, initialDomain }) {
    const store = useAppStore();
    const workspaceId = store.activeWorkspaceId;
    const { showAlert, showConfirm } = useModal();
    
    const [mounted, setMounted] = useState(false);
    const [cookies, setCookies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    
    const [expandedDomains, setExpandedDomains] = useState({});
    const [addingCookieTo, setAddingCookieTo] = useState(null); 
    const [editingCookieId, setEditingCookieId] = useState(null); 
    const [newDomainInput, setNewDomainInput] = useState('');
    const [customDomains, setCustomDomains] = useState([]);

    useEffect(() => {
        setMounted(true);
        if (isOpen && workspaceId) {
            fetchAllCookies();
            setAddingCookieTo(null);
            setEditingCookieId(null);
        }
    }, [isOpen, workspaceId]);

    const groupedCookies = useMemo(() => {
        const groups = {};
        cookies.forEach(c => {
            if (!groups[c.domain]) groups[c.domain] = [];
            groups[c.domain].push(c);
        });
        customDomains.forEach(d => {
            if (!groups[d]) groups[d] = [];
        });
        if (search) {
            Object.keys(groups).forEach(domain => {
                if (!domain.toLowerCase().includes(search.toLowerCase())) {
                    delete groups[domain];
                }
            });
        }
        return groups;
    }, [cookies, customDomains, search]);

    const fetchAllCookies = async () => {
        setLoading(true);
        try {
            const data = await requestApi.getJarCookies(workspaceId);
            setCookies(data);
            
            const newExpanded = {};
            data.forEach(c => newExpanded[c.domain] = true);
            if (initialDomain) newExpanded[initialDomain] = true;
            setExpandedDomains(prev => ({ ...prev, ...newExpanded }));
            
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- NEW: Routing the save to Create or Update based on ID ---
    const handleSaveCookie = async (data) => {
        try {
            if (data.id) {
                await requestApi.updateJarCookie(data.id, { ...data, workspaceId });
            } else {
                await requestApi.createJarCookie({ ...data, workspaceId });
            }
            setAddingCookieTo(null);
            setEditingCookieId(null);
            fetchAllCookies();
        } catch (err) {
            showAlert(err.response?.data?.error || 'Failed to save cookie');
        }
    };

    const handleDeleteCookie = async (id, domain, key) => {
        await requestApi.deleteJarCookie(id, domain, key);
        fetchAllCookies();
    };

    const handleClearDomain = async (domain) => {
        if (!showConfirm(
            `Are you sure you want to delete all cookies for ${domain}?`, 
            async () => {
                await requestApi.clearJarCookies(domain, workspaceId);
                setCustomDomains(prev => prev.filter(d => d !== domain));
                fetchAllCookies();
            },
            'Clear Domain'
        )) return;
    };

    const handleAddDomain = () => {
        if (!newDomainInput) return;
        if (!groupedCookies[newDomainInput]) {
            setCustomDomains(prev => [...prev, newDomainInput]);
            setExpandedDomains(prev => ({ ...prev, [newDomainInput]: true }));
        }
        setNewDomainInput('');
    };

    const toggleExpand = (domain) => {
        setExpandedDomains(prev => ({ ...prev, [domain]: !prev[domain] }));
    };

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-[#1E1E1E] border border-[#333] rounded-lg w-[800px] shadow-2xl flex flex-col h-[600px] text-[#EDEDED] font-sans">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#333]">
                    <div className="flex gap-6">
                        <h2 className="text-sm font-semibold border-b-2 border-[var(--brand-primary)] pb-4 -mb-4 px-1">Manage Cookies</h2>
                        <h2 className="text-sm font-semibold text-[#666] cursor-not-allowed">Sync Cookies</h2>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-[#eee]">
                        <X size={20} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 flex gap-3 border-b border-[#333] bg-[#252525]">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2 text-[#666]" size={14} />
                        <input 
                            className="w-full bg-[#1A1A1A] border border-[#333] rounded text-xs text-[#eee] pl-9 pr-3 py-2 outline-none focus:border-[#555]"
                            placeholder="Type a domain name"
                            value={search || newDomainInput} 
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setNewDomainInput(e.target.value);
                            }}
                        />
                    </div>
                    <button 
                        onClick={handleAddDomain}
                        className="bg-[#333] hover:bg-[#444] text-xs px-4 py-2 rounded text-[#eee] border border-[#444] transition-colors"
                    >
                        Add domain
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#1E1E1E]">
                    {Object.keys(groupedCookies).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#555]">
                            <span className="text-sm">No cookies yet</span>
                            <span className="text-xs">Add a domain to get started</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedCookies).map(([domain, cookiesList]) => (
                                <div key={`domain-group-${domain}`} className="group/domain">
                                    <div className="flex items-center justify-between mb-2 select-none">
                                        <div 
                                            className="flex items-center gap-2 cursor-pointer hover:text-white"
                                            onClick={() => toggleExpand(domain)}
                                        >
                                            {expandedDomains[domain] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            <span className="text-sm font-bold">{domain}</span>
                                            <span className="text-xs text-[#666]">{cookiesList.length} cookie{cookiesList.length !== 1 && 's'}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleClearDomain(domain)}
                                            className="opacity-0 group-hover/domain:opacity-100 text-[#666] hover:text-red-500 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {expandedDomains[domain] && (
                                        <div className="pl-6 border-l border-[#333] ml-2">
                                            <div className="flex flex-col gap-2 mb-3">
                                                {/* ✨ FIX: Added fallback keys to array elements to prevent React Key warning */}
                                                {cookiesList.map((cookie, idx) => {
                                                    const uniqueKey = cookie._id || `cookie-${domain}-${cookie.key}-${idx}`;
                                                    
                                                    return editingCookieId === uniqueKey ? (
                                                        <CookieForm 
                                                            key={`edit-${uniqueKey}`}
                                                            domain={domain}
                                                            initialData={{
                                                                _id: uniqueKey,
                                                                key: cookie.key,
                                                                value: cookie.value,
                                                                path: cookie.path,
                                                                secure: cookie.secure,
                                                                httpOnly: cookie.httpOnly,
                                                                expires: formatDateForInput(cookie.expires)
                                                            }}
                                                            onSave={handleSaveCookie}
                                                            onCancel={() => setEditingCookieId(null)}
                                                        />
                                                    ) : (
                                                        <div 
                                                            key={`display-${uniqueKey}`} 
                                                            onClick={() => {
                                                                setAddingCookieTo(null);
                                                                setEditingCookieId(uniqueKey);
                                                            }}
                                                            className="flex items-center justify-between bg-[#2A2A2A] border border-[#333] rounded px-3 py-2 cursor-pointer hover:border-[#555] group/chip transition-colors"
                                                        >
                                                            <div className="flex flex-col overflow-hidden mr-4">
                                                                <span className="text-xs font-mono font-bold text-[#ddd] truncate">{cookie.key}</span>
                                                                <span className="text-[10px] text-[#888] truncate mt-0.5">{cookie.value}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <Edit2 size={12} className="text-[#666] opacity-0 group-hover/chip:opacity-100" />
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteCookie(cookie._id, domain, cookie.key);
                                                                    }}
                                                                    className="text-[#666] hover:text-red-500 p-1"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            
                                            {!addingCookieTo && (
                                                <button 
                                                    onClick={() => {
                                                        setEditingCookieId(null);
                                                        setAddingCookieTo(domain);
                                                    }}
                                                    className="text-xs text-[#999] hover:text-[var(--brand-primary)] py-1 flex items-center gap-1"
                                                >
                                                    <Plus size={12} /> Add Cookie
                                                </button>
                                            )}

                                            {addingCookieTo === domain && (
                                                <CookieForm 
                                                    domain={domain} 
                                                    onSave={handleSaveCookie}
                                                    onCancel={() => setAddingCookieTo(null)}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#333] flex justify-between items-center bg-[#252525]">
                    <button className="text-xs text-[#666] hover:text-[#eee] border border-[#444] px-3 py-1.5 rounded">
                        Domains Allowlist
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
