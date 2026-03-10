'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Download, ArrowRight, ExternalLink, ChevronRight,
} from 'lucide-react';
import { useOS } from '@/hooks/useOS';
import Link from 'next/link';

/* ─────────────────────────────────────────────
   OS BRAND ICONS — Accurate inline SVGs
───────────────────────────────────────────── */
function WindowsIcon({ style, className }) {
  return (
    <svg style={style} className={className} viewBox="0 0 88 88" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 12.4 35.7 7.54l.016 34.42-35.67.203Z" />
      <path d="M35.67 45.93.028 45.7.026 75.48l35.67-4.905Z" />
      <path d="M40 6.907 87.314 0v41.527l-47.318.376Z" />
      <path d="M87.3 46.244V88L40.026 81.11l-.065-34.09Z" />
    </svg>
  );
}

function AppleIcon({ style, className }) {
  return (
    <svg style={style} className={className} viewBox="0 0 814 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.4 0 663.7 0 541.8c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  );
}

function LinuxIcon({ style, className }) {
  // Simplified Tux penguin — recognizable silhouette
  return (
    <svg style={style} className={className} viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="22" rx="18" ry="20" />
      <ellipse cx="50" cy="22" rx="9" ry="12" fill="var(--tw-bg, #050408)" opacity="0.4" />
      <circle cx="44" cy="17" r="2.5" fill="var(--tw-bg, #050408)" opacity="0.6" />
      <circle cx="56" cy="17" r="2.5" fill="var(--tw-bg, #050408)" opacity="0.6" />
      <path d="M44 27 Q50 31 56 27" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M32 42 Q28 30 32 20 Q36 10 50 10 Q64 10 68 20 Q72 30 68 42 Q74 48 74 62 Q74 80 64 86 Q60 90 50 90 Q40 90 36 86 Q26 80 26 62 Q26 48 32 42Z" />
      <ellipse cx="50" cy="72" rx="14" ry="16" opacity="0.18" />
      <path d="M30 82 Q20 88 17 97 L32 97 Q35 90 40 86Z" />
      <path d="M70 82 Q80 88 83 97 L68 97 Q65 90 60 86Z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const DOWNLOAD_LINKS = {
  windows: {
    url: 'https://github.com/23cse311-team11/traceweave-desktop/releases/download/v1.0.0/TraceWeave.Setup.1.0.0.exe',
    label: 'Download for Windows',
    sub: 'Windows 10 / 11 · 64-bit',
    format: '.exe installer',
    size: '82 MB',
    OsIcon: WindowsIcon,
  },
  mac: {
    url: 'https://github.com/23cse311-team11/traceweave-desktop/releases/download/v1.0.0/TraceWeave.dmg',
    label: 'Download for macOS',
    sub: 'macOS 10.15 or later · Universal',
    format: '.dmg package',
    size: '94 MB',
    OsIcon: AppleIcon,
  },
  linux: {
    url: 'https://github.com/23cse311-team11/traceweave-desktop/releases/download/v1.0.0/TraceWeave.AppImage',
    label: 'Download for Linux',
    sub: 'AppImage · x86_64',
    format: '.AppImage',
    size: '88 MB',
    OsIcon: LinuxIcon,
  },
};

/* Capability rows — editorial numbered list with stat callouts */
const CAPABILITIES = [
  {
    number: '01',
    title: 'No CORS Restrictions',
    desc: 'Test local and internal APIs without touching browser security flags or installing extensions. The desktop process makes requests natively — no origin headers, no sandbox.',
    stat: '0',
    statLabel: 'browser workarounds',
    accent: '#10B981',
  },
  {
    number: '02',
    title: 'Native File System Access',
    desc: 'Attach binary payloads, read local TLS certificates, and write large export files directly to disk — no base64 encoding overhead or file-size limits imposed by browser APIs.',
    stat: '∞',
    statLabel: 'file size limit',
    accent: '#3B82F6',
  },
  {
    number: '03',
    title: 'Full Machine Performance',
    desc: "Automated test suites and heavy collection runners use your machine's CPU without browser throttling. Sustained throughput, not capped request budgets.",
    stat: '100%',
    statLabel: 'CPU available',
    accent: '#EAC2FF',
  },
  {
    number: '04',
    title: 'Offline-First Architecture',
    desc: 'Every feature — collection management, request history, environment switching — works with zero internet connectivity. Your workspace is yours, unconditionally.',
    stat: '0',
    statLabel: 'cloud dependency',
    accent: '#F59E0B',
  },
  {
    number: '05',
    title: 'Optimized Electron Runtime',
    desc: 'Carefully pruned dependency tree and lazy module loading keep memory usage low. Cold-start benchmarks consistently land under one second on modern hardware.',
    stat: '<1s',
    statLabel: 'cold start',
    accent: '#A78BFA',
  },
  {
    number: '06',
    title: 'Silent Background Updates',
    desc: 'Delta updates are downloaded and staged while you work. The next launch applies them instantly — no manual downloads, no re-installs, no interruptions.',
    stat: '0',
    statLabel: 'manual reinstalls',
    accent: '#F87171',
  },
];

const REQUIREMENTS = {
  windows: {
    label: 'Windows',
    OsIcon: WindowsIcon,
    reqs: [
      'Windows 10 or Windows 11',
      '64-bit processor (x86_64)',
      '4 GB RAM minimum',
      '200 MB available disk space',
    ],
  },
  mac: {
    label: 'macOS',
    OsIcon: AppleIcon,
    reqs: [
      'macOS 10.15 Catalina or later',
      'Intel or Apple Silicon (Universal)',
      '4 GB RAM minimum',
      '200 MB available disk space',
    ],
  },
  linux: {
    label: 'Linux',
    OsIcon: LinuxIcon,
    reqs: [
      'Ubuntu 18.04+ / Debian 10+ / Fedora 32+',
      'x86_64 architecture',
      '4 GB RAM minimum',
      '200 MB available disk space',
    ],
  },
};

/* ─────────────────────────────────────────────
   APP WINDOW PREVIEW
───────────────────────────────────────────── */
function AppWindowPreview() {
  const sidebarItems = [
    { method: 'GET',    path: '/api/users',      active: true  },
    { method: 'POST',   path: '/api/auth/login', active: false },
    { method: 'PUT',    path: '/api/config',     active: false },
    { method: 'DELETE', path: '/api/item/42',    active: false },
    { method: 'GET',    path: '/api/logs',       active: false },
  ];

  const methodColors = {
    GET:    '#10B981',
    POST:   '#F59E0B',
    PUT:    '#3B82F6',
    DELETE: '#EF4444',
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border border-[rgba(234,194,255,0.1)]"
      style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}
    >
      {/* Title bar */}
      <div
        className="h-9 flex items-center px-4 gap-2 border-b border-[rgba(234,194,255,0.06)]"
        style={{ background: '#0E0C16' }}
      >
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28CA41' }} />
        </div>
        <div className="flex-1 flex justify-center">
          <div
            className="w-44 h-5 rounded flex items-center justify-center border border-[rgba(234,194,255,0.08)]"
            style={{ background: '#14121F' }}
          >
            <span className="text-[9px] font-mono" style={{ color: '#94A3B8' }}>TraceWeave Workspace</span>
          </div>
        </div>
      </div>

      {/* App body */}
      <div className="flex" style={{ height: 340, background: '#09080E' }}>
        {/* Sidebar */}
        <div className="w-48 border-r border-[rgba(234,194,255,0.06)] flex flex-col flex-shrink-0">
          <div className="p-2 border-b border-[rgba(234,194,255,0.06)]">
            <div
              className="h-6 rounded flex items-center px-2 gap-1.5 border border-[rgba(234,194,255,0.08)]"
              style={{ background: '#14121F' }}
            >
              <svg className="w-2.5 h-2.5" style={{ color: '#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2.5" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="text-[9px] font-mono" style={{ color: '#94A3B8' }}>Search requests…</span>
            </div>
          </div>
          <div className="px-3 pt-3 pb-1.5">
            <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>My Collection</span>
          </div>
          <div className="px-1.5 space-y-0.5">
            {sidebarItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-[9px] font-mono"
                style={{
                  background: item.active ? '#14121F' : 'transparent',
                  borderLeft: item.active ? '2px solid #EAC2FF' : '2px solid transparent',
                }}
              >
                <span className="font-black text-[8px] w-9 flex-shrink-0" style={{ color: methodColors[item.method] }}>
                  {item.method}
                </span>
                <span className="truncate" style={{ color: item.active ? '#E2E8F0' : '#94A3B8' }}>
                  {item.path}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-2.5 border-b border-[rgba(234,194,255,0.06)] flex items-center gap-2">
            <span
              className="text-[8px] font-black font-mono px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ color: '#10B981', background: 'rgba(16,185,129,0.12)' }}
            >
              GET
            </span>
            <div
              className="flex-1 h-6 rounded flex items-center px-2 border border-[rgba(234,194,255,0.08)] min-w-0"
              style={{ background: '#14121F' }}
            >
              <span className="text-[9px] font-mono truncate" style={{ color: '#94A3B8' }}>
                http://localhost:3000/api/users
              </span>
            </div>
            <div className="h-6 px-3 rounded flex items-center flex-shrink-0" style={{ background: '#EAC2FF' }}>
              <span className="text-[8px] font-black text-black">Send</span>
            </div>
          </div>

          <div className="flex border-b border-[rgba(234,194,255,0.06)]">
            {['Response', 'Headers', 'Timeline'].map((tab, i) => (
              <div
                key={tab}
                className="px-4 py-2 text-[9px] font-mono"
                style={{
                  color: i === 0 ? '#EAC2FF' : '#94A3B8',
                  borderBottom: i === 0 ? '1px solid #EAC2FF' : '1px solid transparent',
                }}
              >
                {tab}
              </div>
            ))}
            <div className="ml-auto flex items-center px-3 gap-3">
              <span className="text-[9px] font-mono" style={{ color: '#10B981' }}>200 OK</span>
              <span className="text-[9px] font-mono" style={{ color: '#94A3B8' }}>48 ms · 2.1 KB</span>
            </div>
          </div>

          <div className="flex-1 p-3 font-mono text-[9px] leading-relaxed overflow-hidden">
            {[
              ['{', '#EAC2FF'],
              ['  "users": [', '#E2E8F0'],
              ['    {', '#E2E8F0'],
              ['      "id": ', '#E2E8F0', '1', '#F59E0B', ','],
              ['      "name": ', '#E2E8F0', '"Alice Chen"', '#10B981', ','],
              ['      "role": ', '#E2E8F0', '"admin"', '#10B981', ','],
              ['      "active": ', '#E2E8F0', 'true', '#F59E0B'],
              ['    }', '#E2E8F0'],
              ['  ],', '#E2E8F0'],
              ['  "total": ', '#E2E8F0', '128', '#F59E0B'],
              ['}', '#EAC2FF'],
            ].map((line, i) => (
              <div key={i}>
                {line.length === 2
                  ? <span style={{ color: line[1] }}>{line[0]}</span>
                  : line.length === 5
                    ? <><span style={{ color: line[1] }}>{line[0]}</span><span style={{ color: line[3] }}>{line[2]}</span><span style={{ color: line[1] }}>{line[4]}</span></>
                    : <><span style={{ color: line[1] }}>{line[0]}</span><span style={{ color: line[3] }}>{line[2]}</span></>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function DownloadPage() {
  const currentOS = useOS();
  const primaryDownload = DOWNLOAD_LINKS[currentOS];
  const { OsIcon: PrimaryOsIcon } = primaryDownload;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] },
  });

  return (
    <div className="min-h-screen text-[--text-primary] font-sans overflow-x-hidden" style={{ background: '#050408' }}>

      {/* Dot-grid bg */}
      <div
        className="fixed inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(234,194,255,0.065) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top hairline */}
      <div
        className="fixed top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(234,194,255,0.3) 40%, rgba(188,128,241,0.3) 60%, transparent)' }}
      />

      {/* ── NAVBAR ── */}
      <nav
        className="relative z-20 flex items-center justify-between px-8 py-4 max-w-7xl mx-auto border-b"
        style={{ borderColor: 'rgba(234,194,255,0.07)' }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #EAC2FF 0%, #9D5AE5 100%)' }}
          >
            <span className="text-black font-black text-xs">TW</span>
          </div>
          <span className="font-bold text-sm tracking-tight">TraceWeave</span>
        </Link>

        <div className="flex items-center gap-5">
          <span
            className="text-[10px] font-mono px-2.5 py-1 rounded-md border"
            style={{ color: '#94A3B8', borderColor: 'rgba(234,194,255,0.1)', background: '#0E0C16' }}
          >
            v1.0.0
          </span>
          <Link
            href="/"
            className="text-xs font-medium flex items-center gap-1.5 transition-colors"
            style={{ color: '#94A3B8' }}
          >
            Back to App <ArrowRight size={12} />
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8">

        {/* ── HERO ── */}
        <section className="pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.div {...fadeUp(0)}>
              <div
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md border text-[10px] font-mono mb-7"
                style={{ background: '#0E0C16', borderColor: 'rgba(234,194,255,0.12)', color: '#94A3B8' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Desktop Client · Release v1.0.0 · March 2025
              </div>
            </motion.div>

            <motion.h1
              {...fadeUp(0.08)}
              className="text-5xl xl:text-6xl font-black tracking-tight leading-[1.06] mb-6"
            >
              The TraceWeave<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #EAC2FF, #bc80f1)' }}
              >
                Desktop Client.
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.14)}
              className="text-base leading-relaxed mb-10 max-w-md"
              style={{ color: '#E2E8F0' }}
            >
              Bypass CORS limitations, access your local file system natively,
              and run heavyweight workflows at full machine speed — no browser required.
            </motion.p>

            <motion.div {...fadeUp(0.2)} className="flex flex-col gap-3">
              <a
                href={primaryDownload.url}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 w-fit group"
                style={{ background: '#FFFFFF', color: '#000000' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EAC2FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <PrimaryOsIcon style={{ width: 17, height: 17, color: '#000' }} />
                {primaryDownload.label}
                <Download size={15} className="ml-1 opacity-40 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
              </a>
              <p className="text-[11px] font-mono" style={{ color: '#94A3B8' }}>
                {primaryDownload.sub}&nbsp;·&nbsp;{primaryDownload.size}&nbsp;·&nbsp;Free forever
              </p>
              <a
                href="#platforms"
                className="inline-flex items-center gap-1 text-xs transition-colors w-fit"
                style={{ color: '#94A3B8' }}
                onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                All platforms <ChevronRight size={12} />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <AppWindowPreview />
          </motion.div>
        </section>

        {/* ── META BAR ── */}
        <div
          className="border-y py-5 flex items-center justify-between flex-wrap gap-5"
          style={{ borderColor: 'rgba(234,194,255,0.07)' }}
        >
          <div className="flex items-center gap-10 flex-wrap">
            {[
              { label: 'Version',   value: '1.0.0' },
              { label: 'License',   value: 'MIT Open Source' },
              { label: 'Released',  value: 'March 2025' },
              { label: 'Platforms', value: 'Windows · macOS · Linux' },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#94A3B8' }}>
                  {item.label}
                </span>
                <span className="text-xs font-mono" style={{ color: '#E2E8F0' }}>{item.value}</span>
              </div>
            ))}
          </div>

          <a
            href="https://github.com/23cse311-team11/traceweave-desktop"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg border transition-all duration-200"
            style={{ color: '#94A3B8', borderColor: 'rgba(234,194,255,0.1)', background: '#0E0C16' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(234,194,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(234,194,255,0.1)'; }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
            <ExternalLink size={11} />
          </a>
        </div>

        {/* ══════════════════════════════════════════════
            WHY DESKTOP — editorial numbered feature list
        ══════════════════════════════════════════════ */}
        <section className="py-28">
          <div className="mb-16 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: '#EAC2FF' }}>
                Why Desktop
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                Six reasons engineers<br />choose the app over the browser.
              </h2>
            </div>
            <p className="text-sm max-w-xs text-right hidden md:block" style={{ color: '#94A3B8' }}>
              The web client covers most workflows.
              These are the gaps it cannot close.
            </p>
          </div>

          {/* Table header */}
          <div
            className="hidden md:grid grid-cols-12 gap-6 pb-3 mb-1"
            style={{ borderBottom: '1px solid rgba(234,194,255,0.07)' }}
          >
            <span className="col-span-1 text-[9px] font-mono uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>#</span>
            <span className="col-span-4 text-[9px] font-mono uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Feature</span>
            <span className="col-span-5 text-[9px] font-mono uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>Details</span>
            <span className="col-span-2 text-[9px] font-mono uppercase tracking-widest text-right" style={{ color: 'rgba(148,163,184,0.4)' }}>Metric</span>
          </div>

          {/* Rows */}
          <div>
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.number}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="group grid grid-cols-12 gap-6 py-6 cursor-default transition-colors duration-150"
                style={{ borderBottom: '1px solid rgba(234,194,255,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(234,194,255,0.018)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Index */}
                <div className="col-span-1 flex items-start pt-0.5">
                  <span className="font-mono text-[11px]" style={{ color: 'rgba(234,194,255,0.2)' }}>
                    {cap.number}
                  </span>
                </div>

                {/* Title */}
                <div className="col-span-12 md:col-span-4 flex items-start">
                  <h3 className="font-semibold text-sm leading-snug" style={{ color: '#FFFFFF' }}>
                    {cap.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="col-span-12 md:col-span-5 flex items-start -mt-1 md:mt-0">
                  <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                    {cap.desc}
                  </p>
                </div>

                {/* Stat */}
                <div className="col-span-12 md:col-span-2 flex md:justify-end items-start">
                  <div className="md:text-right">
                    <div
                      className="text-xl font-black font-mono tabular-nums leading-none mb-0.5"
                      style={{ color: cap.accent }}
                    >
                      {cap.stat}
                    </div>
                    <div
                      className="text-[9px] font-mono uppercase tracking-wide"
                      style={{ color: 'rgba(148,163,184,0.5)' }}
                    >
                      {cap.statLabel}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── ALL PLATFORMS ── */}
        <section
          id="platforms"
          className="py-24 border-t"
          style={{ borderColor: 'rgba(234,194,255,0.07)' }}
        >
          <div className="mb-14">
            <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: '#EAC2FF' }}>Downloads</p>
            <h2 className="text-3xl font-bold tracking-tight">Available on every major platform.</h2>
          </div>

          <div className="space-y-2">
            {Object.entries(DOWNLOAD_LINKS).map(([osKey, data], i) => {
              const { OsIcon } = data;
              const isCurrent = currentOS === osKey;
              return (
                <motion.a
                  key={osKey}
                  href={data.url}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="flex items-center gap-5 px-6 py-5 rounded-xl border transition-all duration-200 group"
                  style={{
                    background: isCurrent ? 'rgba(234,194,255,0.03)' : 'transparent',
                    borderColor: isCurrent ? 'rgba(234,194,255,0.22)' : 'rgba(234,194,255,0.07)',
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent) {
                      e.currentTarget.style.background = '#0E0C16';
                      e.currentTarget.style.borderColor = 'rgba(234,194,255,0.15)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(234,194,255,0.07)';
                    }
                  }}
                >
                  {/* OS brand icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isCurrent ? 'rgba(234,194,255,0.1)' : '#0E0C16' }}
                  >
                    <OsIcon style={{ width: 22, height: 22, color: isCurrent ? '#EAC2FF' : '#94A3B8' }} />
                  </div>

                  {/* Label + sub */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>
                        {data.label}
                      </span>
                      {isCurrent && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(234,194,255,0.1)', color: '#EAC2FF' }}
                        >
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono" style={{ color: '#94A3B8' }}>{data.sub}</span>
                  </div>

                  {/* Format + size */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-[11px] font-mono" style={{ color: '#94A3B8' }}>{data.format}</div>
                    <div className="text-[11px] font-mono mt-0.5" style={{ color: '#94A3B8' }}>{data.size}</div>
                  </div>

                  {/* Download CTA */}
                  <div className="flex items-center gap-1.5 text-xs font-medium flex-shrink-0" style={{ color: '#94A3B8' }}>
                    <Download size={14} />
                    <span className="hidden sm:inline">Download</span>
                  </div>
                </motion.a>
              );
            })}
          </div>

          <p className="mt-5 text-[11px] font-mono" style={{ color: '#94A3B8' }}>
            Builds are currently unsigned. You may need to allow execution in your OS security settings on first launch.
          </p>
        </section>

        {/* ── SYSTEM REQUIREMENTS ── */}
        <section
          className="py-24 border-t"
          style={{ borderColor: 'rgba(234,194,255,0.07)' }}
        >
          <div className="mb-14">
            <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: '#EAC2FF' }}>Requirements</p>
            <h2 className="text-3xl font-bold tracking-tight">System requirements.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(REQUIREMENTS).map(([os, data]) => {
              const { OsIcon } = data;
              return (
                <motion.div
                  key={os}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="rounded-xl p-6 border"
                  style={{ background: '#0E0C16', borderColor: 'rgba(234,194,255,0.08)' }}
                >
                  <div className="flex items-center gap-2.5 mb-5 pb-4 border-b" style={{ borderColor: 'rgba(234,194,255,0.07)' }}>
                    <OsIcon style={{ width: 15, height: 15, color: '#94A3B8' }} />
                    <span className="font-bold text-sm" style={{ color: '#FFFFFF' }}>{data.label}</span>
                  </div>
                  <ul className="space-y-3">
                    {data.reqs.map(req => (
                      <li key={req} className="flex items-start gap-2.5 text-xs" style={{ color: '#94A3B8' }}>
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {req}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t py-7 mt-8" style={{ borderColor: 'rgba(234,194,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between flex-wrap gap-4">
          <p className="text-[11px] font-mono" style={{ color: '#94A3B8' }}>
            &copy; {new Date().getFullYear()} TraceWeave. Open Source &amp; Built for Engineers.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/23cse311-team11/traceweave-desktop/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono transition-colors"
              style={{ color: '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
            >
              Release Notes
            </a>
            <Link href="/" className="text-[11px] font-mono transition-colors" style={{ color: '#94A3B8' }}>
              Back to Web App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}