/* ==========================================================================
   PINCHFIN — demo.js
   Interactive Workflow Demo — Split-Panel Streaming Visualization
   Streams 15 underwriting phases with a sidebar pipeline tracker,
   document chips, and character-by-character streaming analysis.
   Simulates a live Vulari analysis in real time.
   Version: 2.0.0
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Configuration
     -------------------------------------------------------------------------- */
  const CONFIG = {
    charDelay: 6,             // ms per character when streaming text
    dataPointDelay: 140,      // ms pause between data points
    phaseCompleteDelay: 120,  // ms pause after a phase completes
    phaseEnterDelay: 80,      // ms pause when entering a new phase
    docChipDelay: 300,        // ms stagger for document chip appearance
    scrollBehavior: 'smooth',
    scrollOffset: 100,
    sidebarWidth: 280         // px — left pipeline sidebar
  };

  /* --------------------------------------------------------------------------
     Document Chips — appear as processing progresses
     -------------------------------------------------------------------------- */
  const DOC_CHIPS = [
    { label: 'Deal Record',        phase: 2  },
    { label: 'Sponsor Analysis',   phase: 3  },
    { label: 'Market Analysis',    phase: 4  },
    { label: 'Comp Analysis',      phase: 5  },
    { label: 'Rent Roll',          phase: 6  },
    { label: 'Revenue UW',         phase: 7  },
    { label: 'T12 Expense',        phase: 8  },
    { label: 'Cash Flow UW',       phase: 9  },
    { label: 'Sizing Model',       phase: 10 },
    { label: 'IC Memo',            phase: 12 },
    { label: 'QA Report',          phase: 13 },
    { label: 'Stress Report',      phase: 14 },
    { label: 'IC Package',         phase: 15 }
  ];

  /* --------------------------------------------------------------------------
     Demo Phase Data — Hardcoded contextual data points for each phase
     -------------------------------------------------------------------------- */
  const DEMO_PHASES = [
    {
      number: 1, name: 'Data Infrastructure',
      dataPoints: [
        'Parsing 4 source documents...',
        'Rent roll extracted \u2014 247 units identified',
        'T12 validated \u2014 12 periods, $4.2M gross revenue',
        'OM intelligence mapped \u2014 23 key data points captured'
      ]
    },
    {
      number: 2, name: 'Deal Book Assembly',
      dataPoints: [
        'Deal Book initialized \u2014 VUL-2026-047',
        '23 data tables populated from source documents',
        'Source document index created \u2014 4 files cataloged',
        'Field mapping verified \u2014 102 tables, 0 unmapped fields'
      ]
    },
    {
      number: 3, name: 'Sponsor & Entity Analysis',
      dataPoints: [
        'Entity: Meridian Residential Partners, LLC',
        'Sponsor experience: 12 years, 3,200 units across 14 assets',
        'Net worth: Sufficient \u2014 exceeds loan amount requirement',
        'Liquidity: 18 months post-close debt service verified',
        'Litigation search: Clear \u2014 no material proceedings'
      ]
    },
    {
      number: 4, name: 'Market Intelligence',
      dataPoints: [
        'MSA: South Florida \u2014 Fort Lauderdale-Pompano Beach-Deerfield Beach',
        'Population growth: +1.8% YoY (above national average)',
        'Market vacancy: 5.2% (tightening trend)',
        '12-month absorption: Positive \u2014 2,400 units absorbed',
        'Rent growth: +3.4% trailing twelve months'
      ]
    },
    {
      number: 5, name: 'Comparable Analysis',
      dataPoints: [
        'Sales comps identified: 6 within 3-mile radius',
        'Average cap rate: 5.35% (range: 4.95% \u2014 5.80%)',
        'Average $/unit: $215,000 (range: $195K \u2014 $242K)',
        'Distance-weighted reliability score: 87/100',
        'Rent comps: 8 properties, avg effective rent $1,465/unit'
      ]
    },
    {
      number: 6, name: 'Rent Roll Analysis',
      dataPoints: [
        'Units parsed: 247 (studio: 12, 1BR: 98, 2BR: 112, 3BR: 25)',
        'Average in-place rent: $1,425/unit',
        'Occupancy: 94.3% (233 of 247 units occupied)',
        'Concessions: 2.1% of gross potential rent',
        'Lease expiration concentration: No single month > 12%'
      ]
    },
    {
      number: 7, name: 'Revenue Underwriting',
      dataPoints: [
        'Lender UW rent derived: $1,392/unit (conservative to in-place)',
        'Loss-to-lease adjustment: -2.3%',
        'Economic vacancy: 7.0% (market + credit loss)',
        'Other income: $847/unit/year (parking, laundry, fees)',
        'Effective Gross Income: $4,847,000'
      ]
    },
    {
      number: 8, name: 'Expense Normalization',
      dataPoints: [
        'Total OpEx/unit: $5,840 (T12 normalized)',
        'T12 expense trend: +3.2% year-over-year',
        'Management fee: 3.5% of EGI',
        'Reserves: $300/unit/year',
        'Insurance trending: +8.2% (Florida wind exposure flagged)'
      ]
    },
    {
      number: 9, name: 'Cash Flow Underwriting & Valuation',
      dataPoints: [
        'Net Operating Income: $2,847,000',
        { text: 'DSCR: 1.28x', type: 'positive' },
        'Capitalization rate: 5.45%',
        'As-Stabilized value: $52,200,000',
        '10-year DCF value: $51,800,000 (5.75% terminal cap)'
      ]
    },
    {
      number: 10, name: 'Loan Sizing & Deal Structuring',
      dataPoints: [
        'Maximum loan \u2014 LTV constraint: $39,150,000',
        'Maximum loan \u2014 DSCR constraint: $34,500,000 \u2190 BINDING',
        'Maximum loan \u2014 DY constraint: $40,671,000',
        'Maximum loan \u2014 LTC constraint: $38,400,000',
        'Recommended: $34,500,000 | LTV: 66.1% | DY: 8.25%'
      ]
    },
    {
      number: 11, name: 'Capital Markets',
      dataPoints: [
        'Exit strategy: Agency permanent take-out (Year 3)',
        'CLO eligibility: Confirmed \u2014 meets all criteria',
        'Spread estimate: SOFR + 285 bps',
        'Comparable executions: 4 recent trades identified',
        'Secondary market depth: Sufficient liquidity'
      ]
    },
    {
      number: 12, name: 'Credit Memorandum & IC Package',
      dataPoints: [
        'Credit memorandum: Generated \u2014 45 pages',
        'Risk rating: 3 (Acceptable)',
        'Recommendation: Approve with standard conditions',
        'Key conditions: Rate lock, insurance confirmation, Phase I clearance'
      ]
    },
    {
      number: 13, name: 'Quality Assurance & Verification',
      dataPoints: [
        'Arithmetic verification: All calculations confirmed',
        'Source citation audit: 47 citations verified against source docs',
        { text: 'Discrepancies found: 0', type: 'positive' },
        'Cross-reference check: All metrics consistent across sections'
      ]
    },
    {
      number: 14, name: 'Sensitivity & Stress Analysis',
      dataPoints: [
        { text: 'Stress DSCR at +200bps: 1.05x', type: 'negative' },
        'Breakeven occupancy: 82.1%',
        'NOI decline tolerance: -18.4% before covenant breach',
        'Cap rate sensitivity: +50bps \u2192 value decline of $4.3M'
      ]
    },
    {
      number: 15, name: 'Final Deliverables & Distribution',
      dataPoints: [
        'IC package: Assembled \u2014 8 documents, 195+ pages',
        'Term sheet: Generated with standard conditions',
        'Executive summary: 2-page overview complete',
        'Distribution: Ready for Investment Committee review'
      ]
    }
  ];

  /* --------------------------------------------------------------------------
     Segment boundaries (for visual grouping in sidebar)
     -------------------------------------------------------------------------- */
  const SEGMENTS = [
    { label: 'Foundation',  start: 1,  end: 4  },
    { label: 'Analysis',    start: 5,  end: 8  },
    { label: 'Synthesis',   start: 9,  end: 10 },
    { label: 'Capital',     start: 11, end: 11 },
    { label: 'Decision',    start: 12, end: 15 }
  ];

  /* --------------------------------------------------------------------------
     State
     -------------------------------------------------------------------------- */
  let demoContainer = null;
  let startBtn = null;
  let introEl = null;
  let demoPhasesEl = null;
  let demoSummaryEl = null;
  let splitPanel = null;
  let sidebarSteps = [];
  let streamArea = null;
  let docChipBar = null;
  let progressBar = null;
  let progressFill = null;
  let progressLabel = null;
  let isRunning = false;
  let abortController = null;
  let startTime = 0;

  /* --------------------------------------------------------------------------
     Initialization
     -------------------------------------------------------------------------- */
  function init() {
    demoContainer = document.querySelector('.workflow-demo, [data-workflow-demo]');
    if (!demoContainer) return;

    startBtn = demoContainer.querySelector('.demo-start, [data-demo-start]');
    introEl = demoContainer.querySelector('.demo-intro');
    demoPhasesEl = demoContainer.querySelector('#demo-phases');
    demoSummaryEl = demoContainer.querySelector('#demo-summary');

    if (!startBtn) return;

    startBtn.addEventListener('click', function () {
      if (!isRunning) {
        launchDemo();
      }
    });
  }

  /* --------------------------------------------------------------------------
     Inject All Required Styles
     -------------------------------------------------------------------------- */
  function injectStyles() {
    if (document.getElementById('demo-v2-styles')) return;

    var style = document.createElement('style');
    style.id = 'demo-v2-styles';
    style.textContent = [

      /* --- Keyframes --- */
      '@keyframes demoCursorBlink {',
      '  0%, 100% { opacity: 1; }',
      '  50% { opacity: 0; }',
      '}',

      '@keyframes demoPulse {',
      '  0%, 100% { box-shadow: 0 0 0 0 rgba(184, 90, 48, 0.4); }',
      '  50% { box-shadow: 0 0 0 6px rgba(184, 90, 48, 0); }',
      '}',

      '@keyframes demoFadeIn {',
      '  from { opacity: 0; transform: translateY(8px); }',
      '  to { opacity: 1; transform: translateY(0); }',
      '}',

      '@keyframes demoSlideIn {',
      '  from { opacity: 0; transform: translateX(-12px); }',
      '  to { opacity: 1; transform: translateX(0); }',
      '}',

      '@keyframes demoChipIn {',
      '  from { opacity: 0; transform: scale(0.85); }',
      '  to { opacity: 1; transform: scale(1); }',
      '}',

      '@keyframes demoProgressPulse {',
      '  0%, 100% { opacity: 1; }',
      '  50% { opacity: 0.7; }',
      '}',

      /* --- Split Panel Layout --- */
      '.demo-split {',
      '  display: flex;',
      '  gap: 0;',
      '  width: 100%;',
      '  min-height: 600px;',
      '  background: var(--color-navy, #070B1A);',
      '  border-radius: var(--radius-lg, 12px);',
      '  overflow: hidden;',
      '  border: 1px solid var(--color-navy-border, #1C2345);',
      '  animation: demoFadeIn 0.4s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;',
      '}',

      /* --- Left Sidebar (Pipeline) --- */
      '.demo-pipe {',
      '  width: 280px;',
      '  min-width: 280px;',
      '  background: var(--color-navy-mid, #0D1229);',
      '  border-right: 1px solid var(--color-navy-border, #1C2345);',
      '  display: flex;',
      '  flex-direction: column;',
      '  overflow: hidden;',
      '}',

      '.demo-pipe-header {',
      '  padding: 20px 20px 16px;',
      '  border-bottom: 1px solid var(--color-navy-border, #1C2345);',
      '  flex-shrink: 0;',
      '}',

      '.demo-pipe-title {',
      '  font-family: var(--font-primary, "Inter", sans-serif);',
      '  font-size: 13px;',
      '  font-weight: 500;',
      '  color: var(--color-navy-text, #e2e2e6);',
      '  letter-spacing: 0.02em;',
      '  margin-bottom: 12px;',
      '}',

      '.demo-pipe-deal {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 11px;',
      '  color: var(--color-navy-dim, #7c7f94);',
      '  letter-spacing: 0.04em;',
      '  margin-bottom: 14px;',
      '}',

      /* --- Progress Bar --- */
      '.demo-progress-wrap {',
      '  width: 100%;',
      '}',

      '.demo-progress-info {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  align-items: baseline;',
      '  margin-bottom: 6px;',
      '}',

      '.demo-progress-label {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 10px;',
      '  color: var(--color-navy-dim, #7c7f94);',
      '  letter-spacing: 0.06em;',
      '  text-transform: uppercase;',
      '}',

      '.demo-progress-count {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 10px;',
      '  color: var(--color-orange, #B85A30);',
      '  letter-spacing: 0.04em;',
      '}',

      '.demo-progress-bar {',
      '  width: 100%;',
      '  height: 3px;',
      '  background: var(--color-navy-light, #141A38);',
      '  border-radius: 2px;',
      '  overflow: hidden;',
      '}',

      '.demo-progress-fill {',
      '  height: 100%;',
      '  width: 0%;',
      '  background: var(--color-orange, #B85A30);',
      '  border-radius: 2px;',
      '  transition: width 0.5s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));',
      '}',

      /* --- Pipeline Steps List --- */
      '.demo-pipe-list {',
      '  flex: 1;',
      '  overflow-y: auto;',
      '  padding: 8px 0;',
      '}',

      '.demo-pipe-segment {',
      '  padding: 8px 20px 4px;',
      '}',

      '.demo-pipe-segment-label {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 9px;',
      '  font-weight: 500;',
      '  color: var(--color-navy-dim, #7c7f94);',
      '  letter-spacing: 0.1em;',
      '  text-transform: uppercase;',
      '  opacity: 0.6;',
      '}',

      '.demo-step {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '  padding: 7px 20px;',
      '  cursor: default;',
      '  transition: background 0.2s ease;',
      '}',

      '.demo-step:hover {',
      '  background: rgba(255, 255, 255, 0.02);',
      '}',

      '.demo-step-icon {',
      '  width: 22px;',
      '  height: 22px;',
      '  border-radius: 50%;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex-shrink: 0;',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 10px;',
      '  font-weight: 600;',
      '  transition: all 0.3s ease;',
      '}',

      /* pending */
      '.demo-step--pending .demo-step-icon {',
      '  background: var(--color-navy-light, #141A38);',
      '  color: var(--color-navy-dim, #7c7f94);',
      '  border: 1px solid var(--color-navy-border, #1C2345);',
      '}',

      '.demo-step--pending .demo-step-name {',
      '  color: var(--color-navy-dim, #7c7f94);',
      '}',

      /* active */
      '.demo-step--active .demo-step-icon {',
      '  background: var(--color-orange, #B85A30);',
      '  color: #fff;',
      '  border: 1px solid var(--color-orange, #B85A30);',
      '  animation: demoPulse 2s ease-in-out infinite;',
      '}',

      '.demo-step--active .demo-step-name {',
      '  color: var(--color-navy-text, #e2e2e6);',
      '  font-weight: 500;',
      '}',

      '.demo-step--active {',
      '  background: rgba(184, 90, 48, 0.06);',
      '}',

      /* complete */
      '.demo-step--complete .demo-step-icon {',
      '  background: var(--color-positive, #2D8C4F);',
      '  color: #fff;',
      '  border: 1px solid var(--color-positive, #2D8C4F);',
      '}',

      '.demo-step--complete .demo-step-name {',
      '  color: var(--color-navy-dim, #7c7f94);',
      '}',

      '.demo-step-name {',
      '  font-family: var(--font-primary, "Inter", sans-serif);',
      '  font-size: 12px;',
      '  font-weight: 400;',
      '  line-height: 1.3;',
      '  transition: color 0.3s ease;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',

      '.demo-step-time {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 9px;',
      '  color: var(--color-navy-dim, #7c7f94);',
      '  margin-left: auto;',
      '  flex-shrink: 0;',
      '  opacity: 0;',
      '  transition: opacity 0.3s ease;',
      '}',

      '.demo-step--complete .demo-step-time {',
      '  opacity: 1;',
      '}',

      /* --- Right Stream Panel --- */
      '.demo-stream {',
      '  flex: 1;',
      '  display: flex;',
      '  flex-direction: column;',
      '  overflow: hidden;',
      '  min-width: 0;',
      '}',

      /* --- Stream Header / Doc Chips Bar --- */
      '.demo-stream-header {',
      '  padding: 16px 24px 12px;',
      '  border-bottom: 1px solid var(--color-navy-border, #1C2345);',
      '  flex-shrink: 0;',
      '}',

      '.demo-stream-header-row {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  margin-bottom: 10px;',
      '}',

      '.demo-stream-title {',
      '  font-family: var(--font-primary, "Inter", sans-serif);',
      '  font-size: 13px;',
      '  font-weight: 500;',
      '  color: var(--color-navy-text, #e2e2e6);',
      '  letter-spacing: 0.01em;',
      '}',

      '.demo-stream-status {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 10px;',
      '  color: var(--color-orange, #B85A30);',
      '  letter-spacing: 0.04em;',
      '  animation: demoProgressPulse 1.5s ease-in-out infinite;',
      '}',

      '.demo-doc-chips {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 6px;',
      '  min-height: 24px;',
      '}',

      '.demo-doc-chip {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '  padding: 3px 10px;',
      '  background: var(--color-navy-light, #141A38);',
      '  border: 1px solid var(--color-navy-border, #1C2345);',
      '  border-radius: 999px;',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 10px;',
      '  color: var(--color-navy-dim, #7c7f94);',
      '  letter-spacing: 0.02em;',
      '  animation: demoChipIn 0.3s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;',
      '  transition: border-color 0.3s ease, color 0.3s ease;',
      '}',

      '.demo-doc-chip--active {',
      '  border-color: var(--color-orange, #B85A30);',
      '  color: var(--color-orange, #B85A30);',
      '}',

      '.demo-doc-chip--done {',
      '  border-color: var(--color-positive, #2D8C4F);',
      '  color: var(--color-positive, #2D8C4F);',
      '}',

      '.demo-doc-chip-dot {',
      '  width: 5px;',
      '  height: 5px;',
      '  border-radius: 50%;',
      '  background: currentColor;',
      '}',

      /* --- Stream Content Area --- */
      '.demo-stream-content {',
      '  flex: 1;',
      '  overflow-y: auto;',
      '  padding: 20px 24px;',
      '  scroll-behavior: smooth;',
      '}',

      /* --- Phase Header in Stream --- */
      '.demo-phase-header {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '  margin-bottom: 12px;',
      '  margin-top: 4px;',
      '  animation: demoSlideIn 0.35s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;',
      '}',

      '.demo-phase-header:not(:first-child) {',
      '  margin-top: 28px;',
      '  padding-top: 20px;',
      '  border-top: 1px solid var(--color-navy-border, #1C2345);',
      '}',

      '.demo-phase-num {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 10px;',
      '  font-weight: 600;',
      '  letter-spacing: 0.06em;',
      '  color: var(--color-orange, #B85A30);',
      '  background: rgba(184, 90, 48, 0.1);',
      '  padding: 3px 8px;',
      '  border-radius: var(--radius-sm, 4px);',
      '  text-transform: uppercase;',
      '}',

      '.demo-phase-name {',
      '  font-family: var(--font-primary, "Inter", sans-serif);',
      '  font-size: 14px;',
      '  font-weight: 500;',
      '  color: var(--color-navy-text, #e2e2e6);',
      '  letter-spacing: 0.01em;',
      '}',

      /* --- Streaming Lines --- */
      '.demo-line {',
      '  display: flex;',
      '  align-items: flex-start;',
      '  gap: 8px;',
      '  padding: 4px 0;',
      '  animation: demoFadeIn 0.2s ease both;',
      '}',

      '.demo-line-marker {',
      '  flex-shrink: 0;',
      '  width: 4px;',
      '  height: 4px;',
      '  border-radius: 50%;',
      '  background: var(--color-navy-dim, #7c7f94);',
      '  margin-top: 7px;',
      '  transition: background 0.2s ease;',
      '}',

      '.demo-line--positive .demo-line-marker {',
      '  background: var(--color-positive, #2D8C4F);',
      '}',

      '.demo-line--negative .demo-line-marker {',
      '  background: var(--color-negative, #C4392D);',
      '}',

      '.demo-line-text {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 12.5px;',
      '  line-height: 1.65;',
      '  color: var(--color-navy-text, #e2e2e6);',
      '  word-break: break-word;',
      '}',

      '.demo-line--positive .demo-line-text {',
      '  color: var(--color-positive, #2D8C4F);',
      '}',

      '.demo-line--negative .demo-line-text {',
      '  color: var(--color-negative, #C4392D);',
      '}',

      '.demo-line--metric .demo-line-text {',
      '  color: var(--color-rl-blue, #B8CCDB);',
      '}',

      '.demo-cursor {',
      '  color: var(--color-orange, #B85A30);',
      '  animation: demoCursorBlink 0.8s step-end infinite;',
      '  margin-left: 1px;',
      '  font-weight: 300;',
      '}',

      /* --- Completion Card --- */
      '.demo-complete {',
      '  animation: demoFadeIn 0.6s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;',
      '  margin-top: 32px;',
      '  padding-top: 24px;',
      '  border-top: 1px solid var(--color-navy-border, #1C2345);',
      '}',

      '.demo-complete-icon {',
      '  margin-bottom: 16px;',
      '}',

      '.demo-complete-title {',
      '  font-family: var(--font-primary, "Inter", sans-serif);',
      '  font-size: 20px;',
      '  font-weight: 400;',
      '  color: var(--color-navy-text, #e2e2e6);',
      '  letter-spacing: -0.01em;',
      '  margin-bottom: 8px;',
      '}',

      '.demo-complete-summary {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 12px;',
      '  color: var(--color-rl-blue, #B8CCDB);',
      '  line-height: 1.6;',
      '  margin-bottom: 20px;',
      '}',

      '.demo-complete-stats {',
      '  display: flex;',
      '  gap: 32px;',
      '  flex-wrap: wrap;',
      '  padding-top: 16px;',
      '  border-top: 1px solid var(--color-navy-border, #1C2345);',
      '}',

      '.demo-stat-value {',
      '  font-family: var(--font-mono, monospace);',
      '  font-size: 22px;',
      '  font-weight: 500;',
      '  color: var(--color-orange, #B85A30);',
      '}',

      '.demo-stat-label {',
      '  font-family: var(--font-primary, "Inter", sans-serif);',
      '  font-size: 11px;',
      '  color: var(--color-navy-dim, #7c7f94);',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.06em;',
      '  margin-top: 3px;',
      '}',

      /* --- Restart Button (inside stream) --- */
      '.demo-restart-btn {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  padding: 10px 20px;',
      '  margin-top: 20px;',
      '  background: var(--color-navy-light, #141A38);',
      '  color: var(--color-navy-text, #e2e2e6);',
      '  border: 1px solid var(--color-navy-border, #1C2345);',
      '  border-radius: var(--radius-md, 8px);',
      '  font-family: var(--font-primary, "Inter", sans-serif);',
      '  font-size: 13px;',
      '  font-weight: 500;',
      '  cursor: pointer;',
      '  transition: background 0.2s ease, border-color 0.2s ease;',
      '}',

      '.demo-restart-btn:hover {',
      '  background: var(--color-navy-border, #1C2345);',
      '  border-color: var(--color-navy-dim, #7c7f94);',
      '}',

      /* --- Close / Back Button --- */
      '.demo-close-btn {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  padding: 8px 16px;',
      '  margin-top: 12px;',
      '  background: transparent;',
      '  color: var(--color-navy-dim, #7c7f94);',
      '  border: none;',
      '  font-family: var(--font-primary, "Inter", sans-serif);',
      '  font-size: 12px;',
      '  font-weight: 400;',
      '  cursor: pointer;',
      '  transition: color 0.2s ease;',
      '}',

      '.demo-close-btn:hover {',
      '  color: var(--color-navy-text, #e2e2e6);',
      '}',

      /* --- Responsive: mobile hides sidebar --- */
      '@media (max-width: 768px) {',
      '  .demo-split {',
      '    flex-direction: column;',
      '    min-height: auto;',
      '  }',
      '  .demo-pipe {',
      '    display: none;',
      '  }',
      '  .demo-stream {',
      '    width: 100%;',
      '  }',
      '  .demo-stream-content {',
      '    padding: 16px;',
      '    min-height: 500px;',
      '  }',
      '  .demo-complete-stats {',
      '    gap: 20px;',
      '  }',
      '}',

      /* --- Reduced motion --- */
      '@media (prefers-reduced-motion: reduce) {',
      '  .demo-step--active .demo-step-icon {',
      '    animation: none;',
      '  }',
      '  .demo-stream-status {',
      '    animation: none;',
      '  }',
      '}'

    ].join('\n');
    document.head.appendChild(style);
  }

  /* --------------------------------------------------------------------------
     Build the Split-Panel Layout
     -------------------------------------------------------------------------- */
  function buildSplitPanel() {
    // Main wrapper
    splitPanel = document.createElement('div');
    splitPanel.className = 'demo-split';

    // ======================
    // LEFT: Pipeline Sidebar
    // ======================
    var pipe = document.createElement('div');
    pipe.className = 'demo-pipe';

    // Pipe header
    var pipeHeader = document.createElement('div');
    pipeHeader.className = 'demo-pipe-header';

    var pipeTitle = document.createElement('div');
    pipeTitle.className = 'demo-pipe-title';
    pipeTitle.textContent = 'Execution Pipeline';

    var pipeDeal = document.createElement('div');
    pipeDeal.className = 'demo-pipe-deal';
    pipeDeal.textContent = 'VUL-2026-047  \u00B7  247 Units  \u00B7  South FL';

    // Progress bar
    var progressWrap = document.createElement('div');
    progressWrap.className = 'demo-progress-wrap';

    var progressInfo = document.createElement('div');
    progressInfo.className = 'demo-progress-info';

    progressLabel = document.createElement('span');
    progressLabel.className = 'demo-progress-label';
    progressLabel.textContent = 'Progress';

    var progressCount = document.createElement('span');
    progressCount.className = 'demo-progress-count';
    progressCount.textContent = '0 / 15';

    progressInfo.appendChild(progressLabel);
    progressInfo.appendChild(progressCount);

    progressBar = document.createElement('div');
    progressBar.className = 'demo-progress-bar';

    progressFill = document.createElement('div');
    progressFill.className = 'demo-progress-fill';

    progressBar.appendChild(progressFill);
    progressWrap.appendChild(progressInfo);
    progressWrap.appendChild(progressBar);

    pipeHeader.appendChild(pipeTitle);
    pipeHeader.appendChild(pipeDeal);
    pipeHeader.appendChild(progressWrap);
    pipe.appendChild(pipeHeader);

    // Pipe step list
    var pipeList = document.createElement('div');
    pipeList.className = 'demo-pipe-list';

    sidebarSteps = [];
    var currentSegmentIdx = 0;

    DEMO_PHASES.forEach(function (phase, i) {
      // Check if we need a segment label
      while (currentSegmentIdx < SEGMENTS.length && phase.number > SEGMENTS[currentSegmentIdx].end) {
        currentSegmentIdx++;
      }
      if (currentSegmentIdx < SEGMENTS.length && phase.number === SEGMENTS[currentSegmentIdx].start) {
        var segDiv = document.createElement('div');
        segDiv.className = 'demo-pipe-segment';
        var segLabel = document.createElement('div');
        segLabel.className = 'demo-pipe-segment-label';
        segLabel.textContent = SEGMENTS[currentSegmentIdx].label;
        segDiv.appendChild(segLabel);
        pipeList.appendChild(segDiv);
      }

      var step = document.createElement('div');
      step.className = 'demo-step demo-step--pending';
      step.setAttribute('data-phase-num', phase.number);

      var icon = document.createElement('div');
      icon.className = 'demo-step-icon';
      icon.textContent = phase.number;

      var name = document.createElement('div');
      name.className = 'demo-step-name';
      name.textContent = phase.name;
      name.title = phase.name;

      var time = document.createElement('div');
      time.className = 'demo-step-time';

      step.appendChild(icon);
      step.appendChild(name);
      step.appendChild(time);
      pipeList.appendChild(step);

      sidebarSteps.push(step);
    });

    pipe.appendChild(pipeList);

    // ======================
    // RIGHT: Stream Panel
    // ======================
    var stream = document.createElement('div');
    stream.className = 'demo-stream';

    // Stream header with doc chips
    var streamHeader = document.createElement('div');
    streamHeader.className = 'demo-stream-header';

    var streamHeaderRow = document.createElement('div');
    streamHeaderRow.className = 'demo-stream-header-row';

    var streamTitle = document.createElement('div');
    streamTitle.className = 'demo-stream-title';
    streamTitle.textContent = 'Analysis Output';

    var streamStatus = document.createElement('div');
    streamStatus.className = 'demo-stream-status';
    streamStatus.textContent = 'STREAMING';

    streamHeaderRow.appendChild(streamTitle);
    streamHeaderRow.appendChild(streamStatus);

    docChipBar = document.createElement('div');
    docChipBar.className = 'demo-doc-chips';

    streamHeader.appendChild(streamHeaderRow);
    streamHeader.appendChild(docChipBar);
    stream.appendChild(streamHeader);

    // Stream content (scrollable)
    streamArea = document.createElement('div');
    streamArea.className = 'demo-stream-content';
    stream.appendChild(streamArea);

    // Assemble split panel
    splitPanel.appendChild(pipe);
    splitPanel.appendChild(stream);

    return splitPanel;
  }

  /* --------------------------------------------------------------------------
     Launch Demo — Hide intro, show split panel
     -------------------------------------------------------------------------- */
  function launchDemo() {
    if (isRunning) return;

    injectStyles();

    // Hide the intro section
    if (introEl) {
      introEl.style.display = 'none';
    }

    // Hide original placeholder elements
    if (demoPhasesEl) {
      demoPhasesEl.style.display = 'none';
    }
    if (demoSummaryEl) {
      demoSummaryEl.style.display = 'none';
    }

    // Remove any previous split panel
    var existing = demoContainer.querySelector('.demo-split');
    if (existing) {
      existing.remove();
    }

    // Build and insert the split panel inline
    var panel = buildSplitPanel();
    demoContainer.appendChild(panel);

    // Scroll the panel into view
    setTimeout(function () {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // Start the execution
    startDemo();
  }

  /* --------------------------------------------------------------------------
     Start Demo — Run through all 15 phases
     -------------------------------------------------------------------------- */
  async function startDemo() {
    if (isRunning) return;
    isRunning = true;
    abortController = new AbortController();
    startTime = Date.now();

    // Fire analytics
    if (typeof window.PinchfinAnalytics !== 'undefined') {
      window.PinchfinAnalytics.trackEvent('demo', 'demo_start', 'workflow_demo');
    }

    // Execute each phase
    for (var i = 0; i < DEMO_PHASES.length; i++) {
      if (abortController.signal.aborted) break;

      var phase = DEMO_PHASES[i];

      // Update sidebar: set current phase to active
      setSidebarState(i, 'active');

      // Update progress
      updateProgress(i, DEMO_PHASES.length);

      // Show document chips for this phase
      showDocChips(phase.number);

      await delay(CONFIG.phaseEnterDelay);

      // Stream the phase in the right panel
      await streamPhase(phase, i);

      // Mark sidebar as complete
      var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setSidebarState(i, 'complete', elapsed + 's');

      // Brief pause between phases
      if (i < DEMO_PHASES.length - 1) {
        await delay(CONFIG.phaseCompleteDelay);
      }
    }

    // Final progress
    updateProgress(DEMO_PHASES.length, DEMO_PHASES.length);

    // Update stream status
    var statusEl = splitPanel.querySelector('.demo-stream-status');
    if (statusEl) {
      statusEl.textContent = 'COMPLETE';
      statusEl.style.animation = 'none';
      statusEl.style.color = 'var(--color-positive, #2D8C4F)';
    }

    // Finalize all doc chips
    finalizeDocChips();

    // Show completion card
    if (!abortController.signal.aborted) {
      showCompletionCard();
    }

    isRunning = false;

    // Fire analytics
    if (typeof window.PinchfinAnalytics !== 'undefined') {
      window.PinchfinAnalytics.trackEvent('demo', 'demo_complete', 'workflow_demo');
    }
  }

  /* --------------------------------------------------------------------------
     Set Sidebar Step State
     -------------------------------------------------------------------------- */
  function setSidebarState(index, state, timeStr) {
    var step = sidebarSteps[index];
    if (!step) return;

    // Remove all state classes
    step.className = 'demo-step demo-step--' + state;

    var icon = step.querySelector('.demo-step-icon');
    var timeEl = step.querySelector('.demo-step-time');

    if (state === 'active') {
      icon.innerHTML = '';
      icon.textContent = DEMO_PHASES[index].number;

      // Scroll the step into view within the pipe list
      var pipeList = step.closest('.demo-pipe-list');
      if (pipeList) {
        var stepRect = step.getBoundingClientRect();
        var listRect = pipeList.getBoundingClientRect();
        if (stepRect.bottom > listRect.bottom || stepRect.top < listRect.top) {
          step.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    if (state === 'complete') {
      // Replace number with checkmark SVG
      icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 9L2 6.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      if (timeEl && timeStr) {
        timeEl.textContent = timeStr;
      }
    }
  }

  /* --------------------------------------------------------------------------
     Update Progress Bar
     -------------------------------------------------------------------------- */
  function updateProgress(completed, total) {
    var pct = Math.round((completed / total) * 100);
    if (progressFill) {
      progressFill.style.width = pct + '%';
    }
    var countEl = splitPanel.querySelector('.demo-progress-count');
    if (countEl) {
      countEl.textContent = completed + ' / ' + total;
    }
  }

  /* --------------------------------------------------------------------------
     Show Document Chips
     -------------------------------------------------------------------------- */
  function showDocChips(phaseNumber) {
    DOC_CHIPS.forEach(function (chip) {
      if (chip.phase === phaseNumber) {
        // Check if chip already exists
        var existing = docChipBar.querySelector('[data-chip-phase="' + chip.phase + '"]');
        if (existing) {
          // Mark as active
          existing.className = 'demo-doc-chip demo-doc-chip--active';
          return;
        }
        var el = document.createElement('div');
        el.className = 'demo-doc-chip demo-doc-chip--active';
        el.setAttribute('data-chip-phase', chip.phase);

        var dot = document.createElement('span');
        dot.className = 'demo-doc-chip-dot';

        var label = document.createElement('span');
        label.textContent = chip.label;

        el.appendChild(dot);
        el.appendChild(label);
        docChipBar.appendChild(el);
      }
    });

    // Mark previous chips as done
    var allChips = docChipBar.querySelectorAll('.demo-doc-chip');
    allChips.forEach(function (chipEl) {
      var chipPhase = parseInt(chipEl.getAttribute('data-chip-phase'), 10);
      if (chipPhase < phaseNumber) {
        chipEl.className = 'demo-doc-chip demo-doc-chip--done';
      }
    });
  }

  /* --------------------------------------------------------------------------
     Finalize All Doc Chips (mark all as done)
     -------------------------------------------------------------------------- */
  function finalizeDocChips() {
    var allChips = docChipBar.querySelectorAll('.demo-doc-chip');
    allChips.forEach(function (chipEl) {
      chipEl.className = 'demo-doc-chip demo-doc-chip--done';
    });
  }

  /* --------------------------------------------------------------------------
     Stream a Single Phase into the Right Panel
     -------------------------------------------------------------------------- */
  async function streamPhase(phase, index) {
    // Add phase header to stream area
    var header = document.createElement('div');
    header.className = 'demo-phase-header';

    var numBadge = document.createElement('span');
    numBadge.className = 'demo-phase-num';
    numBadge.textContent = 'Phase ' + phase.number;

    var nameEl = document.createElement('span');
    nameEl.className = 'demo-phase-name';
    nameEl.textContent = phase.name;

    header.appendChild(numBadge);
    header.appendChild(nameEl);
    streamArea.appendChild(header);

    // Auto-scroll to bottom
    scrollStreamToBottom();

    // Stream each data point
    for (var j = 0; j < phase.dataPoints.length; j++) {
      if (abortController.signal.aborted) return;

      var dp = phase.dataPoints[j];
      var text = typeof dp === 'string' ? dp : dp.text;
      var type = typeof dp === 'string' ? 'neutral' : dp.type;

      await streamLine(text, type);

      if (j < phase.dataPoints.length - 1) {
        await delay(CONFIG.dataPointDelay);
      }
    }
  }

  /* --------------------------------------------------------------------------
     Stream a Single Line with Character-by-Character Effect
     -------------------------------------------------------------------------- */
  function streamLine(text, type) {
    return new Promise(function (resolve) {
      var line = document.createElement('div');
      line.className = 'demo-line';
      if (type === 'positive') line.className += ' demo-line--positive';
      if (type === 'negative') line.className += ' demo-line--negative';
      if (type === 'metric') line.className += ' demo-line--metric';

      var marker = document.createElement('span');
      marker.className = 'demo-line-marker';

      var textSpan = document.createElement('span');
      textSpan.className = 'demo-line-text';

      var cursor = document.createElement('span');
      cursor.className = 'demo-cursor';
      cursor.textContent = '\u2588';

      line.appendChild(marker);
      line.appendChild(textSpan);
      line.appendChild(cursor);
      streamArea.appendChild(line);

      scrollStreamToBottom();

      // Type characters
      var charIndex = 0;

      function typeChar() {
        if (abortController && abortController.signal.aborted) {
          textSpan.textContent = text;
          cursor.remove();
          resolve();
          return;
        }

        if (charIndex < text.length) {
          textSpan.textContent += text[charIndex];
          charIndex++;
          scrollStreamToBottom();
          setTimeout(typeChar, CONFIG.charDelay);
        } else {
          cursor.remove();
          resolve();
        }
      }

      typeChar();
    });
  }

  /* --------------------------------------------------------------------------
     Scroll Stream Area to Bottom
     -------------------------------------------------------------------------- */
  function scrollStreamToBottom() {
    if (streamArea) {
      streamArea.scrollTop = streamArea.scrollHeight;
    }
  }

  /* --------------------------------------------------------------------------
     Show Completion Card
     -------------------------------------------------------------------------- */
  function showCompletionCard() {
    var totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    var card = document.createElement('div');
    card.className = 'demo-complete';

    // Icon
    var iconDiv = document.createElement('div');
    iconDiv.className = 'demo-complete-icon';
    iconDiv.innerHTML = '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="16.5" stroke="#2D8C4F" stroke-width="1.5"/><path d="M24 13L15.5 22L12 18.5" stroke="#2D8C4F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var title = document.createElement('div');
    title.className = 'demo-complete-title';
    title.textContent = 'Analysis Complete';

    var summary = document.createElement('div');
    summary.className = 'demo-complete-summary';
    summary.textContent = '15 phases executed \u00B7 247-unit multifamily \u00B7 $34.5M recommended loan amount \u00B7 ' + totalTime + 's';

    var stats = document.createElement('div');
    stats.className = 'demo-complete-stats';

    var statItems = [
      { label: 'Phases',     value: '15' },
      { label: 'Data Points', value: '64' },
      { label: 'Documents',  value: '8' },
      { label: 'Pages',      value: '195+' },
      { label: 'Runtime',    value: totalTime + 's' }
    ];

    statItems.forEach(function (item) {
      var stat = document.createElement('div');

      var val = document.createElement('div');
      val.className = 'demo-stat-value';
      val.textContent = item.value;

      var lbl = document.createElement('div');
      lbl.className = 'demo-stat-label';
      lbl.textContent = item.label;

      stat.appendChild(val);
      stat.appendChild(lbl);
      stats.appendChild(stat);
    });

    // Restart button
    var restartBtn = document.createElement('button');
    restartBtn.className = 'demo-restart-btn';
    restartBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 7a5.5 5.5 0 1 1 1.1 3.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M1.5 11V7h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg> Run Again';
    restartBtn.addEventListener('click', function () {
      resetDemo();
      setTimeout(launchDemo, 100);
    });

    // Close / back button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'demo-close-btn';
    closeBtn.textContent = '\u2190 Back to intro';
    closeBtn.addEventListener('click', function () {
      resetDemo();
    });

    card.appendChild(iconDiv);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(stats);
    card.appendChild(restartBtn);
    card.appendChild(closeBtn);

    streamArea.appendChild(card);
    scrollStreamToBottom();
  }

  /* --------------------------------------------------------------------------
     Reset Demo — Return to Intro State
     -------------------------------------------------------------------------- */
  function resetDemo() {
    // Abort running demo
    if (abortController) {
      abortController.abort();
    }
    isRunning = false;

    // Remove split panel
    var existing = demoContainer.querySelector('.demo-split');
    if (existing) {
      existing.remove();
    }
    splitPanel = null;
    sidebarSteps = [];
    streamArea = null;
    docChipBar = null;
    progressBar = null;
    progressFill = null;
    progressLabel = null;

    // Restore intro
    if (introEl) {
      introEl.style.display = '';
    }
    if (demoPhasesEl) {
      demoPhasesEl.style.display = '';
    }
    if (demoSummaryEl) {
      demoSummaryEl.style.display = '';
    }

    // Scroll back to container
    demoContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* --------------------------------------------------------------------------
     Utility: Delay (abortable)
     -------------------------------------------------------------------------- */
  function delay(ms) {
    return new Promise(function (resolve) {
      var timer = setTimeout(resolve, ms);
      if (abortController) {
        abortController.signal.addEventListener('abort', function () {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      }
    });
  }

  /* --------------------------------------------------------------------------
     Initialize on DOM Ready
     -------------------------------------------------------------------------- */
  function initDemo() {
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
  } else {
    initDemo();
  }

  /* --------------------------------------------------------------------------
     Public API
     -------------------------------------------------------------------------- */
  window.PinchfinDemo = {
    start: launchDemo,
    reset: resetDemo,
    getPhases: function () { return DEMO_PHASES; },
    isRunning: function () { return isRunning; }
  };

})();
