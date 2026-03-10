'use client';

import React, { useState } from 'react';
import { Plus, Download, Terminal, X, Code2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { parseCurlToConfig } from '@/utils/curlUtils';

export const QuickActions = () => {
  const { createDetachedRequest } = useAppStore();
  const [isCurlModalOpen, setIsCurlModalOpen] = useState(false);
  const [curlInput, setCurlInput] = useState('');
  const [error, setError] = useState('');

  const handleNewRequest = () => {
    createDetachedRequest('http');
  };

  const handleImportCurl = (e) => {
    e.preventDefault();
    setError('');

    if (!curlInput.trim().toLowerCase().startsWith('curl')) {
      setError("Invalid format. Command must start with 'curl'");
      return;
    }

    try {
      const config = parseCurlToConfig(curlInput);
      createDetachedRequest('http', config);
      setIsCurlModalOpen(false);
      setCurlInput('');
    } catch {
      setError('Failed to parse cURL command.');
    }
  };

  return (
    <>
      <div className="bg-bg-panel border border-border-subtle rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-bold text-text-primary mb-4">Start Building</h3>
        <div className="space-y-2">
          
          {/* Action 1: New HTTP Request */}
          <button 
            onClick={handleNewRequest}
            type="button"
            className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-white/5 text-left text-sm text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-subtle group"
          >
            <div className="w-8 h-8 rounded bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:scale-105 transition-transform">
              <Plus size={16} />
            </div>
            <div>
              <p className="font-medium text-text-primary">New HTTP Request</p>
              <p className="text-xs text-text-muted mt-0.5">Test an endpoint instantly</p>
            </div>
          </button>

          {/* Action 2: Import cURL */}
          <button 
            onClick={() => setIsCurlModalOpen(true)}
            type="button"
            className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-white/5 text-left text-sm text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-subtle group"
          >
            <div className="w-8 h-8 rounded bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:scale-105 transition-transform">
              <Download size={16} />
            </div>
            <div>
              <p className="font-medium text-text-primary">Import cURL</p>
              <p className="text-xs text-text-muted mt-0.5">Paste raw bash command</p>
            </div>
          </button>

          {/* Action 3: CLI Setup (Placeholder for future) */}
          <button 
            type="button"
            className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-white/5 text-left text-sm text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-subtle group"
          >
            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
              <Terminal size={16} />
            </div>
            <div>
              <p className="font-medium text-text-primary">CLI Setup</p>
              <p className="text-xs text-text-muted mt-0.5">Configure local proxy</p>
            </div>
          </button>

        </div>
      </div>

      {/* CURL IMPORT MODAL */}
      {isCurlModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-panel border border-border-strong rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-subtle bg-bg-base/50 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Code2 size={18} className="text-brand-blue" />
                Import cURL
              </h3>
              <button
                type="button"
                onClick={() => setIsCurlModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-bg-input transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleImportCurl} className="p-6">
              <p className="text-sm text-text-secondary mb-4">
                Paste your cURL command below to instantly generate an HTTP request configuration.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md">
                  {error}
                </div>
              )}

              <textarea 
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                placeholder={`curl -X POST https://api.example.com/v1/data 
  -H 'Authorization: Bearer token' 
  -d '{
    "key": "value"
  }'`}
                className="w-full h-48 bg-[#0d0d0d] border border-border-subtle rounded-lg p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-brand-blue custom-scrollbar resize-none mb-6"
                autoFocus
              />

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCurlModalOpen(false)} 
                  className="px-4 py-2 text-sm font-medium hover:bg-bg-input rounded-lg border border-transparent transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!curlInput.trim()} 
                  className="px-6 py-2 text-sm font-bold bg-brand-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  Import Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};