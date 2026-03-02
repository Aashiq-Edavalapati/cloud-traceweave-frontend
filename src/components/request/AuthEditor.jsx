'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const AUTH_TYPES = [
    { id: 'noauth', label: 'No Auth' },
    { id: 'bearer', label: 'Bearer Token' },
    { id: 'basic', label: 'Basic Auth' },
    { id: 'apikey', label: 'API Key' },
];

// --- Custom Glassmorphic Dropdown ---
const GlassSelect = ({ value, options, onChange, width = "w-48" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className={`relative ${width}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs text-text-primary bg-bg-panel/40 backdrop-blur-md border border-border-subtle/50 rounded shadow-sm hover:bg-bg-panel/60 transition-all focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
            >
                <span>{selectedOption?.label}</span>
                <ChevronDown size={14} className={`text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 w-full mt-1 overflow-hidden bg-bg-base/70 backdrop-blur-xl border border-border-subtle/50 rounded shadow-xl animate-in fade-in slide-in-from-top-1">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-white/5 ${
                                value === option.value ? 'text-brand-primary bg-brand-primary/10' : 'text-text-primary'
                            }`}
                        >
                            <span>{option.label}</span>
                            {value === option.value && <Check size={12} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default function AuthEditor() {
    const store = useAppStore();
    const activeId = store.activeTabId;
    const req = store.requestStates[activeId];
    
    if (!req) return null;
    
    // Ensure auth object exists
    const authState = req.config?.auth || { type: 'noauth' };

    const updateAuthType = (type) => {
        store.updateActiveRequestDeep(['config', 'auth', 'type'], type);
    };

    const updateAuthField = (type, field, value) => {
        store.updateActiveRequestDeep(['config', 'auth', type, field], value);
    };

    return (
        <div className="flex flex-col h-full bg-bg-base overflow-auto custom-scrollbar">
            {/* Content Area */}
            <div className="flex-1 p-6 max-w-2xl">
                
                {/* --- NEW: Glassmorphic Auth Type Dropdown --- */}
                <div className="mb-6 flex items-center gap-4 border-b border-border-subtle pb-6 relative z-20">
                    <label className="text-xs font-semibold text-text-primary whitespace-nowrap">
                        Auth Type
                    </label>
                    <GlassSelect 
                        value={authState.type}
                        onChange={updateAuthType}
                        options={AUTH_TYPES.map(t => ({ value: t.id, label: t.label }))}
                    />
                </div>

                <div className="text-xs text-text-muted mb-6">
                    Authorization header will be automatically generated when you send the request.
                    You can use Environment Variables using {'{{variable_name}}'} syntax.
                </div>

                {authState.type === 'noauth' && (
                    <div className="text-sm text-text-secondary italic">
                        This request does not use any authorization.
                    </div>
                )}

                {authState.type === 'bearer' && (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1 relative z-10">
                            <label className="text-xs font-semibold text-text-primary">Token</label>
                            <input
                                type="text"
                                className="bg-bg-input/50 backdrop-blur-sm border border-border-subtle/50 rounded px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary font-mono transition-colors"
                                placeholder="Enter Bearer Token..."
                                value={authState.bearer?.token || ''}
                                onChange={(e) => updateAuthField('bearer', 'token', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {authState.type === 'basic' && (
                    <div className="space-y-4 relative z-10">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-text-primary">Username</label>
                            <input
                                type="text"
                                className="bg-bg-input/50 backdrop-blur-sm border border-border-subtle/50 rounded px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary font-mono transition-colors"
                                placeholder="Username"
                                value={authState.basic?.username || ''}
                                onChange={(e) => updateAuthField('basic', 'username', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-text-primary">Password</label>
                            <input
                                type="password"
                                className="bg-bg-input/50 backdrop-blur-sm border border-border-subtle/50 rounded px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary font-mono transition-colors"
                                placeholder="Password"
                                value={authState.basic?.password || ''}
                                onChange={(e) => updateAuthField('basic', 'password', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {authState.type === 'apikey' && (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-text-primary">Key</label>
                            <input
                                type="text"
                                className="bg-bg-input/50 backdrop-blur-sm border border-border-subtle/50 rounded px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary font-mono transition-colors"
                                placeholder="x-api-key"
                                value={authState.apikey?.key || ''}
                                onChange={(e) => updateAuthField('apikey', 'key', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-text-primary">Value</label>
                            <input
                                type="text"
                                className="bg-bg-input/50 backdrop-blur-sm border border-border-subtle/50 rounded px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary font-mono transition-colors"
                                placeholder="Value"
                                value={authState.apikey?.value || ''}
                                onChange={(e) => updateAuthField('apikey', 'value', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1 relative z-10">
                            <label className="text-xs font-semibold text-text-primary mb-1">Add to</label>
                            <GlassSelect 
                                value={authState.apikey?.in || 'header'}
                                onChange={(val) => updateAuthField('apikey', 'in', val)}
                                options={[
                                    { value: 'header', label: 'Header' },
                                    { value: 'query', label: 'Query Params' }
                                ]}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
