/* =====================================================
   THINK! VENTURES -- LaunchPad Extras (Tier 1 Features)
   Injects power-user sections into step-4 (Roadmap):
     1. Total Cost Calculator
     2. Business Name Search Links
     3. Banking Setup Guide
     4. Tax Registration Guide
     5. Insurance Checklist
   Load AFTER doc-generator.js.
   ===================================================== */

(function LaunchPadExtras() {
  'use strict';

  // ─── COST DATA ────────────────────────────────────────
  // Business license estimates by industry key.
  var LICENSE_COST = {
    'home-services': 150,
    'food-beverage': 300,
    'health-beauty': 100,
    'professional': 50,
    'retail': 75,
    'creative': 25,
    'construction': 200,
    'tech': 25,
    'education': 50
  };

  // Annual insurance estimates by industry key.
  var INSURANCE_COST = {
    'home-services': 1200,
    'food-beverage': 2000,
    'health-beauty': 800,
    'professional': 600,
    'retail': 900,
    'creative': 500,
    'construction': 3000,
    'tech': 500,
    'education': 700
  };


  // ─── STATE FILING FEE MAP ─────────────────────────────
  // Mirrors the STATE_DATA in doc-generator.js so we can
  // read filing fees without duplicating the full object.
  var STATE_FEES = {
    nc:  { llc: 125, scorp: 125, nonprofit: 60, sole: 0 },
    va:  { llc: 100, scorp: 75,  nonprofit: 75, sole: 0 },
    sc:  { llc: 110, scorp: 135, nonprofit: 25, sole: 0 },
    ga:  { llc: 100, scorp: 100, nonprofit: 100, sole: 0 },
    tx:  { llc: 300, scorp: 300, nonprofit: 25, sole: 0 },
    ny:  { llc: 200, scorp: 125, nonprofit: 75, sole: 0 },
    ca:  { llc: 70,  scorp: 100, nonprofit: 30, sole: 0 },
    fl:  { llc: 125, scorp: 70,  nonprofit: 35, sole: 0 }
  };

  // Name search URLs by state abbreviation.
  var NAME_SEARCH_URLS = {
    nc: 'https://www.sosnc.gov/online_services/search/by_title/_Business_Registration',
    va: 'https://www.scc.virginia.gov/pages/Business-Entity-Search',
    sc: 'https://businessfilings.sc.gov/businessfiling',
    ga: 'https://ecorp.sos.ga.gov/BusinessSearch',
    tx: 'https://www.sos.state.tx.us/corp/sosda/index.shtml',
    ny: 'https://www.dos.ny.gov/corps/bus_entity_search.html',
    ca: 'https://bizfileonline.sos.ca.gov/search/business',
    fl: 'https://dos.fl.gov/sunbiz/search/'
  };


  // ─── SALES TAX GUIDANCE BY INDUSTRY ───────────────────
  var TAX_GUIDANCE = {
    'food-beverage': 'You likely need a sales tax permit. Prepared food is taxable in most states.',
    'retail':        'You likely need a sales tax permit. Retail goods are taxable in most states.',
    'professional':  'Services may be exempt from sales tax in many states. Verify with your state revenue department.',
    'tech':          'Services may be exempt from sales tax in many states. SaaS taxability varies by state.',
    'education':     'Services may be exempt from sales tax in many states. Check state-specific education exemptions.',
    'creative':      'Services may be exempt from sales tax in many states. Digital products may be taxable.',
    'construction':  'Labor may be exempt but materials are generally taxable. Check your state rules.',
    'home-services': 'Labor may be exempt but materials are generally taxable. Check your state rules.',
    'health-beauty': 'Some services are taxable, some are exempt. Check your state health-service tax rules.'
  };


  // ─── INSURANCE TYPES BY INDUSTRY ──────────────────────
  // Each entry: { name, desc, industries[], cost }
  var INSURANCE_TYPES = [
    {
      name: 'General Liability',
      desc: 'Protects against third-party bodily injury, property damage, and advertising injury claims.',
      industries: ['home-services', 'food-beverage', 'health-beauty', 'professional', 'retail', 'creative', 'construction', 'tech', 'education'],
      cost: '$400 - $1,500'
    },
    {
      name: 'Professional Liability / E&O',
      desc: 'Covers claims of negligence, errors, and omissions in professional services.',
      industries: ['professional', 'tech', 'education', 'creative'],
      cost: '$500 - $1,200'
    },
    {
      name: 'Product Liability',
      desc: 'Covers claims arising from defective products that cause injury or harm.',
      industries: ['food-beverage', 'retail'],
      cost: '$500 - $2,000'
    },
    {
      name: 'Commercial Auto',
      desc: 'Covers vehicles used for business operations, deliveries, and service calls.',
      industries: ['home-services', 'construction'],
      cost: '$1,200 - $2,400'
    },
    {
      name: 'Workers Compensation',
      desc: 'Required in most states when you hire employees. Covers workplace injuries and lost wages.',
      industries: ['home-services', 'food-beverage', 'health-beauty', 'professional', 'retail', 'creative', 'construction', 'tech', 'education'],
      cost: 'Varies by payroll'
    },
    {
      name: 'Property Insurance',
      desc: 'Covers your physical location, equipment, inventory, and furnishings against damage or theft.',
      industries: ['retail', 'food-beverage'],
      cost: '$500 - $3,000'
    },
    {
      name: 'Cyber Liability',
      desc: 'Covers costs related to data breaches, hacking, and cyber-attacks on your systems.',
      industries: ['tech'],
      cost: '$500 - $1,500'
    },
    {
      name: 'Contractor License Bond',
      desc: 'A surety bond required by many states for licensed contractors. Guarantees compliance with regulations.',
      industries: ['construction'],
      cost: '$100 - $500'
    }
  ];


  // ─── INDUSTRY LABELS (mirror from wizard) ─────────────
  var INDUSTRY_LABELS = {
    'home-services': 'Home Services',
    'food-beverage': 'Food & Beverage',
    'health-beauty': 'Health & Beauty',
    'professional': 'Professional Services',
    'retail': 'Retail & E-Commerce',
    'creative': 'Creative & Media',
    'construction': 'Construction',
    'tech': 'Technology',
    'education': 'Education & Training'
  };


  // ─── STATE LABELS ─────────────────────────────────────
  var STATE_LABELS = {
    nc: 'North Carolina', va: 'Virginia', sc: 'South Carolina',
    ga: 'Georgia', tx: 'Texas', ny: 'New York',
    ca: 'California', fl: 'Florida'
  };


  // ─── HELPERS ──────────────────────────────────────────

  /** Read wizard selections from globals. */
  function getData() {
    var sel = window.selections || {};
    var bizNameEl = document.getElementById('biz-name');

    var stateKey  = sel.state    || (typeof window.selectedState    === 'string' ? window.selectedState    : '') || '';
    var entityKey = sel.entity   || (typeof window.selectedEntity   === 'string' ? window.selectedEntity   : '') || '';
    var indKey    = sel.industry || (typeof window.selectedIndustry === 'string' ? window.selectedIndustry : '') || '';
    var bizName   = sel.name     || (bizNameEl ? bizNameEl.value : '') || 'Your Business';

    return {
      stateKey:  stateKey.toLowerCase(),
      entityKey: entityKey.toLowerCase(),
      indKey:    indKey.toLowerCase(),
      bizName:   bizName
    };
  }


  /** Format a number as US dollars with commas. */
  function fmtDollars(n) {
    return '$' + n.toLocaleString('en-US');
  }


  /** Create a slug from a business name for URL params. */
  function slugify(str) {
    return encodeURIComponent(
      str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    );
  }


  // ─── ICONS (inline SVG) ───────────────────────────────
  var ICON = {
    dollar:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    search:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    bank:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="20" width="22" height="2"/><path d="M12 2L2 8h20L12 2z"/><line x1="4" y1="10" x2="4" y2="18"/><line x1="8" y1="10" x2="8" y2="18"/><line x1="12" y1="10" x2="12" y2="18"/><line x1="16" y1="10" x2="16" y2="18"/><line x1="20" y1="10" x2="20" y2="18"/></svg>',
    tax:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="7" x2="8" y2="7.01"/><line x1="12" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="8" y2="11.01"/><line x1="12" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="12" y1="15" x2="16" y2="15"/></svg>',
    shield:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    external:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    check:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    creditCard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    alertTri:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };


  // ═══════════════════════════════════════════════════════
  //  INJECT CSS
  // ═══════════════════════════════════════════════════════
  function injectStyles() {
    if (document.getElementById('lp-extras-styles')) return;
    var style = document.createElement('style');
    style.id = 'lp-extras-styles';
    style.textContent = [

      /* ── Shared Section Card ── */
      '.lpx-section {',
      '  margin-top: var(--sp-2xl, 2rem);',
      '  padding: var(--sp-xl, 1.5rem) var(--sp-xl, 1.5rem) var(--sp-lg, 1.25rem);',
      '  background: rgba(255,255,255,0.03);',
      '  backdrop-filter: blur(16px);',
      '  -webkit-backdrop-filter: blur(16px);',
      '  border: 1px solid rgba(255,255,255,0.08);',
      '  border-radius: var(--border-radius-lg, 16px);',
      '  animation: fadeIn 0.4s ease;',
      '}',
      '.lpx-section:hover {',
      '  border-color: rgba(16,185,129,0.2);',
      '}',

      /* ── Section Header ── */
      '.lpx-header {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: var(--sp-md, 0.75rem);',
      '  margin-bottom: var(--sp-lg, 1.25rem);',
      '}',
      '.lpx-header__icon {',
      '  width: 44px;',
      '  height: 44px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  border-radius: var(--border-radius-md, 12px);',
      '  flex-shrink: 0;',
      '  color: #fff;',
      '}',
      '.lpx-header__icon svg { width: 22px; height: 22px; }',
      '.lpx-header__icon--emerald { background: linear-gradient(135deg, #10B981 0%, #0D4F4F 100%); }',
      '.lpx-header__icon--gold    { background: linear-gradient(135deg, #F5A623 0%, #e6951e 100%); }',
      '.lpx-header__icon--teal    { background: linear-gradient(135deg, #0D4F4F 0%, #083838 100%); }',
      '.lpx-title {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 800;',
      '  font-size: var(--fs-xl, 1.25rem);',
      '  color: #F5A623;',
      '}',
      '.lpx-subtitle {',
      '  font-family: var(--font-body, "Inter", sans-serif);',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  margin-top: 2px;',
      '}',

      /* ── Cost Calculator ── */
      '.lpx-cost-card {',
      '  margin-top: var(--sp-xl, 1.5rem);',
      '  padding: var(--sp-xl, 1.5rem);',
      '  background: linear-gradient(135deg, rgba(245,166,35,0.08) 0%, rgba(16,185,129,0.06) 100%);',
      '  border: 1px solid rgba(245,166,35,0.2);',
      '  border-radius: var(--border-radius-lg, 16px);',
      '  text-align: center;',
      '}',
      '.lpx-total-label {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 600;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  text-transform: uppercase;',
      '  letter-spacing: 2px;',
      '  margin-bottom: var(--sp-xs, 0.25rem);',
      '}',
      '.lpx-total-number {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 800;',
      '  font-size: 2.75rem;',
      '  color: #F5A623;',
      '  line-height: 1.1;',
      '}',
      '.lpx-total-note {',
      '  font-size: var(--fs-xs, 0.75rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  margin-top: var(--sp-sm, 0.5rem);',
      '  font-style: italic;',
      '}',

      /* ── Cost Breakdown Grid ── */
      '.lpx-breakdown {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));',
      '  gap: var(--sp-md, 0.75rem);',
      '  margin-top: var(--sp-lg, 1.25rem);',
      '}',
      '.lpx-cost-item {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  align-items: center;',
      '  padding: var(--sp-md, 0.75rem) var(--sp-lg, 1rem);',
      '  background: rgba(255,255,255,0.03);',
      '  border: 1px solid rgba(255,255,255,0.06);',
      '  border-radius: var(--border-radius-sm, 8px);',
      '  transition: border-color 0.3s ease;',
      '}',
      '.lpx-cost-item:hover { border-color: rgba(16,185,129,0.3); }',
      '.lpx-cost-item__label {',
      '  font-family: var(--font-body, "Inter", sans-serif);',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text, #e5e7eb);',
      '}',
      '.lpx-cost-item__value {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-base, 1rem);',
      '  color: #10B981;',
      '}',
      '.lpx-cost-item__value--free { color: #34D399; }',

      /* ── Action Buttons ── */
      '.lpx-btn {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  padding: 12px 24px;',
      '  border: none;',
      '  border-radius: var(--border-radius-sm, 8px);',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  cursor: pointer;',
      '  text-decoration: none;',
      '  transition: transform 0.2s, box-shadow 0.2s;',
      '  white-space: nowrap;',
      '}',
      '.lpx-btn:hover {',
      '  transform: translateY(-2px);',
      '}',
      '.lpx-btn svg { width: 16px; height: 16px; }',
      '.lpx-btn--primary {',
      '  background: linear-gradient(135deg, #10B981 0%, #0D4F4F 100%);',
      '  color: #fff;',
      '}',
      '.lpx-btn--primary:hover { box-shadow: 0 6px 20px rgba(16,185,129,0.35); color: #fff; }',
      '.lpx-btn--gold {',
      '  background: linear-gradient(135deg, #F5A623 0%, #e6951e 100%);',
      '  color: #070F1A;',
      '}',
      '.lpx-btn--gold:hover { box-shadow: 0 6px 20px rgba(245,166,35,0.35); color: #070F1A; }',
      '.lpx-btn--outline {',
      '  background: transparent;',
      '  border: 1px solid rgba(255,255,255,0.15);',
      '  color: var(--color-text, #e5e7eb);',
      '}',
      '.lpx-btn--outline:hover {',
      '  border-color: #F5A623;',
      '  color: #F5A623;',
      '  box-shadow: 0 4px 16px rgba(245,166,35,0.15);',
      '}',

      /* ── Link Buttons Row ── */
      '.lpx-btn-row {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: var(--sp-md, 0.75rem);',
      '  margin-top: var(--sp-lg, 1.25rem);',
      '}',

      /* ── Info List ── */
      '.lpx-list {',
      '  list-style: none;',
      '  padding: 0;',
      '  margin: var(--sp-md, 0.75rem) 0 0;',
      '}',
      '.lpx-list li {',
      '  display: flex;',
      '  align-items: flex-start;',
      '  gap: 10px;',
      '  padding: var(--sp-sm, 0.5rem) 0;',
      '  border-bottom: 1px solid rgba(255,255,255,0.04);',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text, #e5e7eb);',
      '  line-height: 1.6;',
      '}',
      '.lpx-list li:last-child { border-bottom: none; }',
      '.lpx-list li svg {',
      '  width: 18px;',
      '  height: 18px;',
      '  flex-shrink: 0;',
      '  margin-top: 2px;',
      '  color: #10B981;',
      '}',

      /* ── Tip / Callout Box ── */
      '.lpx-tip {',
      '  margin-top: var(--sp-lg, 1.25rem);',
      '  padding: var(--sp-md, 0.75rem) var(--sp-lg, 1rem);',
      '  background: rgba(245,166,35,0.06);',
      '  border-left: 3px solid #F5A623;',
      '  border-radius: 0 var(--border-radius-sm, 8px) var(--border-radius-sm, 8px) 0;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  line-height: 1.6;',
      '}',
      '.lpx-tip strong { color: #F5A623; }',

      '.lpx-tip--emerald {',
      '  background: rgba(16,185,129,0.06);',
      '  border-left-color: #10B981;',
      '}',
      '.lpx-tip--emerald strong { color: #10B981; }',

      /* ── Insurance Item Card ── */
      '.lpx-ins-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));',
      '  gap: var(--sp-md, 0.75rem);',
      '  margin-top: var(--sp-lg, 1.25rem);',
      '}',
      '.lpx-ins-card {',
      '  padding: var(--sp-lg, 1rem);',
      '  background: rgba(255,255,255,0.03);',
      '  border: 1px solid rgba(255,255,255,0.06);',
      '  border-radius: var(--border-radius-sm, 8px);',
      '  transition: border-color 0.3s ease, transform 0.3s ease;',
      '}',
      '.lpx-ins-card:hover {',
      '  border-color: rgba(16,185,129,0.3);',
      '  transform: translateY(-2px);',
      '}',
      '.lpx-ins-card__name {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-base, 1rem);',
      '  color: #fff;',
      '  margin-bottom: var(--sp-xs, 0.25rem);',
      '}',
      '.lpx-ins-card__desc {',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  line-height: 1.5;',
      '  margin-bottom: var(--sp-sm, 0.5rem);',
      '}',
      '.lpx-ins-card__cost {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: #10B981;',
      '}',

      /* ── Banking Grid ── */
      '.lpx-bank-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));',
      '  gap: var(--sp-md, 0.75rem);',
      '  margin-top: var(--sp-lg, 1.25rem);',
      '}',
      '.lpx-bank-item {',
      '  text-align: center;',
      '  padding: var(--sp-lg, 1rem) var(--sp-md, 0.75rem);',
      '  background: rgba(255,255,255,0.03);',
      '  border: 1px solid rgba(255,255,255,0.06);',
      '  border-radius: var(--border-radius-sm, 8px);',
      '  transition: border-color 0.3s ease;',
      '}',
      '.lpx-bank-item:hover { border-color: rgba(16,185,129,0.3); }',
      '.lpx-bank-item__name {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  color: #fff;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '}',
      '.lpx-bank-item__type {',
      '  font-size: var(--fs-xs, 0.75rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  margin-top: 4px;',
      '}',

      /* ── Section description text ── */
      '.lpx-desc {',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  line-height: 1.6;',
      '  margin-bottom: var(--sp-md, 0.75rem);',
      '}',

      /* ── Responsive ── */
      '@media (max-width: 768px) {',
      '  .lpx-breakdown { grid-template-columns: 1fr; }',
      '  .lpx-ins-grid  { grid-template-columns: 1fr; }',
      '  .lpx-bank-grid { grid-template-columns: 1fr 1fr; }',
      '  .lpx-btn-row   { flex-direction: column; }',
      '  .lpx-total-number { font-size: 2rem; }',
      '}',

      /* ── Print: hide extras to keep roadmap clean ── */
      '@media print {',
      '  .lpx-section { display: none !important; }',
      '}'

    ].join('\n');
    document.head.appendChild(style);
  }


  // ═══════════════════════════════════════════════════════
  //  SECTION 1: TOTAL COST CALCULATOR
  // ═══════════════════════════════════════════════════════
  function buildCostCalculator(d) {
    var stFees = STATE_FEES[d.stateKey] || { llc: 100, scorp: 100, nonprofit: 50, sole: 0 };
    var filingFee = stFees[d.entityKey] || 100;
    var einFee = 0;
    var licenseFee = LICENSE_COST[d.indKey] || 50;
    var insuranceFee = INSURANCE_COST[d.indKey] || 600;
    var total = filingFee + einFee + licenseFee + insuranceFee;

    var stateName = STATE_LABELS[d.stateKey] || 'Your State';

    var html = '';
    html += '<div class="lpx-header">';
    html += '  <div class="lpx-header__icon lpx-header__icon--gold">' + ICON.dollar + '</div>';
    html += '  <div>';
    html += '    <div class="lpx-title">Estimated Startup Costs</div>';
    html += '    <div class="lpx-subtitle">Based on your selections</div>';
    html += '  </div>';
    html += '</div>';

    // Big total card
    html += '<div class="lpx-cost-card">';
    html += '  <div class="lpx-total-label">Estimated Total</div>';
    html += '  <div class="lpx-total-number">' + fmtDollars(total) + '</div>';
    html += '  <div class="lpx-total-note">These are estimates. Actual costs may vary by location and provider.</div>';
    html += '</div>';

    // Breakdown grid
    html += '<div class="lpx-breakdown">';
    html += '  <div class="lpx-cost-item">';
    html += '    <span class="lpx-cost-item__label">' + stateName + ' Filing Fee</span>';
    html += '    <span class="lpx-cost-item__value">' + fmtDollars(filingFee) + '</span>';
    html += '  </div>';
    html += '  <div class="lpx-cost-item">';
    html += '    <span class="lpx-cost-item__label">EIN (Federal Tax ID)</span>';
    html += '    <span class="lpx-cost-item__value lpx-cost-item__value--free">FREE</span>';
    html += '  </div>';
    html += '  <div class="lpx-cost-item">';
    html += '    <span class="lpx-cost-item__label">Business License (est.)</span>';
    html += '    <span class="lpx-cost-item__value">' + fmtDollars(licenseFee) + '</span>';
    html += '  </div>';
    html += '  <div class="lpx-cost-item">';
    html += '    <span class="lpx-cost-item__label">Insurance (first year)</span>';
    html += '    <span class="lpx-cost-item__value">' + fmtDollars(insuranceFee) + '</span>';
    html += '  </div>';
    html += '</div>';

    var section = document.createElement('div');
    section.className = 'lpx-section';
    section.id = 'lpx-cost-calculator';
    section.innerHTML = html;
    return section;
  }


  // ═══════════════════════════════════════════════════════
  //  SECTION 2: BUSINESS NAME SEARCH
  // ═══════════════════════════════════════════════════════
  function buildNameSearch(d) {
    var stateName = STATE_LABELS[d.stateKey] || 'Your State';
    var stateUrl  = NAME_SEARCH_URLS[d.stateKey] || '';
    var slug      = slugify(d.bizName);

    var html = '';
    html += '<div class="lpx-header">';
    html += '  <div class="lpx-header__icon lpx-header__icon--emerald">' + ICON.search + '</div>';
    html += '  <div>';
    html += '    <div class="lpx-title">Check Name Availability</div>';
    html += '    <div class="lpx-subtitle">Before filing, make sure your business name is available in your state.</div>';
    html += '  </div>';
    html += '</div>';

    html += '<p class="lpx-desc">Search for "<strong style="color:#fff;">' + escHtml(d.bizName) + '</strong>" across state records, federal trademarks, and domain registrars to ensure the name is not already taken.</p>';

    html += '<div class="lpx-btn-row">';
    if (stateUrl) {
      html += '<a href="' + stateUrl + '" target="_blank" rel="noopener" class="lpx-btn lpx-btn--primary">';
      html += ICON.external + ' Search ' + stateName + ' Records</a>';
    }
    html += '<a href="https://tmsearch.uspto.gov/bin/gate.exe?f=tess&state=4805:u4i7dv.1.1" target="_blank" rel="noopener" class="lpx-btn lpx-btn--gold">';
    html += ICON.external + ' USPTO Trademark Search</a>';
    html += '<a href="https://www.namecheap.com/domains/registration/results/?domain=' + slug + '" target="_blank" rel="noopener" class="lpx-btn lpx-btn--outline">';
    html += ICON.external + ' Check Domain</a>';
    html += '</div>';

    var section = document.createElement('div');
    section.className = 'lpx-section';
    section.id = 'lpx-name-search';
    section.innerHTML = html;
    return section;
  }


  // ═══════════════════════════════════════════════════════
  //  SECTION 3: BANKING SETUP GUIDE
  // ═══════════════════════════════════════════════════════
  function buildBankingGuide(d) {
    var html = '';
    html += '<div class="lpx-header">';
    html += '  <div class="lpx-header__icon lpx-header__icon--teal">' + ICON.bank + '</div>';
    html += '  <div>';
    html += '    <div class="lpx-title">Open a Business Bank Account</div>';
    html += '    <div class="lpx-subtitle">Separate your personal and business finances from day one.</div>';
    html += '  </div>';
    html += '</div>';

    // When to open
    html += '<div class="lpx-tip lpx-tip--emerald">';
    html += '  <strong>When to open:</strong> After receiving your formation documents and EIN confirmation letter.';
    html += '</div>';

    // What to bring
    html += '<h4 style="margin-top:var(--sp-lg,1.25rem);font-family:var(--font-heading);font-weight:700;font-size:var(--fs-base,1rem);color:#fff;">What to Bring</h4>';
    html += '<ul class="lpx-list">';
    html += '  <li>' + ICON.check + ' <span>Formation documents (Articles of Organization / Incorporation)</span></li>';
    html += '  <li>' + ICON.check + ' <span>EIN confirmation letter (CP 575)</span></li>';
    html += '  <li>' + ICON.check + ' <span>Valid government-issued photo ID</span></li>';
    html += '  <li>' + ICON.check + ' <span>Proof of business address</span></li>';
    html += '</ul>';

    // Recommended banks
    html += '<h4 style="margin-top:var(--sp-lg,1.25rem);font-family:var(--font-heading);font-weight:700;font-size:var(--fs-base,1rem);color:#fff;">Recommended for Small Business</h4>';
    html += '<div class="lpx-bank-grid">';
    html += '  <div class="lpx-bank-item"><div class="lpx-bank-item__name">Local Credit Union</div><div class="lpx-bank-item__type">Lower fees, local support</div></div>';
    html += '  <div class="lpx-bank-item"><div class="lpx-bank-item__name">Chase</div><div class="lpx-bank-item__type">Wide branch network</div></div>';
    html += '  <div class="lpx-bank-item"><div class="lpx-bank-item__name">Bank of America</div><div class="lpx-bank-item__type">Integrated tools</div></div>';
    html += '  <div class="lpx-bank-item"><div class="lpx-bank-item__name">Relay</div><div class="lpx-bank-item__type">Online, no fees</div></div>';
    html += '</div>';

    // Tips
    html += '<h4 style="margin-top:var(--sp-lg,1.25rem);font-family:var(--font-heading);font-weight:700;font-size:var(--fs-base,1rem);color:#fff;">Banking Tips</h4>';
    html += '<ul class="lpx-list">';
    html += '  <li>' + ICON.creditCard + ' <span>Keep personal and business finances completely separate at all times.</span></li>';
    html += '  <li>' + ICON.creditCard + ' <span>Get a business debit card for everyday expenses and build transaction history.</span></li>';
    html += '  <li>' + ICON.creditCard + ' <span>Set up accounting software (Wave, QuickBooks, or FreshBooks) from day one.</span></li>';
    html += '</ul>';

    var section = document.createElement('div');
    section.className = 'lpx-section';
    section.id = 'lpx-banking-guide';
    section.innerHTML = html;
    return section;
  }


  // ═══════════════════════════════════════════════════════
  //  SECTION 4: TAX REGISTRATION GUIDE
  // ═══════════════════════════════════════════════════════
  function buildTaxGuide(d) {
    var stateName = STATE_LABELS[d.stateKey] || 'Your State';
    var guidance  = TAX_GUIDANCE[d.indKey] || 'Check with your state revenue department for sales tax requirements.';
    var isSole    = d.entityKey === 'sole';

    var html = '';
    html += '<div class="lpx-header">';
    html += '  <div class="lpx-header__icon lpx-header__icon--gold">' + ICON.tax + '</div>';
    html += '  <div>';
    html += '    <div class="lpx-title">Register for Taxes</div>';
    html += '    <div class="lpx-subtitle">Federal and state tax obligations for your business.</div>';
    html += '  </div>';
    html += '</div>';

    // Federal
    html += '<h4 style="font-family:var(--font-heading);font-weight:700;font-size:var(--fs-base,1rem);color:#fff;">Federal Taxes</h4>';
    html += '<ul class="lpx-list">';
    html += '  <li>' + ICON.check + ' <span><strong style="color:#fff;">EIN (Employer Identification Number):</strong> Already covered in your roadmap documents above. Apply free at IRS.gov.</span></li>';
    html += '</ul>';

    // State
    html += '<h4 style="margin-top:var(--sp-lg,1.25rem);font-family:var(--font-heading);font-weight:700;font-size:var(--fs-base,1rem);color:#fff;">State Taxes (' + escHtml(stateName) + ')</h4>';

    // Industry-specific sales tax guidance
    html += '<div class="lpx-tip">';
    html += '  <strong>Sales Tax for ' + escHtml(INDUSTRY_LABELS[d.indKey] || 'your industry') + ':</strong> ' + escHtml(guidance);
    html += '</div>';

    html += '<ul class="lpx-list" style="margin-top:var(--sp-md,0.75rem);">';
    html += '  <li>' + ICON.check + ' <span>Register with your ' + escHtml(stateName) + ' Department of Revenue for applicable state taxes.</span></li>';
    html += '</ul>';

    // Self-employment tax (sole props)
    if (isSole) {
      html += '<div class="lpx-tip lpx-tip--emerald" style="margin-top:var(--sp-md,0.75rem);">';
      html += '  <strong>Self-Employment Tax Note:</strong> As a sole proprietor, you are responsible for self-employment tax (Social Security + Medicare) of 15.3% on net business income, reported on Schedule SE with your personal tax return.';
      html += '</div>';
    }

    // Quarterly estimated taxes
    html += '<h4 style="margin-top:var(--sp-lg,1.25rem);font-family:var(--font-heading);font-weight:700;font-size:var(--fs-base,1rem);color:#fff;">Quarterly Estimated Taxes</h4>';
    html += '<div class="lpx-tip">';
    html += '  <strong>' + ICON.alertTri + ' Reminder:</strong> If you expect to owe $1,000+ in taxes, the IRS requires quarterly estimated tax payments. Due dates are April 15, June 15, September 15, and January 15. Use <a href="https://www.irs.gov/forms-pubs/about-form-1040-es" target="_blank" rel="noopener" style="color:#F5A623;text-decoration:underline;">IRS Form 1040-ES</a> to calculate and pay.';
    html += '</div>';

    var section = document.createElement('div');
    section.className = 'lpx-section';
    section.id = 'lpx-tax-guide';
    section.innerHTML = html;
    return section;
  }


  // ═══════════════════════════════════════════════════════
  //  SECTION 5: INSURANCE CHECKLIST
  // ═══════════════════════════════════════════════════════
  function buildInsuranceChecklist(d) {
    // Filter to only the types relevant to this industry
    var relevant = INSURANCE_TYPES.filter(function(ins) {
      return ins.industries.indexOf(d.indKey) !== -1;
    });

    var html = '';
    html += '<div class="lpx-header">';
    html += '  <div class="lpx-header__icon lpx-header__icon--emerald">' + ICON.shield + '</div>';
    html += '  <div>';
    html += '    <div class="lpx-title">Get Business Insurance</div>';
    html += '    <div class="lpx-subtitle">Recommended coverage for ' + escHtml(INDUSTRY_LABELS[d.indKey] || 'your industry') + '</div>';
    html += '  </div>';
    html += '</div>';

    html += '<p class="lpx-desc">Based on your industry, here are the types of insurance you should consider. Costs are annual estimates and vary by coverage limits, location, and provider.</p>';

    html += '<div class="lpx-ins-grid">';
    for (var i = 0; i < relevant.length; i++) {
      var ins = relevant[i];
      html += '<div class="lpx-ins-card">';
      html += '  <div class="lpx-ins-card__name">' + escHtml(ins.name) + '</div>';
      html += '  <div class="lpx-ins-card__desc">' + escHtml(ins.desc) + '</div>';
      html += '  <div class="lpx-ins-card__cost">' + escHtml(ins.cost) + '/year</div>';
      html += '</div>';
    }
    html += '</div>';

    // Workers comp note
    html += '<div class="lpx-tip" style="margin-top:var(--sp-lg,1.25rem);">';
    html += '  <strong>Workers Compensation:</strong> Required in most states once you hire your first employee. Check your state requirements before making your first hire.';
    html += '</div>';

    // Compare quotes link
    html += '<div class="lpx-btn-row" style="margin-top:var(--sp-lg,1.25rem);">';
    html += '  <a href="https://www.thehartford.com/business-insurance" target="_blank" rel="noopener" class="lpx-btn lpx-btn--primary">' + ICON.external + ' Compare Insurance Quotes</a>';
    html += '  <a href="https://www.nextinsurance.com/" target="_blank" rel="noopener" class="lpx-btn lpx-btn--outline">' + ICON.external + ' Next Insurance (Online)</a>';
    html += '</div>';

    var section = document.createElement('div');
    section.className = 'lpx-section';
    section.id = 'lpx-insurance-checklist';
    section.innerHTML = html;
    return section;
  }


  // ─── ESCAPE HTML ──────────────────────────────────────
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }


  // ═══════════════════════════════════════════════════════
  //  INJECT ALL SECTIONS
  // ═══════════════════════════════════════════════════════
  var extrasInjected = false;

  function injectExtras() {
    if (extrasInjected) return;

    var checklist = document.getElementById('checklist-container');
    if (!checklist) return;
    // Wait until the checklist has rendered content
    if (checklist.children.length === 0) return;

    var step4 = document.getElementById('step-4');
    if (!step4) return;

    extrasInjected = true;
    injectStyles();

    var d = getData();

    // Build all five sections
    var costCalc   = buildCostCalculator(d);
    var nameSearch = buildNameSearch(d);
    var banking    = buildBankingGuide(d);
    var taxGuide   = buildTaxGuide(d);
    var insurance  = buildInsuranceChecklist(d);

    // Insert cost calculator BEFORE the checklist (top of step-4 content area)
    // We place it after the Bella celebration mascot but before the checklist.
    checklist.parentNode.insertBefore(costCalc, checklist);

    // Insert remaining sections AFTER the checklist, in order
    var insertAfter = checklist;
    var sections = [nameSearch, banking, taxGuide, insurance];
    for (var i = 0; i < sections.length; i++) {
      if (insertAfter.nextSibling) {
        insertAfter.parentNode.insertBefore(sections[i], insertAfter.nextSibling);
      } else {
        insertAfter.parentNode.appendChild(sections[i]);
      }
      insertAfter = sections[i];
    }
  }


  /** Remove all extras (for start-over resets). */
  function removeExtras() {
    var ids = [
      'lpx-cost-calculator',
      'lpx-name-search',
      'lpx-banking-guide',
      'lpx-tax-guide',
      'lpx-insurance-checklist'
    ];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.remove();
    }
    extrasInjected = false;
  }


  // ═══════════════════════════════════════════════════════
  //  DETECT STEP-4 ACTIVATION
  // ═══════════════════════════════════════════════════════

  // Strategy 1: MutationObserver on step-4 class changes
  function watchStep4() {
    var step4 = document.getElementById('step-4');
    if (!step4) return;

    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'class') {
          if (step4.classList.contains('active')) {
            setTimeout(injectExtras, 250);
          }
        }
      }
    });
    observer.observe(step4, { attributes: true });

    // Also watch the checklist for child additions
    var checklist = document.getElementById('checklist-container');
    if (checklist) {
      var childObserver = new MutationObserver(function() {
        if (step4.classList.contains('active') && checklist.children.length > 0) {
          setTimeout(injectExtras, 150);
        }
      });
      childObserver.observe(checklist, { childList: true });
    }
  }


  // Strategy 2: Hook into generateRoadmap
  function hookRoadmap() {
    if (typeof window.generateRoadmap === 'function') {
      var original = window.generateRoadmap;
      window.generateRoadmap = function() {
        // Reset so we can re-inject with fresh data
        removeExtras();
        original.apply(this, arguments);
        setTimeout(injectExtras, 350);
      };
    }
  }


  // Strategy 3: Hook into startOver
  function hookStartOver() {
    if (typeof window.startOver === 'function') {
      var originalStartOver = window.startOver;
      window.startOver = function() {
        removeExtras();
        originalStartOver.apply(this, arguments);
      };
    }
  }


  // ─── INIT ─────────────────────────────────────────────
  function init() {
    watchStep4();
    hookRoadmap();
    hookStartOver();

    // If step-4 is already active on load (e.g. page reload)
    var step4 = document.getElementById('step-4');
    if (step4 && step4.classList.contains('active')) {
      setTimeout(injectExtras, 350);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
