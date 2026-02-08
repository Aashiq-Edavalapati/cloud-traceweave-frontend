'use client';
import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Send, CheckCircle, AlertTriangle, XCircle, Info, Clock, Database, Network
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Editor from '@monaco-editor/react';
import WaterfallTooltip from './response_panel/WaterfallTooltip';
import BodyToolbar from './response_panel/BodyToolbar';
import TooltipContainer from './response_panel/TooltipContainer';

// --- MAIN COMPONENT ---
export default function ResponsePane({ height }) {
  const { response, isLoading, error } = useAppStore();
  const [activeTab, setActiveTab] = useState('Body');
  const [isWrapped, setIsWrapped] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const editorRef = useRef(null);

  const metrics = useMemo(() => {
    if (!response) return null;
    const total = response.time || 0;

    // Estimate header size
    const headersSize = response.headers ? JSON.stringify(response.headers).length : 0;

    return {
      total: total,
      socket: Math.ceil(total * 0.05),
      dns: Math.ceil(total * 0.10),
      tcp: Math.ceil(total * 0.05),
      ttfb: Math.ceil(total * 0.60),
      download: Math.ceil(total * 0.20),
      size: {
        body: response.size || (response.data ? JSON.stringify(response.data).length : 0),
        headers: headersSize
      },
      network: {
        remote: response.remoteIp || '127.0.0.1:443',
        local: '::1',
        proto: (response.protocol || 'http/1.1').toUpperCase()
      }
    };
  }, [response]);

  // --- TOOLBAR HANDLERS ---
  const handleCopyBody = async () => {
    const bodyText = JSON.stringify(response.data, null, 2);
    await navigator.clipboard.writeText(bodyText);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (editorRef.current && term) {
      editorRef.current.trigger('response-pane', 'actions.find');
    }
  };

  const handleFilter = () => {
    // Filter implementation
    console.log('Filter clicked');
  };

  // --- STATUS BADGE ---
  const renderStatusBadge = () => {
    const status = response.status;
    let color = 'text-green-500';
    let bgColor = 'bg-green-500/10';
    let Icon = CheckCircle;

    if (status >= 400) {
      color = 'text-yellow-500';
      bgColor = 'bg-yellow-500/10';
      Icon = AlertTriangle;
    }
    if (status >= 500) {
      color = 'text-red-500';
      bgColor = 'bg-red-500/10';
      Icon = XCircle;
    }

    return (
      <div className="relative group">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all ${bgColor} border border-transparent ${color === 'text-green-500' ? 'hover:border-green-500/20' : color === 'text-yellow-500' ? 'hover:border-yellow-500/20' : 'hover:border-red-500/20'}`}
        >
          <Icon size={14} className={color} />
          <span className={`font-semibold ${color} text-xs`}>{status} {response.text || 'OK'}</span>
        </motion.div>

        <AnimatePresence>
          <div className="hidden group-hover:block">
            <TooltipContainer width="w-72">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1F1F1F]">
                <Icon size={16} className={color} />
                <span className="font-bold text-sm text-[#EDEDED]">{status} {response.text}</span>
              </div>
              <p className="text-xs text-[#999] leading-relaxed">
                The server has responded successfully. The request was processed without errors.
              </p>
              <div className="mt-3 pt-2 border-t border-[#1F1F1F] text-[10px] text-[#666]">
                Status codes in 2xx range indicate successful requests
              </div>
            </TooltipContainer>
          </div>
        </AnimatePresence>
      </div>
    );
  };

  const TimeBadge = ({ response, metrics }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all bg-[#1A1A1A] hover:bg-[#252525]"
        >
          <Clock size={14} className="text-[#999]" />
          <span className="text-xs font-mono text-[#EDEDED]">{response.time} ms</span>
        </motion.div>

        <AnimatePresence>
          {showTooltip && <WaterfallTooltip metrics={metrics} />}
        </AnimatePresence>
      </div>
    );
  };

  // --- SIZE BADGE ---
  const renderSizeBadge = () => {
    const totalSizeKB = (metrics.size.body + metrics.size.headers) / 1024;

    return (
      <div className="relative group">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all bg-[#1A1A1A] hover:bg-[#252525]"
        >
          <Database size={14} className="text-[#999]" />
          <span className="text-xs font-mono text-[#EDEDED]">{totalSizeKB.toFixed(2)} KB</span>
        </motion.div>

        <AnimatePresence>
          <div className="hidden group-hover:block">
            <TooltipContainer width="w-56">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#1F1F1F]">
                <span className="font-semibold text-xs text-[#EDEDED] tracking-wide">RESPONSE SIZE</span>
                <span className="text-xs font-mono font-bold text-[#FF6C37]">{totalSizeKB.toFixed(2)} KB</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#999]">Headers</span>
                  <span className="font-mono text-[#EDEDED]">{metrics.size.headers} B</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#999]">Body</span>
                  <span className="font-mono text-[#EDEDED]">{(metrics.size.body / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </TooltipContainer>
          </div>
        </AnimatePresence>
      </div>
    );
  };

  // --- NETWORK BADGE ---
  const renderNetworkBadge = () => {
    return (
      <div className="relative group">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-1.5 rounded-md cursor-pointer transition-all bg-[#1A1A1A] hover:bg-[#252525]"
        >
          <Network size={14} className="text-[#999]" />
        </motion.div>

        <AnimatePresence>
          <div className="hidden group-hover:block">
            <TooltipContainer width="w-72">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1F1F1F]">
                <Network size={14} className="text-[#FF6C37]" />
                <span className="font-semibold text-xs text-[#EDEDED] tracking-wide">NETWORK INFO</span>
              </div>
              <div className="space-y-2.5">
                <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                  <span className="text-[#666]">Protocol</span>
                  <span className="text-[#EDEDED] font-mono">{metrics.network.proto.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                  <span className="text-[#666]">Remote</span>
                  <span className="text-[#EDEDED] font-mono text-[10px]">{metrics.network.remote}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                  <span className="text-[#666]">Local</span>
                  <span className="text-[#EDEDED] font-mono">{metrics.network.local}</span>
                </div>
              </div>
            </TooltipContainer>
          </div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div style={{ height }} className="border-t border-[#1A1A1A] bg-[#050505] flex flex-col shrink-0 min-h-[50px]">

      {/* --- HEADER BAR --- */}
      <div className="flex items-center justify-between px-4 bg-[#0A0A0A] border-b border-[#1A1A1A] shrink-0 h-11">
        {/* Tabs */}
        <div className="flex items-center h-full gap-6">
          {['Body', 'Cookies', 'Headers', 'Test Results'].map(tab => {
            const count = tab === 'Headers' ? Object.keys(response?.headers || {}).length
              : tab === 'Cookies' ? Object.keys(response?.cookies || {}).length
                : 0;
            return (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ y: -1 }}
                className={`
                     relative h-full text-xs font-semibold transition-all flex items-center gap-2 tracking-wide
                     ${activeTab === tab
                    ? 'text-[#FF6C37]'
                    : 'text-[#999] hover:text-[#EDEDED]'}
                   `}
              >
                {tab}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeTab === tab ? 'bg-[#FF6C37]/20 text-[#FF6C37]' : 'bg-[#1A1A1A] text-[#666]'
                    }`}>
                    {count}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6C37]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Metrics Badges */}
        {response && !isLoading && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            {renderStatusBadge()}
            <TimeBadge response={response} metrics={metrics} />
            {renderSizeBadge()}
            {renderNetworkBadge()}
          </motion.div>
        )}
      </div>

      {/* Body Toolbar */}
      {activeTab === 'Body' && response && !isLoading && (
        <BodyToolbar
          onWrapToggle={() => setIsWrapped(!isWrapped)}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onCopy={handleCopyBody}
          onCopyLink={handleCopyLink}
          isWrapped={isWrapped}
        />
      )}

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-hidden relative bg-[#050505]">

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/95 z-20 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 flex items-center justify-center"
              >
                <Loader2 className="text-[#FF6C37]" size={36} strokeWidth={2} />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs text-[#999] font-semibold tracking-widest"
              >
                SENDING REQUEST...
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!response && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 h-full flex flex-col items-center justify-center text-[#666] select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ delay: 0.1 }}
            >
              <Send size={72} strokeWidth={0.5} className="mb-6" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium"
            >
              Enter a URL and hit Send to get a response
            </motion.span>
          </motion.div>
        )}

        {/* Error State */}
        <AnimatePresence>
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 h-full flex items-center justify-center p-8"
            >
              <div className="flex flex-col items-center gap-4 max-w-md text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <div>
                  <div className="font-bold text-red-400 mb-1">Request Failed</div>
                  <div className="text-sm text-[#999]">{error}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response Data */}
        <AnimatePresence mode="wait">
          {response && !isLoading && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >

              {/* 1. BODY TAB */}
              {activeTab === 'Body' && (
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  value={JSON.stringify(response.data, null, 2)}
                  theme="vs-dark"
                  onMount={(editor) => { editorRef.current = editor; }}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontFamily: 'Space Mono, JetBrains Mono, monospace',
                    fontLigatures: true,
                    renderLineHighlight: 'none',
                    folding: true,
                    wordWrap: isWrapped ? 'on' : 'off',
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              )}

              {/* 2. COOKIES TAB */}
              {activeTab === 'Cookies' && (
                <div className="h-full overflow-auto custom-scrollbar">
                  {Object.keys(response.cookies || {}).length > 0 ? (
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 bg-[#0A0A0A] z-10 border-b border-[#1A1A1A]">
                        <tr className="text-[#999]">
                          <th className="font-semibold py-3 px-4 text-left">Name</th>
                          <th className="font-semibold py-3 px-4 text-left">Value</th>
                          <th className="font-semibold py-3 px-4 text-left">Domain</th>
                          <th className="font-semibold py-3 px-4 text-left">Path</th>
                          <th className="font-semibold py-3 px-4 text-left">Expires</th>
                          <th className="font-semibold py-3 px-4 text-left">Secure</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(response.cookies || {}).map(([key, rawVal], idx) => {
                          const isObj = typeof rawVal === 'object' && rawVal !== null;
                          const val = isObj ? rawVal.value : rawVal;
                          const domain = isObj ? rawVal.domain : '-';
                          const path = isObj ? rawVal.path : '-';
                          const expires = isObj ? rawVal.expires : '-';
                          const secure = isObj ? rawVal.secure : false;

                          return (
                            <motion.tr
                              key={key}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="border-b border-[#1A1A1A] hover:bg-[#0D0D0D] transition-colors"
                            >
                              <td className="py-3 px-4 font-medium text-[#EDEDED]">{key}</td>
                              <td className="py-3 px-4 text-[#999] font-mono text-[11px] max-w-[300px] truncate" title={String(val)}>{String(val)}</td>
                              <td className="py-3 px-4 text-[#999]">{domain}</td>
                              <td className="py-3 px-4 text-[#999]">{path}</td>
                              <td className="py-3 px-4 text-[#999]">{expires}</td>
                              <td className="py-3 px-4 text-[#999]">
                                {secure ? (
                                  <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px]">Yes</span>
                                ) : (
                                  <span className="px-2 py-1 rounded bg-[#222] text-[#666] text-[10px]">No</span>
                                )}
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#666]">
                      <Info size={40} className="mb-3 opacity-30" />
                      <span className="text-sm">No cookies in this response</span>
                    </div>
                  )}
                </div>
              )}

              {/* 3. HEADERS TAB */}
              {activeTab === 'Headers' && (
                <div className="h-full overflow-auto custom-scrollbar p-6">
                  <div className="max-w-4xl">
                    {Object.entries(response.headers || {}).map(([k, v], idx) => (
                      <motion.div
                        key={k}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="group grid grid-cols-[240px_1fr] gap-6 py-3 border-b border-[#1A1A1A] hover:bg-[#0D0D0D] px-3 -mx-3 rounded transition-colors"
                      >
                        <div className="text-xs font-semibold text-[#EDEDED] font-mono break-all">{k}</div>
                        <div className="text-xs text-[#999] font-mono break-all">{v}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. TEST RESULTS TAB */}
              {activeTab === 'Test Results' && (() => {
                const tests = [
                  { name: 'Status code is 200', passed: response.status === 200 },
                  { name: 'Response time < 2000ms', passed: (response.time || 0) < 2000 },
                  { name: 'Content-Type is application/json', passed: String(response.headers?.['content-type'] || '').includes('application/json') }
                ];
                const allPassed = tests.every(t => t.passed);

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8"
                  >
                    <motion.div
                      key={allPassed ? 'pass' : 'fail'}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${allPassed ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                    >
                      {allPassed ? (
                        <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
                      ) : (
                        <XCircle size={48} className="text-red-500" strokeWidth={1.5} />
                      )}
                    </motion.div>

                    <h3 className="text-[#EDEDED] font-bold text-xl mb-2">{allPassed ? 'All Tests Passed' : 'Some Tests Failed'}</h3>
                    <p className="text-[#999] text-sm max-w-md mb-8">
                      {allPassed ? 'The request completed successfully and passed all checks.' : 'The request completed but some checks failed.'}
                    </p>

                    <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-6 text-left space-y-3">
                      {tests.map((test, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          {test.passed ? (
                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle size={16} className="text-red-500 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${test.passed ? 'text-[#EDEDED]' : 'text-red-400'}`}>{test.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}