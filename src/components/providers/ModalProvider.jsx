'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ModalContext = createContext(null);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

// Internal component to handle the prompt's input state locally
const PromptModalUI = ({ config, onClose }) => {
    const [inputValue, setInputValue] = useState(config.defaultValue || '');

    const handleSubmit = () => {
        if (config.onConfirm) {
            config.onConfirm(inputValue);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-[#1E1E1E] border border-[#333] rounded-md shadow-2xl p-6 w-[350px] font-sans">
                <h3 className="text-sm font-semibold text-[var(--brand-primary)] mb-2">{config.title}</h3>
                <p className="text-xs text-[#ccc] mb-4">{config.message}</p>
                <input 
                    autoFocus
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded text-xs text-[#eee] px-3 py-2 outline-none focus:border-[var(--brand-primary)] mb-5"
                />
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="text-xs text-[#999] hover:text-[#eee] px-3 py-1.5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="bg-[var(--brand-primary)] text-black px-4 py-1.5 rounded text-xs hover:bg-[#bc80f1] transition-colors"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export function ModalProvider({ children }) {
    // --- States ---
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', title: 'Notice' });
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, message: '', title: 'Confirm Action', onConfirm: null });
    const [promptConfig, setPromptConfig] = useState({ isOpen: false, message: '', title: 'Input Required', defaultValue: '', onConfirm: null });

    // --- Actions ---
    const showAlert = useCallback((message, title = 'Notice') => {
        setAlertConfig({ isOpen: true, message, title });
    }, []);

    const showConfirm = useCallback((message, onConfirm, title = 'Confirm Action') => {
        setConfirmConfig({ isOpen: true, message, title, onConfirm });
    }, []);

    const showPrompt = useCallback((message, onConfirm, defaultValue = '', title = 'Input Required') => {
        setPromptConfig({ isOpen: true, message, title, defaultValue, onConfirm });
    }, []);

    // --- Closers ---
    const closeAlert = useCallback(() => setAlertConfig(prev => ({ ...prev, isOpen: false })), []);
    const closeConfirm = useCallback(() => setConfirmConfig(prev => ({ ...prev, isOpen: false })), []);
    const closePrompt = useCallback(() => setPromptConfig(prev => ({ ...prev, isOpen: false })), []);

    const handleConfirmClick = () => {
        if (confirmConfig.onConfirm) confirmConfig.onConfirm();
        closeConfirm();
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
            {children}

            {typeof document !== 'undefined' && createPortal(
                <>
                    {/* Alert Modal */}
                    {alertConfig.isOpen && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="bg-[#1E1E1E] border border-[#333] rounded-md shadow-2xl p-6 w-[350px] font-sans">
                                <h3 className="text-sm font-semibold text-[var(--brand-primary)] mb-2">{alertConfig.title}</h3>
                                <p className="text-xs text-[#ccc] mb-5">{alertConfig.message}</p>
                                <div className="flex justify-end">
                                    <button 
                                        onClick={closeAlert}
                                        className="bg-[var(--brand-primary)] text-black px-4 py-1.5 rounded text-xs hover:bg-[#bc80f1] transition-colors"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirm Modal */}
                    {confirmConfig.isOpen && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="bg-[#1E1E1E] border border-[#333] rounded-md shadow-2xl p-6 w-[350px] font-sans">
                                <h3 className="text-sm font-semibold text-[var(--brand-primary)] mb-2">{confirmConfig.title}</h3>
                                <p className="text-xs text-[#ccc] mb-5">{confirmConfig.message}</p>
                                <div className="flex justify-end gap-3">
                                    <button 
                                        onClick={closeConfirm}
                                        className="text-xs text-[#999] hover:text-[#eee] px-3 py-1.5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleConfirmClick}
                                        className="bg-[var(--brand-primary)] text-black px-4 py-1.5 rounded text-xs hover:bg-[#bc80f1] transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Prompt Modal */}
                    {promptConfig.isOpen && (
                        <PromptModalUI config={promptConfig} onClose={closePrompt} />
                    )}
                </>,
                document.body
            )}
        </ModalContext.Provider>
    );
}
