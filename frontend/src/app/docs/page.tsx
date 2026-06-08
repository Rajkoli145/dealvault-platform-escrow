'use client';

import Image from 'next/image';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div dangerouslySetInnerHTML={{ __html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DealVault Docs — Documentation</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #fafaf9;
  --surface: #ffffff;
  --border: #e8e8e4;
  --border2: #d0d0cc;
  --text: #0f0f0e;
  --muted: #6b6b67;
  --muted2: #a8a8a4;
  --accent: #0f0f0e;
  --code-bg: #f4f4f2;
  --serif: 'Instrument Serif', Georgia, serif;
  --display: 'Syne', sans-serif;
  --mono: 'DM Mono', 'Courier New', monospace;
  --sidebar-w: 260px;
  --header-h: 56px;
  --content-max: 680px;
}

html { scroll-behavior: smooth; }
body {
  font-family: var(--display);
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  line-height: 1.7;
}

/* ── TOP BAR ── */
.topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: var(--header-h);
  background: rgba(250,250,249,0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center;
  padding: 0 24px; gap: 20px;
}
.topbar-logo {
  display: flex; align-items: center; gap: 9px;
  font-family: var(--display); font-size: 14px; font-weight: 800;
  letter-spacing: -0.2px; text-decoration: none; color: var(--text);
}
.topbar-logo-box {
  width: 26px; height: 26px; background: var(--text);
  border-radius: 6px; display: flex; align-items: center;
  justify-content: center; color: #fff; font-size: 11px; font-weight: 800;
}
.topbar-divider { width: 1px; height: 20px; background: var(--border2); }
.topbar-title { font-size: 13px; font-weight: 600; color: var(--muted); }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.topbar-version {
  font-family: var(--mono); font-size: 11px; padding: 3px 9px;
  border: 1px solid var(--border2); border-radius: 20px; color: var(--muted);
}
.topbar-github {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: var(--muted);
  text-decoration: none; padding: 6px 12px;
  border: 1px solid var(--border2); border-radius: 8px;
  transition: all 0.15s;
}
.topbar-github:hover { background: var(--surface); color: var(--text); border-color: var(--border2); }

/* ── LAYOUT ── */
.layout {
  display: flex;
  padding-top: var(--header-h);
  min-height: 100vh;
}

/* ── SIDEBAR ── */
.sidebar {
  width: var(--sidebar-w);
  position: fixed;
  top: var(--header-h); left: 0; bottom: 0;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  background: var(--bg);
  padding: 28px 0 60px;
}
.sidebar::-webkit-scrollbar { width: 3px; }
.sidebar::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

.sidebar-search {
  padding: 0 16px 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}
.search-box {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border: 1px solid var(--border);
  border-radius: 8px; background: var(--surface);
  transition: border-color 0.15s;
}
.search-box:focus-within { border-color: var(--border2); }
.search-box input {
  border: none; background: none; outline: none;
  font-family: var(--display); font-size: 13px;
  color: var(--text); width: 100%;
}
.search-box input::placeholder { color: var(--muted2); }
.search-icon { color: var(--muted2); font-size: 12px; flex-shrink: 0; }

.nav-group { margin-bottom: 4px; padding: 0 12px; }
.nav-group-label {
  font-family: var(--mono); font-size: 9px; font-weight: 500;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--muted2); padding: 10px 6px 6px;
  display: block;
}
.nav-link {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: 7px;
  font-size: 13px; font-weight: 500; color: var(--muted);
  text-decoration: none; cursor: pointer;
  transition: all 0.12s; border: none; background: none;
  width: 100%; text-align: left; line-height: 1.3;
}
.nav-link:hover { background: var(--surface); color: var(--text); }
.nav-link.active {
  background: var(--text); color: #fff; font-weight: 600;
}
.nav-link-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--border2); flex-shrink: 0; transition: background 0.15s;
}
.nav-link.active .nav-link-dot { background: rgba(255,255,255,0.5); }

/* ── MAIN CONTENT ── */
.content {
  margin-left: var(--sidebar-w);
  flex: 1;
  padding: 60px 80px 120px;
  max-width: calc(var(--sidebar-w) + var(--content-max) + 160px);
}

/* ── SECTIONS ── */
.doc-section {
  padding-top: 72px; margin-top: -20px;
  padding-bottom: 56px;
  border-bottom: 1px solid var(--border);
}
.doc-section:last-child { border-bottom: none; }

/* SECTION HEADER */
.section-eyebrow {
  font-family: var(--mono); font-size: 10px; font-weight: 500;
  letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--muted2); margin-bottom: 12px;
  display: flex; align-items: center; gap: 10px;
}
.section-eyebrow::after {
  content: ''; flex: 1; max-width: 40px; height: 1px; background: var(--border2);
}
.section-title {
  font-family: var(--serif);
  font-size: clamp(28px, 3.5vw, 40px);
  font-weight: 400; line-height: 1.1;
  letter-spacing: -0.5px; margin-bottom: 16px;
  color: var(--text);
}
.section-title em { font-style: italic; color: var(--muted); }
.section-lead {
  font-size: 16px; color: var(--muted); line-height: 1.7;
  margin-bottom: 32px; max-width: 580px;
  font-family: var(--display); font-weight: 400;
}

/* PROSE */
.prose h3 {
  font-family: var(--display); font-size: 16px; font-weight: 700;
  letter-spacing: -0.2px; margin: 28px 0 10px;
  color: var(--text);
}
.prose p {
  font-size: 15px; color: var(--muted); line-height: 1.75;
  margin-bottom: 16px;
}
.prose p strong { color: var(--text); font-weight: 700; }
.prose ul, .prose ol {
  padding-left: 0; list-style: none;
  display: flex; flex-direction: column; gap: 8px;
  margin-bottom: 20px;
}
.prose ul li, .prose ol li {
  font-size: 14px; color: var(--muted); line-height: 1.6;
  display: flex; gap: 10px; align-items: flex-start;
}
.prose ul li::before {
  content: '—'; color: var(--muted2); flex-shrink: 0;
  font-family: var(--mono); font-size: 13px; margin-top: 2px;
}
.prose ol { counter-reset: list; }
.prose ol li::before {
  counter-increment: list; content: counter(list, decimal-leading-zero);
  font-family: var(--mono); font-size: 11px; color: var(--muted2);
  flex-shrink: 0; margin-top: 3px; font-weight: 500;
}

/* CODE */
code {
  font-family: var(--mono); font-size: 13px;
  background: var(--code-bg); border: 1px solid var(--border);
  border-radius: 4px; padding: 2px 6px; color: var(--text);
}
.code-block {
  background: var(--text); border-radius: 12px;
  overflow: hidden; margin: 20px 0;
}
.code-block-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-bottom: 1px solid rgba(255,255,255,0.08);
}
.code-lang {
  font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px;
  text-transform: uppercase; color: rgba(255,255,255,0.4);
}
.code-dots { display: flex; gap: 5px; }
.code-dot { width: 9px; height: 9px; border-radius: 50%; opacity: 0.4; }
.code-block pre {
  padding: 20px 18px; font-family: var(--mono);
  font-size: 13px; line-height: 1.7; overflow-x: auto;
  color: rgba(255,255,255,0.85);
}
.code-block pre::-webkit-scrollbar { height: 3px; }
.code-block pre::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
.kw { color: #7dd3fc; }
.fn { color: #86efac; }
.str { color: #fde68a; }
.cm { color: rgba(255,255,255,0.3); font-style: italic; }
.tp { color: #f9a8d4; }
.nm { color: #fdba74; }

/* CALLOUT BOXES */
.callout {
  border-radius: 10px; padding: 16px 18px;
  margin: 20px 0; display: flex; gap: 12px;
  border: 1px solid;
}
.callout-tip { background: #f0fdf4; border-color: #bbf7d0; }
.callout-info { background: #eff6ff; border-color: #bfdbfe; }
.callout-warn { background: #fffbeb; border-color: #fde68a; }
.callout-critical { background: #fef2f2; border-color: #fecaca; }
.callout-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.callout-body {}
.callout-label {
  font-family: var(--mono); font-size: 10px; font-weight: 500;
  letter-spacing: 1.5px; text-transform: uppercase;
  margin-bottom: 4px;
}
.callout-tip .callout-label { color: #15803d; }
.callout-info .callout-label { color: #1d4ed8; }
.callout-warn .callout-label { color: #b45309; }
.callout-critical .callout-label { color: #b91c1c; }
.callout-text { font-size: 13px; line-height: 1.6; color: var(--muted); }
.callout-tip .callout-text { color: #166534; }
.callout-info .callout-text { color: #1e40af; }
.callout-warn .callout-text { color: #92400e; }
.callout-critical .callout-text { color: #991b1b; }

/* TABLE */
.doc-table {
  width: 100%; border-collapse: collapse;
  margin: 20px 0; font-size: 13px;
}
.doc-table th {
  font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--muted2);
  text-align: left; padding: 10px 14px;
  border-bottom: 2px solid var(--border);
}
.doc-table td {
  padding: 12px 14px; border-bottom: 1px solid var(--border);
  color: var(--muted); vertical-align: top; line-height: 1.5;
}
.doc-table tr:last-child td { border-bottom: none; }
.doc-table tr:hover td { background: var(--bg); }
.td-key { color: var(--text); font-family: var(--mono); font-size: 12px; font-weight: 500; }
.td-green { color: #16a34a; font-weight: 700; font-family: var(--mono); font-size: 12px; }
.td-red { color: #dc2626; font-weight: 700; font-family: var(--mono); font-size: 12px; }

/* FLOW STEPS */
.flow-steps { display: flex; flex-direction: column; gap: 0; margin: 24px 0; }
.flow-step { display: flex; gap: 16px; }
.flow-step-left {
  display: flex; flex-direction: column; align-items: center; width: 32px; flex-shrink: 0;
}
.flow-num {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 12px; font-weight: 500;
  background: var(--text); color: #fff; flex-shrink: 0;
}
.flow-line { width: 1px; flex: 1; min-height: 16px; background: var(--border2); margin: 4px 0; }
.flow-step-right { padding: 4px 0 24px; }
.flow-step-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.flow-step-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
.flow-tag {
  display: inline-block; font-family: var(--mono); font-size: 10px;
  padding: 2px 8px; border-radius: 4px; margin-top: 6px;
  background: var(--code-bg); color: var(--muted); border: 1px solid var(--border);
}

/* STATE CHIPS */
.states-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
.state-chip {
  font-family: var(--mono); font-size: 11px; font-weight: 500;
  padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border);
}
.s-created { background: #f8f8f7; color: var(--muted); }
.s-funded { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.s-progress { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.s-submitted { background: #faf5ff; color: #7c3aed; border-color: #ddd6fe; }
.s-released { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.s-disputed { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

/* DIVIDER */
.doc-divider { height: 1px; background: var(--border); margin: 32px 0; }

/* SCROLL PROGRESS */
.scroll-progress {
  position: fixed; top: var(--header-h); left: 0; right: 0; z-index: 99;
  height: 2px; background: var(--border);
}
.scroll-progress-fill {
  height: 100%; background: var(--text);
  transition: width 0.1s linear; width: 0%;
}

/* MOBILE */
@media (max-width: 900px) {
  .sidebar { display: none; }
  .content { margin-left: 0; padding: 40px 24px 80px; }
}
</style>
</head>
<body>

<!-- SCROLL PROGRESS -->
<div class="scroll-progress">
  <div class="scroll-progress-fill" id="progress"></div>
</div>

<!-- TOP BAR -->
<header class="topbar">
  <a class="topbar-logo" href="/" style="display: flex; align-items: center; gap: 9px;">
    <img src="/images/DbLogo.png" alt="DealVault" style="height: 26px; width: auto;" />
    <span style="font-family: var(--display); font-size: 14px; font-weight: 800; letter-spacing: -0.2px; color: var(--text);">DealVault</span>
  </a>
  <div class="topbar-divider"></div>
  <span class="topbar-title">Documentation</span>
  <div class="topbar-right">
    <span class="topbar-version">v1.0</span>
    <a class="topbar-github" href="https://github.com/DealVaultHQ/dealvault-platform-escrow" target="_blank" rel="noopener noreferrer">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
      GitHub
    </a>
  </div>
</header>

<div class="layout">

<!-- ── SIDEBAR ── -->
<aside class="sidebar" id="sidebar">
  <div class="sidebar-search">
    <div class="search-box">
      <span class="search-icon">⌕</span>
      <input type="text" placeholder="Search docs..." oninput="searchDocs(this.value)"/>
    </div>
  </div>

  <div class="nav-group">
    <span class="nav-group-label">Getting Started</span>
    <a class="nav-link active" href="#introduction" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Introduction
    </a>
    <a class="nav-link" href="#overview" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Platform Overview
    </a>
    <a class="nav-link" href="#quickstart" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Quick Start
    </a>
  </div>

  <div class="nav-group">
    <span class="nav-group-label">Core Concepts</span>
    <a class="nav-link" href="#escrow" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Escrow System
    </a>
    <a class="nav-link" href="#stellar" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Stellar & Soroban
    </a>
    <a class="nav-link" href="#usdc" onclick="setActive(this)">
      <span class="nav-link-dot"></span> USDC Payments
    </a>
    <a class="nav-link" href="#deal-states" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Deal Lifecycle
    </a>
  </div>

  <div class="nav-group">
    <span class="nav-group-label">User Roles</span>
    <a class="nav-link" href="#contributor" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Contributor
    </a>
    <a class="nav-link" href="#maintainer" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Maintainer
    </a>
    <a class="nav-link" href="#admin" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Admin
    </a>
  </div>

  <div class="nav-group">
    <span class="nav-group-label">Features</span>
    <a class="nav-link" href="#kyc" onclick="setActive(this)">
      <span class="nav-link-dot"></span> KYC Verification
    </a>
    <a class="nav-link" href="#campaigns" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Campaigns
    </a>
    <a class="nav-link" href="#disputes" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Dispute Resolution
    </a>
    <a class="nav-link" href="#leaderboard" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Leaderboard
    </a>
    <a class="nav-link" href="#financials" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Financials
    </a>
  </div>

  <div class="nav-group">
    <span class="nav-group-label">Smart Contracts</span>
    <a class="nav-link" href="#contract-overview" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Contract Overview
    </a>
    <a class="nav-link" href="#contract-functions" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Core Functions
    </a>
    <a class="nav-link" href="#deploy" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Deployment
    </a>
  </div>

  <div class="nav-group">
    <span class="nav-group-label">Technical</span>
    <a class="nav-link" href="#architecture" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Architecture
    </a>
    <a class="nav-link" href="#tech-stack" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Tech Stack
    </a>
    <a class="nav-link" href="#fee-structure" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Fee Structure
    </a>
    <a class="nav-link" href="#security" onclick="setActive(this)">
      <span class="nav-link-dot"></span> Security
    </a>
  </div>
</aside>

<!-- ── CONTENT ── -->
<main class="content">

  <!-- ═══ INTRODUCTION ═══ -->
  <div class="doc-section" id="introduction">
    <div class="section-eyebrow">Getting Started</div>
    <h1 class="section-title">Welcome to <em>DealVault</em></h1>
    <p class="section-lead">DealVault is a trustless escrow platform built on Stellar and Soroban. It eliminates payment uncertainty in open source bounties, freelance contracts, and digital service agreements — globally.</p>

    <div class="prose">
      <p>Every deal on DealVault follows one simple rule: <strong>funds are locked before work begins, and released only when conditions are met.</strong> No trust required. No intermediary. Just code.</p>

      <p>This documentation covers everything — from how the escrow system works, to how contributors earn USDC, to how the Soroban smart contracts are deployed and function.</p>

      <div class="callout callout-tip">
        <div class="callout-icon">💡</div>
        <div class="callout-body">
          <div class="callout-label">New here?</div>
          <div class="callout-text">Start with Platform Overview to understand the full system, then move to your role — Contributor or Maintainer.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ OVERVIEW ═══ -->
  <div class="doc-section" id="overview">
    <div class="section-eyebrow">Getting Started</div>
    <h2 class="section-title">Platform <em>Overview</em></h2>
    <p class="section-lead">DealVault connects three types of participants around a single trustless escrow contract.</p>

    <div class="prose">
      <h3>The Core Problem</h3>
      <p>Online work has always had a trust problem. Contributors fear they won't get paid. Maintainers fear they won't get the work. DealVault removes both fears by making payment guaranteed before work starts.</p>

      <h3>How It Solves It</h3>
      <div class="flow-steps">
        <div class="flow-step">
          <div class="flow-step-left"><div class="flow-num">01</div><div class="flow-line"></div></div>
          <div class="flow-step-right">
            <div class="flow-step-title">Maintainer creates a funded issue</div>
            <div class="flow-step-desc">They deposit USDC into a Soroban escrow contract. Funds are locked on the Stellar blockchain — verifiable by anyone.</div>
            <span class="flow-tag">USDC locked on-chain</span>
          </div>
        </div>
        <div class="flow-step">
          <div class="flow-step-left"><div class="flow-num">02</div><div class="flow-line"></div></div>
          <div class="flow-step-right">
            <div class="flow-step-title">Contributor sees verified funding</div>
            <div class="flow-step-desc">Not a promise. Not "we'll pay you later." The money is provably there, in escrow, before they apply.</div>
            <span class="flow-tag">Trustless verification</span>
          </div>
        </div>
        <div class="flow-step">
          <div class="flow-step-left"><div class="flow-num">03</div><div class="flow-line"></div></div>
          <div class="flow-step-right">
            <div class="flow-step-title">Work is completed and submitted</div>
            <div class="flow-step-desc">Contributor delivers the work. Maintainer reviews. All communication happens on-platform.</div>
            <span class="flow-tag">Transparent review</span>
          </div>
        </div>
        <div class="flow-step">
          <div class="flow-step-left"><div class="flow-num">04</div></div>
          <div class="flow-step-right" style="padding-bottom:0;">
            <div class="flow-step-title">Smart contract releases payment</div>
            <div class="flow-step-desc">Maintainer approves → Soroban contract automatically splits: 98% to contributor, 2% platform fee. Instant. No manual step.</div>
            <span class="flow-tag">Auto-settlement</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ QUICK START ═══ -->
  <div class="doc-section" id="quickstart">
    <div class="section-eyebrow">Getting Started</div>
    <h2 class="section-title">Quick <em>Start</em></h2>
    <p class="section-lead">Get up and running on DealVault in under 5 minutes.</p>
    <div class="prose">
      <h3>Step 1 — Sign in with GitHub</h3>
      <p>Visit DealVault and click <strong>Get Started</strong>. Authenticate with your GitHub account. Your profile, repositories, and avatar are pulled automatically.</p>

      <h3>Step 2 — Choose your role</h3>
      <p>Select <strong>Contributor</strong> if you want to earn USDC by completing issues. Select <strong>Maintainer</strong> if you want to fund issues and attract contributors to your project. You can switch roles at any time from your profile.</p>

      <h3>Step 3 — Complete KYC & connect wallet</h3>
      <p>Before applying or creating issues, you must verify your identity (KYC) and connect a Stellar wallet — Freighter, Lobstr, or xBull. This takes about 2 minutes.</p>

      <div class="callout callout-info">
        <div class="callout-icon">ℹ️</div>
        <div class="callout-body">
          <div class="callout-label">Wallet requirement</div>
          <div class="callout-text">All payments are made in USDC on the Stellar network. You need a Stellar wallet address (starting with G...) to receive or send payments.</div>
        </div>
      </div>

      <h3>Step 4 — Start earning or funding</h3>
      <p>Contributors browse <strong>Explore Issues</strong> to find funded bounties. Maintainers submit their repo for review, then create funded issues once approved.</p>
    </div>
  </div>

  <!-- ═══ ESCROW ═══ -->
  <div class="doc-section" id="escrow">
    <div class="section-eyebrow">Core Concepts</div>
    <h2 class="section-title">Escrow <em>System</em></h2>
    <p class="section-lead">DealVault's escrow is powered entirely by Soroban smart contracts. No bank. No payment gateway. No intermediary.</p>
    <div class="prose">
      <h3>What is escrow?</h3>
      <p>Escrow is a financial arrangement where a third party holds funds until a transaction is complete. In DealVault, the "third party" is a <strong>Soroban smart contract</strong> — code running on the Stellar blockchain that no one controls except the rules written into it.</p>

      <h3>How funds are held</h3>
      <p>When a maintainer funds an issue, USDC is transferred from their Stellar wallet into the escrow contract address. The contract holds the funds trustlessly. Neither the maintainer, contributor, nor DealVault can access the funds unilaterally.</p>

      <div class="code-block">
        <div class="code-block-header">
          <div class="code-dots">
            <div class="code-dot" style="background:#ff5f57;"></div>
            <div class="code-dot" style="background:#febc2e;"></div>
            <div class="code-dot" style="background:#28c840;"></div>
          </div>
          <div class="code-lang">Rust · Soroban</div>
        </div>
        <pre><span class="cm">// Maintainer calls this to lock funds</span>
<span class="kw">pub fn</span> <span class="fn">fund_escrow</span>(
    env: <span class="tp">Env</span>,
    deal_id: <span class="tp">Symbol</span>,
    maintainer: <span class="tp">Address</span>,
    contributor: <span class="tp">Address</span>,
    usdc_token: <span class="tp">Address</span>,
    amount: <span class="tp">i128</span>,
) {
    maintainer.<span class="fn">require_auth</span>();
    token::<span class="tp">Client</span>::<span class="fn">new</span>(&env, &usdc_token)
        .<span class="fn">transfer</span>(&maintainer, &env.<span class="fn">current_contract_address</span>(), &amount);
    <span class="cm">// Store deal on-chain</span>
    env.storage().instance().<span class="fn">set</span>(&deal_id, &(contributor, amount, usdc_token));
}</pre>
      </div>

      <h3>When funds are released</h3>
      <p>Funds are released in exactly three scenarios:</p>
      <ul>
        <li>Maintainer <strong>approves</strong> submitted work → funds go to contributor (minus 2% fee)</li>
        <li>Admin rules in favour of contributor during a dispute → same outcome</li>
        <li>Admin rules in favour of maintainer during a dispute → full refund to maintainer</li>
      </ul>
    </div>
  </div>

  <!-- ═══ STELLAR ═══ -->
  <div class="doc-section" id="stellar">
    <div class="section-eyebrow">Core Concepts</div>
    <h2 class="section-title">Stellar <em>& Soroban</em></h2>
    <p class="section-lead">DealVault is built on Stellar because it provides fast, cheap, and globally accessible payments — and Soroban brings programmable smart contracts to the network.</p>
    <div class="prose">
      <h3>What is Stellar?</h3>
      <p>Stellar is an open-source, decentralized blockchain network designed for fast and cheap cross-border payments. Transactions settle in 3–5 seconds and cost less than <strong>$0.000003</strong>.</p>

      <h3>What is Soroban?</h3>
      <p>Soroban is Stellar's smart contract platform. It uses Rust-based WebAssembly contracts that are deployed on-chain and execute deterministically. DealVault's escrow logic lives entirely in a Soroban contract.</p>

      <table class="doc-table">
        <thead><tr><th>Property</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td class="td-key">Transaction speed</td><td>3–5 seconds</td></tr>
          <tr><td class="td-key">Transaction fee</td><td>~0.00001 XLM (fractions of a cent)</td></tr>
          <tr><td class="td-key">Smart contract language</td><td>Rust → WebAssembly</td></tr>
          <tr><td class="td-key">Asset support</td><td>XLM, USDC, any Stellar asset</td></tr>
          <tr><td class="td-key">Global accessibility</td><td>180+ countries</td></tr>
          <tr><td class="td-key">Custodial?</td><td class="td-green">No — non-custodial</td></tr>
        </tbody>
      </table>

      <div class="callout callout-info">
        <div class="callout-icon">⬡</div>
        <div class="callout-body">
          <div class="callout-label">Stellar does not fund DealVault deals</div>
          <div class="callout-text">Stellar is the network (the road). Maintainers provide their own USDC. Stellar just transports and secures it. Think of it like the internet for money.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ USDC ═══ -->
  <div class="doc-section" id="usdc">
    <div class="section-eyebrow">Core Concepts</div>
    <h2 class="section-title">USDC <em>Payments</em></h2>
    <p class="section-lead">DealVault uses USDC — not XLM — as the primary escrow currency. Here's why.</p>
    <div class="prose">
      <h3>Why USDC and not XLM?</h3>
      <p>XLM is Stellar's native token, but its value fluctuates with the market. A bounty worth <strong>100 XLM today might be worth $30 tomorrow</strong>. Contributors can't plan their income around volatile rewards.</p>
      <p>USDC is a stablecoin pegged 1:1 to the US Dollar. <strong>100 USDC is always approximately $100</strong> — regardless of crypto market conditions. This makes DealVault rewards predictable and professional.</p>

      <table class="doc-table">
        <thead><tr><th></th><th>XLM</th><th>USDC</th></tr></thead>
        <tbody>
          <tr><td class="td-key">Value stability</td><td class="td-red">Volatile</td><td class="td-green">Stable (~$1)</td></tr>
          <tr><td class="td-key">Predictable rewards</td><td class="td-red">No</td><td class="td-green">Yes</td></tr>
          <tr><td class="td-key">Professional use</td><td class="td-red">Limited</td><td class="td-green">Yes</td></tr>
          <tr><td class="td-key">Supported on Stellar</td><td class="td-green">Yes</td><td class="td-green">Yes</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ═══ DEAL STATES ═══ -->
  <div class="doc-section" id="deal-states">
    <div class="section-eyebrow">Core Concepts</div>
    <h2 class="section-title">Deal <em>Lifecycle</em></h2>
    <p class="section-lead">Every deal on DealVault moves through a defined set of states. Understanding these states is essential to both contributors and maintainers.</p>
    <div class="prose">
      <div class="states-row">
        <span class="state-chip s-created">CREATED</span>
        <span class="state-chip s-funded">FUNDED</span>
        <span class="state-chip s-progress">IN_PROGRESS</span>
        <span class="state-chip s-submitted">SUBMITTED</span>
        <span class="state-chip s-released">RELEASED</span>
        <span class="state-chip s-disputed">DISPUTED</span>
      </div>

      <table class="doc-table">
        <thead><tr><th>State</th><th>Description</th><th>Who triggers it</th></tr></thead>
        <tbody>
          <tr><td class="td-key">CREATED</td><td>Issue created, not yet funded</td><td>Maintainer</td></tr>
          <tr><td class="td-key">FUNDED</td><td>USDC locked in Soroban escrow. Issue is live and visible to contributors.</td><td>Maintainer (wallet tx)</td></tr>
          <tr><td class="td-key">IN_PROGRESS</td><td>Contributor assigned and working</td><td>Maintainer selects applicant</td></tr>
          <tr><td class="td-key">SUBMITTED</td><td>Contributor has delivered work, awaiting maintainer review</td><td>Contributor</td></tr>
          <tr><td class="td-key">RELEASED</td><td>Maintainer approved. USDC auto-released by contract. Deal complete.</td><td>Contract (on approval)</td></tr>
          <tr><td class="td-key">DISPUTED</td><td>Either party raised a dispute. Admin mediates. Funds still locked.</td><td>Either party</td></tr>
        </tbody>
      </table>

      <div class="callout callout-warn">
        <div class="callout-icon">⚠️</div>
        <div class="callout-body">
          <div class="callout-label">Irreversible once released</div>
          <div class="callout-text">Once a deal reaches RELEASED state, the transaction on Stellar is final and cannot be reversed. Always review submitted work carefully before approving.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ CONTRIBUTOR ═══ -->
  <div class="doc-section" id="contributor">
    <div class="section-eyebrow">User Roles</div>
    <h2 class="section-title">Contributor <em>Guide</em></h2>
    <p class="section-lead">Contributors discover funded issues, complete work, and earn USDC — with payment guaranteed on-chain before they start.</p>
    <div class="prose">
      <h3>Getting started as a Contributor</h3>
      <ol>
        <li>Sign in with GitHub</li>
        <li>Select <strong>Contributor</strong> role</li>
        <li>Complete KYC verification</li>
        <li>Connect your Stellar wallet (Freighter / Lobstr / xBull)</li>
        <li>Browse funded issues on Explore Issues</li>
        <li>Apply to issues that match your skills</li>
      </ol>

      <h3>Applying to an issue</h3>
      <p>Every issue on DealVault shows a <strong>✓ FUNDED</strong> badge — meaning the reward is already locked in escrow. Click <strong>Apply</strong>, and your application is sent to the maintainer.</p>

      <div class="callout callout-tip">
        <div class="callout-icon">✓</div>
        <div class="callout-body">
          <div class="callout-label">Profile completeness matters</div>
          <div class="callout-text">Maintainers choose contributors based on reputation score, completed bounties, and skills. Keep your profile updated to improve your chances.</div>
        </div>
      </div>

      <h3>Submitting work</h3>
      <p>Once assigned, complete the work and submit via the DealVault platform. Include a link to your pull request, repository, or deliverable. The maintainer will review and approve or request revisions.</p>

      <h3>Getting paid</h3>
      <p>When the maintainer approves, the Soroban contract automatically releases <strong>98% of the escrow amount</strong> to your connected Stellar wallet. The remaining 2% is the DealVault platform fee. Settlement takes 3–5 seconds.</p>
    </div>
  </div>

  <!-- ═══ MAINTAINER ═══ -->
  <div class="doc-section" id="maintainer">
    <div class="section-eyebrow">User Roles</div>
    <h2 class="section-title">Maintainer <em>Guide</em></h2>
    <p class="section-lead">Maintainers submit their repositories for review, create funded issues, and attract verified contributors to their open source projects.</p>
    <div class="prose">
      <h3>Getting started as a Maintainer</h3>
      <ol>
        <li>Sign in with GitHub</li>
        <li>Select <strong>Maintainer</strong> role</li>
        <li>Submit your repository for review</li>
        <li>Wait for DealVault team approval (24–48 hours)</li>
        <li>Create funded issues once approved</li>
      </ol>

      <h3>Submitting your repository</h3>
      <p>Every maintainer must submit their GitHub repo for review before creating issues. The DealVault team evaluates whether the project is active, has suitable open issues, and benefits the broader ecosystem.</p>

      <h3>Funding types</h3>
      <table class="doc-table">
        <thead><tr><th>Type</th><th>Description</th><th>USDC Required?</th></tr></thead>
        <tbody>
          <tr><td class="td-key">Self-Funded</td><td>You deposit USDC into escrow. Contributors earn real rewards.</td><td class="td-green">Yes</td></tr>
          <tr><td class="td-key">Free / Network</td><td>No money required. Build visibility and attract contributors to your project. No escrow involved.</td><td class="td-green">No</td></tr>
        </tbody>
      </table>

      <h3>Reviewing applicants</h3>
      <p>Once an issue is live, contributors can apply. You can view each applicant's profile, reputation score, completed bounties, and skills. Select the best fit and they'll be notified immediately.</p>

      <h3>Approving work</h3>
      <p>When a contributor submits work, review it carefully. If satisfied, click <strong>Approve & Release</strong>. The smart contract automatically releases funds to the contributor's Stellar wallet. If you need revisions, request them through the platform. If there's a serious disagreement, raise a dispute.</p>

      <div class="callout callout-critical">
        <div class="callout-icon">⚠️</div>
        <div class="callout-body">
          <div class="callout-label">Approval is final</div>
          <div class="callout-text">Once you approve a submission, the USDC transfer on Stellar is irreversible. Always review deliverables thoroughly before clicking Approve.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ ADMIN ═══ -->
  <div class="doc-section" id="admin">
    <div class="section-eyebrow">User Roles</div>
    <h2 class="section-title">Admin <em>Role</em></h2>
    <p class="section-lead">Admins maintain platform integrity through repo approvals, dispute resolution, and user oversight.</p>
    <div class="prose">
      <h3>Admin responsibilities</h3>
      <ul>
        <li>Review and approve or reject maintainer repo submissions</li>
        <li>Mediate disputes between contributors and maintainers</li>
        <li>Monitor all on-chain transactions via audit logs</li>
        <li>Manage KYC verification edge cases</li>
        <li>Enforce platform terms and community standards</li>
      </ul>
      <h3>Dispute resolution</h3>
      <p>When a dispute is raised, the admin reviews evidence submitted by both parties. Based on the review, the admin can either <strong>release funds to the contributor</strong> or <strong>refund to the maintainer</strong>. All dispute actions are recorded on-chain for full transparency.</p>
    </div>
  </div>

  <!-- ═══ KYC ═══ -->
  <div class="doc-section" id="kyc">
    <div class="section-eyebrow">Features</div>
    <h2 class="section-title">KYC <em>Verification</em></h2>
    <p class="section-lead">All users must complete KYC before participating in funded deals. This protects the platform from fraud and builds a trusted community.</p>
    <div class="prose">
      <h3>What KYC involves</h3>
      <ol>
        <li><strong>Personal information</strong> — name, email, date of birth, country (pre-filled from GitHub)</li>
        <li><strong>Government ID</strong> — passport, driver's licence, or national ID upload</li>
        <li><strong>Stellar wallet connection</strong> — connect Freighter, Lobstr, or xBull</li>
      </ol>
      <h3>Why we require KYC</h3>
      <ul>
        <li>Prevents fake accounts and Sybil attacks</li>
        <li>Ensures contributors and maintainers are real, accountable people</li>
        <li>Builds trust for higher-value bounties</li>
        <li>Required for regulatory compliance with cross-border payments</li>
      </ul>
      <div class="callout callout-tip">
        <div class="callout-icon">🔒</div>
        <div class="callout-body">
          <div class="callout-label">Data security</div>
          <div class="callout-text">KYC data is encrypted and stored securely. It is never shared with third parties or other platform users.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ CAMPAIGNS ═══ -->
  <div class="doc-section" id="campaigns">
    <div class="section-eyebrow">Features</div>
    <h2 class="section-title">Campaigns</h2>
    <p class="section-lead">Campaigns allow DealVault to pool funding — from grants or sponsors — and distribute it across multiple maintainer repos as bounty rewards.</p>
    <div class="prose">
      <h3>How campaigns work</h3>
      <p>A campaign has a total USDC budget, a start and end date, and a set of approved repositories. Each approved repo gets a budget cap. Each issue within that repo gets a reward based on its label priority.</p>

      <table class="doc-table">
        <thead><tr><th>Label</th><th>Priority</th><th>Example Reward</th></tr></thead>
        <tbody>
          <tr><td class="td-key">critical / bug</td><td>High</td><td>$20–$50 USDC</td></tr>
          <tr><td class="td-key">feature</td><td>Medium</td><td>$10–$20 USDC</td></tr>
          <tr><td class="td-key">documentation</td><td>Low</td><td>$5 USDC</td></tr>
          <tr><td class="td-key">good first issue</td><td>Entry</td><td>$2–$5 USDC</td></tr>
        </tbody>
      </table>

      <h3>Anti-fraud protection</h3>
      <p>Each repo has a <strong>hard budget cap</strong> set by the admin. Maintainers cannot assign inflated rewards to specific people. Every payment is on-chain and publicly auditable. This makes the system transparent and tamper-proof.</p>
    </div>
  </div>

  <!-- ═══ DISPUTES ═══ -->
  <div class="doc-section" id="disputes">
    <div class="section-eyebrow">Features</div>
    <h2 class="section-title">Dispute <em>Resolution</em></h2>
    <p class="section-lead">When contributor and maintainer cannot agree, DealVault provides a structured dispute resolution process. Funds remain locked until the admin makes a final decision.</p>
    <div class="prose">
      <h3>When to raise a dispute</h3>
      <ul>
        <li>Maintainer refuses to approve legitimately completed work</li>
        <li>Contributor submitted work that doesn't match the requirements</li>
        <li>Either party believes the other acted in bad faith</li>
      </ul>
      <h3>The process</h3>
      <div class="flow-steps">
        <div class="flow-step">
          <div class="flow-step-left"><div class="flow-num">01</div><div class="flow-line"></div></div>
          <div class="flow-step-right"><div class="flow-step-title">Dispute raised</div><div class="flow-step-desc">Either party clicks "Raise Dispute" on the deal. Funds remain locked in escrow.</div></div>
        </div>
        <div class="flow-step">
          <div class="flow-step-left"><div class="flow-num">02</div><div class="flow-line"></div></div>
          <div class="flow-step-right"><div class="flow-step-title">Evidence submitted</div><div class="flow-step-desc">Both parties upload evidence — screenshots, PR links, messages, deliverables.</div></div>
        </div>
        <div class="flow-step">
          <div class="flow-step-left"><div class="flow-num">03</div><div class="flow-line"></div></div>
          <div class="flow-step-right"><div class="flow-step-title">Admin reviews</div><div class="flow-step-desc">DealVault admin evaluates both sides impartially. Typically resolved within 48 hours.</div></div>
        </div>
        <div class="flow-step">
          <div class="flow-step-left"><div class="flow-num">04</div></div>
          <div class="flow-step-right" style="padding-bottom:0;"><div class="flow-step-title">Final ruling</div><div class="flow-step-desc">Admin calls either <code>release_funds</code> or <code>refund_maintainer</code> on the contract. On-chain. Final. Logged.</div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ LEADERBOARD ═══ -->
  <div class="doc-section" id="leaderboard">
    <div class="section-eyebrow">Features</div>
    <h2 class="section-title">Leaderboard</h2>
    <p class="section-lead">The leaderboard ranks contributors by points earned through completed bounties, creating healthy competition and recognising top contributors.</p>
    <div class="prose">
      <h3>How points work</h3>
      <table class="doc-table">
        <thead><tr><th>Issue type</th><th>Points</th><th>Typical reward</th></tr></thead>
        <tbody>
          <tr><td class="td-key">Critical bug</td><td>50 pts</td><td>$20–$50 USDC</td></tr>
          <tr><td class="td-key">Feature</td><td>20 pts</td><td>$10–$20 USDC</td></tr>
          <tr><td class="td-key">Documentation</td><td>5 pts</td><td>$5 USDC</td></tr>
          <tr><td class="td-key">Good first issue</td><td>2 pts</td><td>$2–$5 USDC</td></tr>
        </tbody>
      </table>
      <p>The leaderboard resets per campaign period. Top contributors gain reputation, visibility, and priority placement in future applications.</p>
    </div>
  </div>

  <!-- ═══ FINANCIALS ═══ -->
  <div class="doc-section" id="financials">
    <div class="section-eyebrow">Features</div>
    <h2 class="section-title">Financials</h2>
    <p class="section-lead">The Financials tab shows a full transaction history of every USDC payment you've sent or received on DealVault.</p>
    <div class="prose">
      <h3>What you'll find here</h3>
      <ul>
        <li>All completed deal payouts with Stellar transaction hashes</li>
        <li>Current USDC balance locked in active escrows</li>
        <li>Platform fees deducted per deal</li>
        <li>Links to view each transaction on Stellar Explorer</li>
      </ul>
      <p>Every transaction on DealVault is publicly verifiable on the Stellar blockchain. The transaction hash is always provided so you can independently verify any payment.</p>
    </div>
  </div>

  <!-- ═══ CONTRACT OVERVIEW ═══ -->
  <div class="doc-section" id="contract-overview">
    <div class="section-eyebrow">Smart Contracts</div>
    <h2 class="section-title">Contract <em>Overview</em></h2>
    <p class="section-lead">The DealVault Soroban escrow contract is the trustless core of the platform. Written in Rust, deployed on Stellar.</p>
    <div class="prose">
      <p>The contract is responsible for three things: <strong>locking funds, releasing funds, and refunding funds.</strong> No other logic. No complexity. Just three states, enforced by code.</p>
      <p>The contract is non-upgradeable after deployment. The rules cannot be changed by DealVault, maintainers, or contributors. This is the basis of trustlessness.</p>
      <div class="callout callout-tip">
        <div class="callout-icon">🔍</div>
        <div class="callout-body">
          <div class="callout-label">Open source</div>
          <div class="callout-text">The full contract source code is publicly available on GitHub. Anyone can audit, fork, or verify the logic independently.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ CONTRACT FUNCTIONS ═══ -->
  <div class="doc-section" id="contract-functions">
    <div class="section-eyebrow">Smart Contracts</div>
    <h2 class="section-title">Core <em>Functions</em></h2>
    <p class="section-lead">Four functions. That's all the escrow contract needs.</p>
    <div class="prose">
      <table class="doc-table">
        <thead><tr><th>Function</th><th>Who calls it</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td class="td-key">fund_escrow</td><td>Maintainer</td><td>Locks USDC into the contract for a specific deal ID</td></tr>
          <tr><td class="td-key">release_funds</td><td>Maintainer (on approval)</td><td>Sends 98% to contributor, 2% to DealVault wallet</td></tr>
          <tr><td class="td-key">refund_maintainer</td><td>Admin only</td><td>Returns full amount to maintainer (dispute ruling)</td></tr>
          <tr><td class="td-key">raise_dispute</td><td>Either party</td><td>Flags the deal for admin review. Funds remain locked.</td></tr>
        </tbody>
      </table>

      <div class="code-block">
        <div class="code-block-header">
          <div class="code-dots">
            <div class="code-dot" style="background:#ff5f57;"></div>
            <div class="code-dot" style="background:#febc2e;"></div>
            <div class="code-dot" style="background:#28c840;"></div>
          </div>
          <div class="code-lang">Rust · release_funds</div>
        </div>
        <pre><span class="kw">pub fn</span> <span class="fn">release_funds</span>(
    env: <span class="tp">Env</span>,
    deal_id: <span class="tp">Symbol</span>,
    maintainer: <span class="tp">Address</span>,
    platform_wallet: <span class="tp">Address</span>,
) {
    maintainer.<span class="fn">require_auth</span>();
    <span class="kw">let</span> (contributor, amount, usdc_token):
        (<span class="tp">Address</span>, <span class="tp">i128</span>, <span class="tp">Address</span>) =
        env.storage().instance().<span class="fn">get</span>(&deal_id).unwrap();

    <span class="kw">let</span> fee    = amount * <span class="nm">2</span> / <span class="nm">100</span>;   <span class="cm">// 2% platform fee</span>
    <span class="kw">let</span> payout = amount - fee;        <span class="cm">// 98% to contributor</span>

    <span class="kw">let</span> client = token::<span class="tp">Client</span>::<span class="fn">new</span>(&env, &usdc_token);
    client.<span class="fn">transfer</span>(&env.<span class="fn">current_contract_address</span>(), &contributor, &payout);
    client.<span class="fn">transfer</span>(&env.<span class="fn">current_contract_address</span>(), &platform_wallet, &fee);
}</pre>
      </div>
    </div>
  </div>

  <!-- ═══ DEPLOY ═══ -->
  <div class="doc-section" id="deploy">
    <div class="section-eyebrow">Smart Contracts</div>
    <h2 class="section-title">Deployment</h2>
    <p class="section-lead">Deploy the DealVault escrow contract to Stellar Testnet or Mainnet using the Stellar CLI.</p>
    <div class="prose">
      <div class="code-block">
        <div class="code-block-header">
          <div class="code-dots">
            <div class="code-dot" style="background:#ff5f57;"></div>
            <div class="code-dot" style="background:#febc2e;"></div>
            <div class="code-dot" style="background:#28c840;"></div>
          </div>
          <div class="code-lang">Terminal</div>
        </div>
        <pre><span class="cm"># 1. Install Stellar CLI</span>
cargo install stellar-cli

<span class="cm"># 2. Generate funded testnet identity</span>
stellar keys generate alice --network testnet --fund

<span class="cm"># 3. Build the contract</span>
stellar contract build

<span class="cm"># 4. Deploy to Testnet</span>
stellar contract deploy \
  --wasm target/wasm32v1-none/release/escrow.wasm \
  --source-account alice \
  --network testnet \
  --alias dealvault_escrow

<span class="cm"># Returns contract ID starting with C...</span>
<span class="cm"># 5. Deploy to Mainnet (when ready)</span>
stellar contract deploy \
  --wasm target/wasm32v1-none/release/escrow.wasm \
  --source-account YOUR_MAINNET_KEY \
  --network mainnet</pre>
      </div>
    </div>
  </div>

  <!-- ═══ ARCHITECTURE ═══ -->
  <div class="doc-section" id="architecture">
    <div class="section-eyebrow">Technical</div>
    <h2 class="section-title">Architecture</h2>
    <p class="section-lead">DealVault is a three-layer system: a web frontend, a Node.js backend, and a Soroban smart contract on Stellar.</p>
    <div class="prose">
      <div class="code-block">
        <div class="code-block-header">
          <div class="code-dots">
            <div class="code-dot" style="background:#ff5f57;"></div>
            <div class="code-dot" style="background:#febc2e;"></div>
            <div class="code-dot" style="background:#28c840;"></div>
          </div>
          <div class="code-lang">Architecture</div>
        </div>
        <pre>┌─────────────────────────────────────┐
│  Frontend  (React + TypeScript)     │
│  Freighter wallet integration       │
│  Deployed on Vercel                 │
└──────────────┬──────────────────────┘
               │ REST API
┌──────────────▼──────────────────────┐
│  Backend  (Node.js + Express)       │
│  Deal metadata · Users · Notifs     │
│  MongoDB · Socket.io · JWT          │
│  Deployed on Render                 │
└──────────────┬──────────────────────┘
               │ Stellar SDK
┌──────────────▼──────────────────────┐
│  Soroban Smart Contract  (Rust)     │
│  fund_escrow · release · refund     │
│  Stellar Mainnet / Testnet          │
└─────────────────────────────────────┘</pre>
      </div>

      <p>The backend <strong>never touches money</strong>. It only manages metadata (deal info, user profiles, notifications) and calls the Soroban contract when needed. All financial logic is in the contract.</p>
    </div>
  </div>

  <!-- ═══ TECH STACK ═══ -->
  <div class="doc-section" id="tech-stack">
    <div class="section-eyebrow">Technical</div>
    <h2 class="section-title">Tech <em>Stack</em></h2>
    <p class="section-lead">Every tool in the DealVault system and why it was chosen.</p>
    <div class="prose">
      <table class="doc-table">
        <thead><tr><th>Layer</th><th>Technology</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td class="td-key">Smart Contract</td><td>Soroban (Rust)</td><td>Escrow logic — fund, release, refund</td></tr>
          <tr><td class="td-key">Blockchain</td><td>Stellar</td><td>Transaction settlement</td></tr>
          <tr><td class="td-key">Asset</td><td>USDC on Stellar</td><td>Stable escrow currency</td></tr>
          <tr><td class="td-key">Wallet</td><td>Freighter / Lobstr / xBull</td><td>User signs transactions</td></tr>
          <tr><td class="td-key">Frontend</td><td>React + TypeScript + Vite</td><td>User interface</td></tr>
          <tr><td class="td-key">Styling</td><td>Tailwind CSS</td><td>Component styling</td></tr>
          <tr><td class="td-key">Backend</td><td>Node.js + Express</td><td>API + business logic</td></tr>
          <tr><td class="td-key">Database</td><td>MongoDB</td><td>Users, deals, logs</td></tr>
          <tr><td class="td-key">Auth</td><td>GitHub OAuth + JWT</td><td>Authentication</td></tr>
          <tr><td class="td-key">Realtime</td><td>Socket.io</td><td>Live notifications</td></tr>
          <tr><td class="td-key">Hosting FE</td><td>Vercel</td><td>Frontend deployment</td></tr>
          <tr><td class="td-key">Hosting BE</td><td>Render</td><td>Backend deployment</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ═══ FEE STRUCTURE ═══ -->
  <div class="doc-section" id="fee-structure">
    <div class="section-eyebrow">Technical</div>
    <h2 class="section-title">Fee <em>Structure</em></h2>
    <p class="section-lead">DealVault charges a flat 2% platform fee on every successfully completed deal. No subscription fees. No setup costs. Pay only when work is done.</p>
    <div class="prose">
      <div class="code-block">
        <div class="code-block-header">
          <div class="code-dots">
            <div class="code-dot" style="background:#ff5f57;"></div>
            <div class="code-dot" style="background:#febc2e;"></div>
            <div class="code-dot" style="background:#28c840;"></div>
          </div>
          <div class="code-lang">Fee Calculation</div>
        </div>
        <pre>Deal amount:          100.00 USDC
Platform fee (2%):      2.00 USDC  →  DealVault
Contributor receives:  98.00 USDC  →  Contributor wallet
Stellar gas:        ~0.000003 USD  →  Network only
</pre>
      </div>
      <p>The fee split is enforced <strong>inside the Soroban contract</strong> — it happens automatically on approval. DealVault cannot charge more than 2% and cannot take funds without approval.</p>
    </div>
  </div>

  <!-- ═══ SECURITY ═══ -->
  <div class="doc-section" id="security">
    <div class="section-eyebrow">Technical</div>
    <h2 class="section-title">Security</h2>
    <p class="section-lead">DealVault is built security-first, from smart contract design to KYC to audit logging.</p>
    <div class="prose">
      <h3>Smart contract security</h3>
      <ul>
        <li>All functions use <code>require_auth()</code> — only authorised parties can call critical functions</li>
        <li>Funds cannot be accessed by DealVault unilaterally</li>
        <li>Contract is open source and auditable by anyone</li>
        <li>Deployed as immutable — rules cannot be changed post-deployment</li>
      </ul>
      <h3>Platform security</h3>
      <ul>
        <li>KYC verification for all participants — real identity behind every account</li>
        <li>JWT authentication with short expiry + refresh tokens</li>
        <li>All user data encrypted at rest and in transit</li>
        <li>Every action logged in a tamper-evident audit log</li>
        <li>GitHub OAuth — no passwords stored</li>
      </ul>
      <div class="callout callout-info">
        <div class="callout-icon">🛡️</div>
        <div class="callout-body">
          <div class="callout-label">Report a vulnerability</div>
          <div class="callout-text">If you discover a security vulnerability in DealVault, please report it responsibly via GitHub Issues or contact the team directly. Do not disclose publicly until patched.</div>
        </div>
      </div>
    </div>
  </div>

</main>
</div><!-- end layout -->

<script>
// ── SCROLL PROGRESS ──
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (window.scrollY / total) * 100;
  document.getElementById('progress').style.width = pct + '%';
  updateActiveNav();
});

// ── ACTIVE NAV ON SCROLL ──
function updateActiveNav() {
  const sections = document.querySelectorAll('.doc-section');
  const links = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  links.forEach(l => {
    l.classList.remove('active');
    if (l.getAttribute('href') === '#' + current) l.classList.add('active');
  });
}

function setActive(el) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
}

// ── SEARCH ──
function searchDocs(q) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(l => {
    const text = l.textContent.toLowerCase();
    l.style.display = (!q || text.includes(q.toLowerCase())) ? '' : 'none';
  });
}
</script>
</body>
</html>
` }} />
    </div>
  );
}
