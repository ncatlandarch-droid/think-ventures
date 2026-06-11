/* =====================================================
   THINK! VENTURES -- LaunchPad Document Generator
   Generates downloadable formation documents from
   wizard answers. Injects UI into step-4 (Roadmap).
   ===================================================== */

(function DocGenerator() {
  'use strict';

  // ─── STATE-SPECIFIC FILING DATA ───────────────────────
  // Filing fees, SOS links, and processing times for
  // common states. Unlisted states get generic info.
  const STATE_DATA = {
    nc: {
      name: 'North Carolina',
      abbr: 'NC',
      sosUrl: 'https://www.sosnc.gov/online_services/search/by_title/_Business_Registration',
      sosName: 'NC Secretary of State',
      fees: { llc: 125, scorp: 125, nonprofit: 60, sole: 0 },
      processingTime: '3-5 business days',
      annualReport: 'Annual Report due April 15 -- $200 (LLC), $25 (Corp/Nonprofit)',
      articleTitle: { llc: 'Articles of Organization', scorp: 'Articles of Incorporation', nonprofit: 'Articles of Incorporation' },
      statute: { llc: 'N.C.G.S. Chapter 57D', scorp: 'N.C.G.S. Chapter 55', nonprofit: 'N.C.G.S. Chapter 55A' }
    },
    va: {
      name: 'Virginia',
      abbr: 'VA',
      sosUrl: 'https://www.scc.virginia.gov/pages/Business-Entity-Search',
      sosName: 'VA State Corporation Commission',
      fees: { llc: 100, scorp: 75, nonprofit: 75, sole: 0 },
      processingTime: '3-5 business days',
      annualReport: 'Annual Registration Fee -- $50 (LLC/Corp)',
      articleTitle: { llc: 'Articles of Organization', scorp: 'Articles of Incorporation', nonprofit: 'Articles of Incorporation' },
      statute: { llc: 'VA Code Title 13.1 Ch. 12', scorp: 'VA Code Title 13.1 Ch. 9', nonprofit: 'VA Code Title 13.1 Ch. 10' }
    },
    sc: {
      name: 'South Carolina',
      abbr: 'SC',
      sosUrl: 'https://businessfilings.sc.gov/businessfiling',
      sosName: 'SC Secretary of State',
      fees: { llc: 110, scorp: 135, nonprofit: 25, sole: 0 },
      processingTime: '5-7 business days',
      annualReport: 'No annual report for LLCs; Corps file annually -- $0',
      articleTitle: { llc: 'Articles of Organization', scorp: 'Articles of Incorporation', nonprofit: 'Articles of Incorporation' },
      statute: { llc: 'SC Code Title 33 Ch. 44', scorp: 'SC Code Title 33 Ch. 1-20', nonprofit: 'SC Code Title 33 Ch. 31' }
    },
    ga: {
      name: 'Georgia',
      abbr: 'GA',
      sosUrl: 'https://ecorp.sos.ga.gov/BusinessSearch',
      sosName: 'GA Secretary of State',
      fees: { llc: 100, scorp: 100, nonprofit: 100, sole: 0 },
      processingTime: '7-10 business days',
      annualReport: 'Annual Registration -- $50 (LLC/Corp)',
      articleTitle: { llc: 'Articles of Organization', scorp: 'Articles of Incorporation', nonprofit: 'Articles of Incorporation' },
      statute: { llc: 'O.C.G.A. Title 14 Ch. 11', scorp: 'O.C.G.A. Title 14 Ch. 2', nonprofit: 'O.C.G.A. Title 14 Ch. 3' }
    },
    tx: {
      name: 'Texas',
      abbr: 'TX',
      sosUrl: 'https://www.sos.state.tx.us/corp/sosda/index.shtml',
      sosName: 'TX Secretary of State',
      fees: { llc: 300, scorp: 300, nonprofit: 25, sole: 0 },
      processingTime: '5-7 business days',
      annualReport: 'Franchise Tax Report due May 15 annually',
      articleTitle: { llc: 'Certificate of Formation', scorp: 'Certificate of Formation', nonprofit: 'Certificate of Formation' },
      statute: { llc: 'Texas Business Organizations Code Ch. 101', scorp: 'Texas BOC Ch. 21', nonprofit: 'Texas BOC Ch. 22' }
    },
    ny: {
      name: 'New York',
      abbr: 'NY',
      sosUrl: 'https://www.dos.ny.gov/corps/bus_entity_search.html',
      sosName: 'NY Department of State',
      fees: { llc: 200, scorp: 125, nonprofit: 75, sole: 0 },
      processingTime: '7-14 business days',
      annualReport: 'Biennial Statement -- $9 (LLC); Annual -- $9 (Corp)',
      articleTitle: { llc: 'Articles of Organization', scorp: 'Certificate of Incorporation', nonprofit: 'Certificate of Incorporation' },
      statute: { llc: 'NY LLC Law', scorp: 'NY Business Corporation Law', nonprofit: 'NY Not-for-Profit Corporation Law' }
    },
    ca: {
      name: 'California',
      abbr: 'CA',
      sosUrl: 'https://bizfileonline.sos.ca.gov/search/business',
      sosName: 'CA Secretary of State',
      fees: { llc: 70, scorp: 100, nonprofit: 30, sole: 0 },
      processingTime: '5-10 business days',
      annualReport: '$800 minimum franchise tax (LLC/Corp); Statement of Information -- $20 (LLC) / $25 (Corp)',
      articleTitle: { llc: 'Articles of Organization', scorp: 'Articles of Incorporation', nonprofit: 'Articles of Incorporation' },
      statute: { llc: 'CA Corp Code Title 2.6', scorp: 'CA Corp Code Title 1 Div. 1', nonprofit: 'CA Corp Code Title 1 Div. 2' }
    },
    fl: {
      name: 'Florida',
      abbr: 'FL',
      sosUrl: 'https://dos.fl.gov/sunbiz/search/',
      sosName: 'FL Division of Corporations (Sunbiz)',
      fees: { llc: 125, scorp: 70, nonprofit: 35, sole: 0 },
      processingTime: '3-5 business days',
      annualReport: 'Annual Report -- $138.75 (LLC/Corp); $61.25 (Nonprofit)',
      articleTitle: { llc: 'Articles of Organization', scorp: 'Articles of Incorporation', nonprofit: 'Articles of Incorporation' },
      statute: { llc: 'FL Statutes Ch. 605', scorp: 'FL Statutes Ch. 607', nonprofit: 'FL Statutes Ch. 617' }
    }
  };

  // Fallback for unlisted states
  const GENERIC_STATE = {
    name: 'Your State',
    abbr: '--',
    sosUrl: '',
    sosName: 'Your Secretary of State',
    fees: { llc: 100, scorp: 100, nonprofit: 50, sole: 0 },
    processingTime: '5-10 business days (varies)',
    annualReport: 'Check your state SOS website for annual filing requirements.',
    articleTitle: { llc: 'Articles of Organization', scorp: 'Articles of Incorporation', nonprofit: 'Articles of Incorporation' },
    statute: { llc: 'Consult your state LLC act', scorp: 'Consult your state business corporation act', nonprofit: 'Consult your state nonprofit corporation act' }
  };

  // ─── INDUSTRY DISPLAY NAMES ──────────────────────────
  const INDUSTRY_LABELS = {
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

  // ─── ENTITY DISPLAY NAMES ────────────────────────────
  const ENTITY_LABELS = {
    'llc': 'Limited Liability Company (LLC)',
    'sole': 'Sole Proprietorship',
    'scorp': 'S-Corporation',
    'nonprofit': '501(c)(3) Nonprofit Corporation'
  };

  const ENTITY_SHORT = {
    'llc': 'LLC',
    'sole': 'Sole Proprietorship',
    'scorp': 'S-Corporation',
    'nonprofit': 'Nonprofit Corporation'
  };


  // ─── HELPER: RESOLVE STATE DATA ──────────────────────
  function getStateData(stateKey) {
    if (!stateKey) return GENERIC_STATE;
    const key = stateKey.toLowerCase();
    // Try direct match first (wizard uses 'nc', 'fl', etc.)
    if (STATE_DATA[key]) return STATE_DATA[key];
    // Try matching by abbreviation for globals like 'NC'
    for (const k of Object.keys(STATE_DATA)) {
      if (STATE_DATA[k].abbr.toLowerCase() === key) return STATE_DATA[k];
    }
    return GENERIC_STATE;
  }


  // ─── HELPER: GET WIZARD DATA ─────────────────────────
  // Reads from the global `selections` object and form
  // fields that the wizard populates.
  function getWizardData() {
    const sel = window.selections || {};
    const bizNameEl = document.getElementById('biz-name');
    const bizDescEl = document.getElementById('biz-desc');

    const stateKey = sel.state || (typeof window.selectedState === 'string' ? window.selectedState : '');
    const entityKey = sel.entity || (typeof window.selectedEntity === 'string' ? window.selectedEntity : '');
    const industryKey = sel.industry || (typeof window.selectedIndustry === 'string' ? window.selectedIndustry : '');
    const bizName = sel.name || (bizNameEl ? bizNameEl.value : '') || 'Your Business';
    const bizDesc = sel.desc || (bizDescEl ? bizDescEl.value : '') || '';

    return {
      stateKey,
      entityKey,
      industryKey,
      bizName,
      bizDesc,
      state: getStateData(stateKey),
      entityLabel: ENTITY_LABELS[entityKey] || entityKey || 'LLC',
      entityShort: ENTITY_SHORT[entityKey] || entityKey || 'LLC',
      industryLabel: INDUSTRY_LABELS[industryKey] || industryKey || 'General Business'
    };
  }


  // ─── HELPER: FORMATTED DATE ──────────────────────────
  function fmtDate() {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function fmtYear() {
    return new Date().getFullYear();
  }


  // ─── PRINT-READY HTML WRAPPER ────────────────────────
  // Every generated document shares this professional
  // styling shell. Outfit for headings, Inter for body.
  function htmlShell(title, bodyContent) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  /* ── Reset ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Page ── */
  html { font-size: 14px; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a1a2e;
    line-height: 1.7;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Typography ── */
  h1, h2, h3, h4, h5 { font-family: 'Outfit', sans-serif; line-height: 1.25; }
  h1 { font-size: 2rem; font-weight: 800; color: #070F1A; margin-bottom: 0.5rem; }
  h2 { font-size: 1.5rem; font-weight: 700; color: #0D4F4F; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 2px solid #10B981; padding-bottom: 0.35rem; }
  h3 { font-size: 1.15rem; font-weight: 700; color: #070F1A; margin-top: 1.5rem; margin-bottom: 0.5rem; }
  h4 { font-size: 1rem; font-weight: 600; color: #0D4F4F; margin-top: 1rem; margin-bottom: 0.35rem; }
  p { margin-bottom: 0.75rem; }
  ul, ol { margin-bottom: 0.75rem; padding-left: 1.5rem; }
  li { margin-bottom: 0.35rem; }

  /* ── Page container ── */
  .doc-page {
    max-width: 8.5in;
    margin: 0 auto;
    padding: 1in 1.25in;
  }

  /* ── Cover page ── */
  .cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    page-break-after: always;
    border-bottom: 4px solid #10B981;
  }
  .cover__brand { font-family: 'Outfit', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #F5A623; margin-bottom: 2rem; }
  .cover__title { font-family: 'Outfit', sans-serif; font-size: 2.5rem; font-weight: 800; color: #070F1A; margin-bottom: 0.5rem; }
  .cover__subtitle { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 600; color: #0D4F4F; margin-bottom: 2rem; }
  .cover__line { width: 80px; height: 4px; background: linear-gradient(90deg, #10B981, #F5A623); border-radius: 2px; margin-bottom: 2rem; }
  .cover__meta { font-size: 0.9rem; color: #6b7280; line-height: 1.8; }
  .cover__meta strong { color: #070F1A; }

  /* ── Section break ── */
  .section-break { page-break-before: always; }

  /* ── Table ── */
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  th, td { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; text-align: left; font-size: 0.9rem; }
  th { background: #0D4F4F; color: #fff; font-family: 'Outfit', sans-serif; font-weight: 600; }
  td { background: #f9fafb; }
  tr:nth-child(even) td { background: #fff; }

  /* ── Callout ── */
  .callout {
    background: #f0fdf4;
    border-left: 4px solid #10B981;
    padding: 0.75rem 1rem;
    margin: 1rem 0;
    border-radius: 0 6px 6px 0;
    font-size: 0.9rem;
  }
  .callout--gold {
    background: #fffbeb;
    border-left-color: #F5A623;
  }
  .callout strong { color: #0D4F4F; }

  /* ── Signature line ── */
  .sig-line {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    gap: 2rem;
  }
  .sig-block {
    flex: 1;
    border-top: 1px solid #1a1a2e;
    padding-top: 0.35rem;
    font-size: 0.85rem;
    color: #6b7280;
  }

  /* ── Footer ── */
  .doc-footer {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid #d1d5db;
    font-size: 0.75rem;
    color: #9ca3af;
    text-align: center;
  }

  /* ── Blank line for fill-in ── */
  .blank { border-bottom: 1px solid #6b7280; display: inline-block; min-width: 200px; }
  .blank--full { width: 100%; display: block; height: 1.5rem; border-bottom: 1px solid #6b7280; margin-bottom: 0.5rem; }

  /* ── Print overrides ── */
  @media print {
    body { font-size: 12pt; }
    .doc-page { padding: 0.75in 1in; max-width: none; }
    .cover { min-height: auto; padding: 3in 0; }
    .no-print { display: none !important; }
    a { color: #0D4F4F; text-decoration: none; }
  }

  /* ── Print button (screen only) ── */
  .print-bar {
    position: fixed;
    top: 0; left: 0; right: 0;
    background: #070F1A;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 9999;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .print-bar__title { font-family: 'Outfit', sans-serif; font-weight: 700; color: #F5A623; font-size: 0.9rem; }
  .print-bar__btn {
    padding: 8px 20px;
    background: #10B981;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .print-bar__btn:hover { background: #0D4F4F; }
  @media print { .print-bar { display: none; } }
</style>
</head>
<body>
<div class="print-bar no-print">
  <span class="print-bar__title">THINK! VENTURES -- Document Preview</span>
  <button class="print-bar__btn" onclick="window.print()">Print / Save PDF</button>
</div>
<div class="doc-page" style="padding-top: 60px;">
${bodyContent}
<div class="doc-footer">
  Generated by Think! Ventures LaunchPad &mdash; ${fmtDate()}<br>
  This document is a template and does not constitute legal advice. Consult a licensed attorney in your state.
</div>
</div>
</body>
</html>`;
  }


  // ═══════════════════════════════════════════════════════
  //  DOCUMENT 1: BUSINESS PLAN
  // ═══════════════════════════════════════════════════════
  function generateBusinessPlan() {
    const d = getWizardData();
    const execSummary = d.bizDesc
      ? d.bizDesc
      : `${d.bizName} is a ${d.industryLabel.toLowerCase()} venture incorporated as a ${d.entityShort} in the state of ${d.state.name}. The company is positioned to serve its target market by providing high-quality products and services that address unmet demand in the region.`;

    // Industry-specific market analysis content
    const marketContent = {
      'home-services': 'The home services industry in the United States generates over $600 billion annually, with consistent growth driven by aging housing stock and increasing demand for maintenance and renovation. Key trends include digital booking platforms, subscription maintenance plans, and eco-friendly service offerings. Local market opportunities exist in residential cleaning, landscaping, plumbing, HVAC, and handyman services.',
      'food-beverage': 'The U.S. food and beverage industry exceeds $900 billion in annual revenue. Consumer trends favor locally sourced ingredients, health-conscious menus, and diverse cultural cuisines. The food truck and fast-casual segments show particularly strong growth. Online ordering and delivery services have become essential revenue channels.',
      'health-beauty': 'The health and beauty services market in the U.S. is valued at over $100 billion and growing at approximately 5% annually. Key drivers include self-care trends, social media marketing, and specialized treatments. Mobile beauty services and wellness-focused offerings represent high-growth niches.',
      'professional': 'Professional services firms benefit from low overhead costs, high margins, and scalable business models. The U.S. professional services market exceeds $2 trillion. Key growth areas include digital marketing, financial consulting, IT advisory, and legal technology. Remote service delivery has expanded addressable markets beyond geographic boundaries.',
      'retail': 'U.S. retail sales exceed $7 trillion annually, with e-commerce capturing a growing share. Small retailers succeed by focusing on niche markets, personalized service, and omnichannel strategies. Print-on-demand and dropshipping models reduce inventory risk for new entrants.',
      'creative': 'The creative economy contributes over $900 billion to U.S. GDP. Demand for content creation, graphic design, video production, and branding continues to accelerate. Freelance and agency models both offer viable paths, with project-based pricing and retainer agreements providing revenue stability.',
      'construction': 'The U.S. construction industry is valued at over $1.8 trillion. Residential construction, renovation, and specialty trades remain in high demand due to housing shortages and aging infrastructure. Successful firms differentiate through quality, reliability, licensing, and strong safety records.',
      'tech': 'The U.S. technology sector exceeds $1.8 trillion in revenue. SaaS, IT services, app development, and cybersecurity represent high-growth segments. Low capital requirements and global market access make technology an attractive industry for new ventures.',
      'education': 'The U.S. education and training market exceeds $1.3 trillion. Online learning, professional development, and tutoring services show strong growth. Technology-enabled delivery and credentialing partnerships create scalable business models.'
    };

    // Entity-specific operations plan
    const opsContent = {
      'llc': `As a Limited Liability Company, ${d.bizName} operates under a member-managed structure unless an Operating Agreement specifies manager management. Key operational considerations include:\n<ul><li>Member roles, responsibilities, and capital contributions</li><li>Profit and loss distribution among members</li><li>Decision-making protocols and voting thresholds</li><li>Banking and financial management procedures</li><li>Annual reporting and compliance with ${d.state.name} Secretary of State</li></ul>`,
      'sole': `As a Sole Proprietorship, ${d.bizName} is owned and operated by a single individual. This structure offers maximum simplicity but requires the owner to assume all liability. Key operational considerations include:\n<ul><li>Personal liability management and insurance coverage</li><li>Separate business bank account for financial clarity</li><li>Self-employment tax obligations (Schedule SE)</li><li>DBA (Doing Business As) registration if operating under a trade name</li><li>Maintaining clear records for tax purposes</li></ul>`,
      'scorp': `As an S-Corporation, ${d.bizName} benefits from pass-through taxation while maintaining corporate structure. Key operational considerations include:\n<ul><li>Board of Directors governance and meeting requirements</li><li>Officer compensation and reasonable salary requirements</li><li>Shareholder distributions and dividend policies</li><li>Annual meeting and minutes documentation</li><li>S-Election filing (IRS Form 2553) and compliance</li><li>Annual reporting to ${d.state.name} Secretary of State</li></ul>`,
      'nonprofit': `As a 501(c)(3) Nonprofit Corporation, ${d.bizName} operates exclusively for charitable, educational, or scientific purposes. Key operational considerations include:\n<ul><li>Board of Directors governance (minimum 3 directors recommended)</li><li>Conflict of interest and compensation policies</li><li>Program delivery and impact measurement</li><li>Fundraising, grant management, and donor stewardship</li><li>IRS Form 990 annual filing requirements</li><li>State charitable solicitation registration</li><li>Maintaining tax-exempt status compliance</li></ul>`
    };

    const body = `
<!-- Cover Page -->
<div class="cover">
  <div class="cover__brand">Think! Ventures LaunchPad</div>
  <div class="cover__title">${esc(d.bizName)}</div>
  <div class="cover__subtitle">Business Plan</div>
  <div class="cover__line"></div>
  <div class="cover__meta">
    <strong>Entity Type:</strong> ${esc(d.entityLabel)}<br>
    <strong>State of Formation:</strong> ${esc(d.state.name)}<br>
    <strong>Industry:</strong> ${esc(d.industryLabel)}<br>
    <strong>Date Prepared:</strong> ${fmtDate()}
  </div>
</div>

<!-- Table of Contents -->
<h2>Table of Contents</h2>
<ol>
  <li>Executive Summary</li>
  <li>Business Description</li>
  <li>Market Analysis</li>
  <li>Operations Plan</li>
  <li>Financial Projections</li>
</ol>

<!-- Section 1 -->
<h2 class="section-break">1. Executive Summary</h2>
<p>${esc(execSummary)}</p>
<div class="callout">
  <strong>Mission Statement:</strong> ${esc(d.bizName)} is committed to delivering exceptional value to its customers through quality, innovation, and community-focused service in the ${esc(d.industryLabel.toLowerCase())} sector.
</div>
<h4>Business Highlights</h4>
<table>
  <tr><th>Item</th><th>Detail</th></tr>
  <tr><td>Business Name</td><td>${esc(d.bizName)}</td></tr>
  <tr><td>Entity Type</td><td>${esc(d.entityLabel)}</td></tr>
  <tr><td>State of Formation</td><td>${esc(d.state.name)}</td></tr>
  <tr><td>Industry</td><td>${esc(d.industryLabel)}</td></tr>
  <tr><td>Formation Filing Fee</td><td>$${d.state.fees[d.entityKey] || 0}</td></tr>
</table>

<!-- Section 2 -->
<h2 class="section-break">2. Business Description</h2>
<p>${esc(d.bizName)} is a ${esc(d.entityShort)} organized under the laws of ${esc(d.state.name)} operating in the ${esc(d.industryLabel.toLowerCase())} industry.</p>
${d.bizDesc ? '<p>' + esc(d.bizDesc) + '</p>' : ''}
<h4>Legal Structure</h4>
<p>The business is structured as a <strong>${esc(d.entityLabel)}</strong>, which provides ${d.entityKey === 'llc' ? 'personal asset protection with pass-through taxation' : d.entityKey === 'sole' ? 'simplicity of operation with direct ownership' : d.entityKey === 'scorp' ? 'corporate liability protection with pass-through tax benefits' : 'tax-exempt status for charitable activities'}.</p>
<h4>Products / Services</h4>
<p><em>[Describe your primary products or services, pricing model, and unique value proposition here.]</em></p>

<!-- Section 3 -->
<h2 class="section-break">3. Market Analysis</h2>
<h3>Industry Overview</h3>
<p>${marketContent[d.industryKey] || marketContent['professional']}</p>
<h3>Target Market</h3>
<p><em>[Define your target customer demographics, psychographics, geographic focus, and estimated market size.]</em></p>
<h3>Competitive Analysis</h3>
<table>
  <tr><th>Competitor</th><th>Strengths</th><th>Weaknesses</th><th>Your Advantage</th></tr>
  <tr><td><em>[Competitor 1]</em></td><td><em>[Strengths]</em></td><td><em>[Weaknesses]</em></td><td><em>[Your edge]</em></td></tr>
  <tr><td><em>[Competitor 2]</em></td><td><em>[Strengths]</em></td><td><em>[Weaknesses]</em></td><td><em>[Your edge]</em></td></tr>
  <tr><td><em>[Competitor 3]</em></td><td><em>[Strengths]</em></td><td><em>[Weaknesses]</em></td><td><em>[Your edge]</em></td></tr>
</table>

<!-- Section 4 -->
<h2 class="section-break">4. Operations Plan</h2>
<h3>Organizational Structure</h3>
${opsContent[d.entityKey] || opsContent['llc']}
<h3>Location & Facilities</h3>
<p><em>[Describe your physical location, home office, coworking space, or virtual operations. Include lease terms if applicable.]</em></p>
<h3>Technology & Tools</h3>
<p><em>[List key software, platforms, and tools you will use to run the business.]</em></p>

<!-- Section 5 -->
<h2 class="section-break">5. Financial Projections</h2>
<div class="callout callout--gold">
  <strong>Note:</strong> The tables below are templates. Fill in your projected numbers based on your market research and pricing strategy.
</div>
<h3>Startup Costs</h3>
<table>
  <tr><th>Expense</th><th>Amount</th></tr>
  <tr><td>Entity Formation Filing Fee</td><td>$${d.state.fees[d.entityKey] || 0}</td></tr>
  <tr><td>Business Licenses & Permits</td><td>$<span class="blank" style="min-width:80px;"></span></td></tr>
  <tr><td>Insurance (first 3 months)</td><td>$<span class="blank" style="min-width:80px;"></span></td></tr>
  <tr><td>Equipment & Supplies</td><td>$<span class="blank" style="min-width:80px;"></span></td></tr>
  <tr><td>Marketing & Branding</td><td>$0 (via Think! LaunchPad)</td></tr>
  <tr><td>Website Development</td><td>$0 (via Think! LaunchPad)</td></tr>
  <tr><td><strong>Total Startup Costs</strong></td><td><strong>$<span class="blank" style="min-width:80px;"></span></strong></td></tr>
</table>
<h3>Monthly Revenue Projections (Year 1)</h3>
<table>
  <tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Net Income</th></tr>
  <tr><td>Month 1-3</td><td>$<span class="blank" style="min-width:60px;"></span></td><td>$<span class="blank" style="min-width:60px;"></span></td><td>$<span class="blank" style="min-width:60px;"></span></td></tr>
  <tr><td>Month 4-6</td><td>$<span class="blank" style="min-width:60px;"></span></td><td>$<span class="blank" style="min-width:60px;"></span></td><td>$<span class="blank" style="min-width:60px;"></span></td></tr>
  <tr><td>Month 7-9</td><td>$<span class="blank" style="min-width:60px;"></span></td><td>$<span class="blank" style="min-width:60px;"></span></td><td>$<span class="blank" style="min-width:60px;"></span></td></tr>
  <tr><td>Month 10-12</td><td>$<span class="blank" style="min-width:60px;"></span></td><td>$<span class="blank" style="min-width:60px;"></span></td><td>$<span class="blank" style="min-width:60px;"></span></td></tr>
  <tr><td><strong>Year 1 Total</strong></td><td><strong>$<span class="blank" style="min-width:60px;"></span></strong></td><td><strong>$<span class="blank" style="min-width:60px;"></span></strong></td><td><strong>$<span class="blank" style="min-width:60px;"></span></strong></td></tr>
</table>
`;
    return htmlShell(d.bizName + ' -- Business Plan', body);
  }


  // ═══════════════════════════════════════════════════════
  //  DOCUMENT 2: ARTICLES OF INCORPORATION / ORGANIZATION
  // ═══════════════════════════════════════════════════════
  function generateArticles() {
    const d = getWizardData();
    if (d.entityKey === 'sole') return generateSolePropRegistration();

    const articleTitle = d.state.articleTitle
      ? (d.state.articleTitle[d.entityKey] || 'Articles of Organization')
      : 'Articles of Organization';
    const statute = d.state.statute
      ? (d.state.statute[d.entityKey] || '')
      : '';
    const fee = d.state.fees[d.entityKey] || 0;
    const isNonprofit = d.entityKey === 'nonprofit';
    const isLLC = d.entityKey === 'llc';

    let articlesBody = '';

    if (isLLC) {
      articlesBody = `
<h2>Article I -- Name</h2>
<p>The name of the limited liability company is: <strong>${esc(d.bizName)}</strong></p>

<h2>Article II -- Duration</h2>
<p>The period of duration of the company shall be perpetual.</p>

<h2>Article III -- Purpose</h2>
<p>The purpose of the company is to engage in any lawful activity for which a limited liability company may be organized under ${esc(statute)}.</p>

<h2>Article IV -- Registered Agent and Office</h2>
<p>The name and address of the registered agent is:</p>
<p>Name: <span class="blank"></span></p>
<p>Street Address: <span class="blank"></span></p>
<p>City, State, ZIP: <span class="blank"></span></p>
<p>Mailing Address (if different): <span class="blank"></span></p>

<h2>Article V -- Principal Office</h2>
<p>The address of the principal office of the company is:</p>
<p><span class="blank" style="min-width: 400px;"></span></p>

<h2>Article VI -- Management</h2>
<p>The company shall be managed by its <strong>[  ] Members</strong> / <strong>[  ] Manager(s)</strong>. <em>(Check one.)</em></p>
<p>If manager-managed, the name(s) and address(es) of each initial manager:</p>
<p><span class="blank" style="min-width: 400px;"></span></p>

<h2>Article VII -- Organizer</h2>
<p>The name and address of the organizer is:</p>
<p>Name: <span class="blank"></span></p>
<p>Address: <span class="blank"></span></p>
<div class="sig-line">
  <div class="sig-block">Organizer Signature</div>
  <div class="sig-block">Date</div>
</div>`;
    } else if (isNonprofit) {
      articlesBody = `
<h2>Article I -- Name</h2>
<p>The name of the corporation is: <strong>${esc(d.bizName)}</strong></p>

<h2>Article II -- Duration</h2>
<p>The period of duration of the corporation shall be perpetual.</p>

<h2>Article III -- Purpose</h2>
<p>This corporation is organized exclusively for charitable, educational, and/or scientific purposes under Section 501(c)(3) of the Internal Revenue Code, or the corresponding section of any future federal tax code.</p>
<p>Specifically, the corporation's purpose is:</p>
<p><span class="blank--full"></span></p>
<p><span class="blank--full"></span></p>

<h2>Article IV -- Restrictions</h2>
<p>No part of the net earnings of the corporation shall inure to the benefit of, or be distributable to, its members, trustees, officers, or other private persons, except that the corporation shall be authorized and empowered to pay reasonable compensation for services rendered.</p>
<p>No substantial part of the activities of the corporation shall be the carrying on of propaganda, or otherwise attempting to influence legislation, and the corporation shall not participate in, or intervene in (including the publishing or distribution of statements) any political campaign on behalf of or in opposition to any candidate for public office.</p>

<h2>Article V -- Dissolution</h2>
<p>Upon the dissolution of the corporation, assets shall be distributed for one or more exempt purposes within the meaning of Section 501(c)(3) of the Internal Revenue Code, or the corresponding section of any future federal tax code, or shall be distributed to the federal government, or to a state or local government, for a public purpose.</p>

<h2>Article VI -- Registered Agent and Office</h2>
<p>Name: <span class="blank"></span></p>
<p>Street Address: <span class="blank"></span></p>
<p>City, State, ZIP: <span class="blank"></span></p>

<h2>Article VII -- Board of Directors</h2>
<p>The number of directors constituting the initial Board of Directors is: <span class="blank" style="min-width:40px;"></span></p>
<p>The names and addresses of the initial directors are:</p>
<table>
  <tr><th>Name</th><th>Address</th></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td></tr>
</table>

<h2>Article VIII -- Incorporator</h2>
<p>Name: <span class="blank"></span></p>
<p>Address: <span class="blank"></span></p>
<div class="sig-line">
  <div class="sig-block">Incorporator Signature</div>
  <div class="sig-block">Date</div>
</div>`;
    } else {
      // S-Corporation
      articlesBody = `
<h2>Article I -- Name</h2>
<p>The name of the corporation is: <strong>${esc(d.bizName)}</strong></p>

<h2>Article II -- Duration</h2>
<p>The period of duration of the corporation shall be perpetual.</p>

<h2>Article III -- Purpose</h2>
<p>The purpose of the corporation is to engage in any lawful activity for which a corporation may be organized under ${esc(statute)}.</p>

<h2>Article IV -- Authorized Shares</h2>
<p>The corporation is authorized to issue <span class="blank" style="min-width:100px;"></span> shares of common stock with a par value of $<span class="blank" style="min-width:60px;"></span> per share.</p>

<h2>Article V -- Registered Agent and Office</h2>
<p>Name: <span class="blank"></span></p>
<p>Street Address: <span class="blank"></span></p>
<p>City, State, ZIP: <span class="blank"></span></p>

<h2>Article VI -- Initial Directors</h2>
<p>The number of directors constituting the initial Board of Directors is: <span class="blank" style="min-width:40px;"></span></p>
<table>
  <tr><th>Name</th><th>Address</th></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td></tr>
</table>

<h2>Article VII -- Incorporator</h2>
<p>Name: <span class="blank"></span></p>
<p>Address: <span class="blank"></span></p>
<div class="sig-line">
  <div class="sig-block">Incorporator Signature</div>
  <div class="sig-block">Date</div>
</div>

<div class="callout callout--gold" style="margin-top: 2rem;">
  <strong>S-Election Reminder:</strong> After incorporating, file IRS Form 2553 within 75 days of formation (or by March 15 for the current tax year) to elect S-Corporation tax status. Without this filing, the IRS treats the corporation as a C-Corp by default.
</div>`;
    }

    const body = `
<div class="cover">
  <div class="cover__brand">Think! Ventures LaunchPad</div>
  <div class="cover__title">${esc(articleTitle)}</div>
  <div class="cover__subtitle">${esc(d.bizName)}</div>
  <div class="cover__line"></div>
  <div class="cover__meta">
    <strong>State of Formation:</strong> ${esc(d.state.name)}<br>
    <strong>Governing Statute:</strong> ${esc(statute)}<br>
    <strong>Filing Fee:</strong> $${fee}<br>
    <strong>Processing Time:</strong> ${esc(d.state.processingTime)}
  </div>
</div>

<h1>${esc(articleTitle)}</h1>
<h3>${esc(d.bizName)}</h3>
<p>The undersigned, acting as organizer${isNonprofit || d.entityKey === 'scorp' ? '/incorporator' : ''} under ${esc(statute)}, adopts the following ${esc(articleTitle)} for the purpose of forming a ${esc(d.entityShort)} under the laws of the State of ${esc(d.state.name)}.</p>

${articlesBody}

<div class="callout" style="margin-top: 2rem;">
  <strong>Filing Instructions:</strong><br>
  1. Complete all blank fields in this document.<br>
  2. File with the ${esc(d.state.sosName)}${d.state.sosUrl ? ' at <a href="' + d.state.sosUrl + '" target="_blank">' + d.state.sosUrl + '</a>' : ''}.<br>
  3. Filing fee: <strong>$${fee}</strong>.<br>
  4. Estimated processing time: <strong>${esc(d.state.processingTime)}</strong>.<br>
  5. ${esc(d.state.annualReport)}
</div>`;

    return htmlShell(articleTitle + ' -- ' + d.bizName, body);
  }

  // Sole Prop alternative document
  function generateSolePropRegistration() {
    const d = getWizardData();
    const body = `
<div class="cover">
  <div class="cover__brand">Think! Ventures LaunchPad</div>
  <div class="cover__title">DBA Registration Guide</div>
  <div class="cover__subtitle">${esc(d.bizName)}</div>
  <div class="cover__line"></div>
  <div class="cover__meta">
    <strong>State:</strong> ${esc(d.state.name)}<br>
    <strong>Entity Type:</strong> Sole Proprietorship<br>
    <strong>Date Prepared:</strong> ${fmtDate()}
  </div>
</div>

<h1>DBA / Trade Name Registration Guide</h1>
<p>As a Sole Proprietorship, <strong>${esc(d.bizName)}</strong> does not require formal articles of organization or incorporation. However, if you operate under a name different from your legal name, you must file a "Doing Business As" (DBA) or trade name registration.</p>

<h2>Step 1: Check Name Availability</h2>
<p>Search for existing business names through your ${esc(d.state.sosName)}${d.state.sosUrl ? ' at <a href="' + d.state.sosUrl + '" target="_blank">' + d.state.sosUrl + '</a>' : ''}.</p>

<h2>Step 2: File the DBA</h2>
<p>In most states, DBA registration is filed at the county level with the Register of Deeds or County Clerk. Some states handle this at the state level.</p>
<table>
  <tr><th>Item</th><th>Detail</th></tr>
  <tr><td>Filing Location</td><td>County Register of Deeds (most states)</td></tr>
  <tr><td>Typical Fee</td><td>$10 - $50</td></tr>
  <tr><td>Processing Time</td><td>Same day to 1 week</td></tr>
  <tr><td>Renewal</td><td>Every 5 years (varies by state)</td></tr>
</table>

<h2>Step 3: Open a Business Bank Account</h2>
<p>Bring your DBA filing receipt and a valid government ID to open a business checking account under your trade name.</p>

<div class="callout callout--gold">
  <strong>Recommendation:</strong> Consider forming an LLC for personal asset protection. Think! Ventures can help you convert from a Sole Proprietorship to an LLC at any time, free of charge.
</div>`;
    return htmlShell('DBA Registration Guide -- ' + d.bizName, body);
  }


  // ═══════════════════════════════════════════════════════
  //  DOCUMENT 3: BYLAWS / OPERATING AGREEMENT
  // ═══════════════════════════════════════════════════════
  function generateBylaws() {
    const d = getWizardData();

    if (d.entityKey === 'llc' || d.entityKey === 'sole') {
      return generateOperatingAgreement();
    }

    const isNonprofit = d.entityKey === 'nonprofit';

    const body = `
<div class="cover">
  <div class="cover__brand">Think! Ventures LaunchPad</div>
  <div class="cover__title">Bylaws</div>
  <div class="cover__subtitle">${esc(d.bizName)}</div>
  <div class="cover__line"></div>
  <div class="cover__meta">
    <strong>Entity Type:</strong> ${esc(d.entityLabel)}<br>
    <strong>State:</strong> ${esc(d.state.name)}<br>
    <strong>Adopted:</strong> ${fmtDate()}
  </div>
</div>

<h1>Bylaws of ${esc(d.bizName)}</h1>
<p>A ${esc(d.entityShort)} organized under the laws of the State of ${esc(d.state.name)}.</p>

<h2>Article I -- Name and Purpose</h2>
<h3>Section 1.1 -- Name</h3>
<p>The name of the corporation is <strong>${esc(d.bizName)}</strong>.</p>
<h3>Section 1.2 -- Purpose</h3>
${isNonprofit
  ? '<p>The corporation is organized exclusively for charitable, educational, and/or scientific purposes under Section 501(c)(3) of the Internal Revenue Code. Specifically, the corporation shall:</p><p><span class="blank--full"></span></p><p><span class="blank--full"></span></p>'
  : '<p>The purpose of the corporation is to engage in any lawful business activity permitted under the laws of the State of ' + esc(d.state.name) + '.</p>'}

<h2>Article II -- Board of Directors</h2>
<h3>Section 2.1 -- General Powers</h3>
<p>The affairs of the corporation shall be managed by its Board of Directors.</p>
<h3>Section 2.2 -- Number and Qualifications</h3>
<p>The Board of Directors shall consist of no fewer than <span class="blank" style="min-width:30px;"></span> and no more than <span class="blank" style="min-width:30px;"></span> directors.${isNonprofit ? ' No director may be related by blood or marriage to any other director or to any officer of the corporation.' : ''}</p>
<h3>Section 2.3 -- Term of Office</h3>
<p>Each director shall serve a term of <span class="blank" style="min-width:40px;"></span> year(s) and until a successor has been elected and qualified.</p>
<h3>Section 2.4 -- Vacancies</h3>
<p>Vacancies on the Board shall be filled by a majority vote of the remaining directors. A director elected to fill a vacancy shall serve for the unexpired term of the predecessor.</p>
<h3>Section 2.5 -- Removal</h3>
<p>A director may be removed with or without cause by a two-thirds vote of the Board of Directors.</p>
<h3>Section 2.6 -- Compensation</h3>
<p>Directors shall serve without compensation but may be reimbursed for reasonable expenses incurred in the performance of their duties.${isNonprofit ? ' No director shall receive compensation for services as a director.' : ''}</p>

<h2>Article III -- Meetings</h2>
<h3>Section 3.1 -- Annual Meeting</h3>
<p>The annual meeting of the Board of Directors shall be held on <span class="blank" style="min-width:200px;"></span> of each year, at a time and place designated by the Board Chair.</p>
<h3>Section 3.2 -- Regular Meetings</h3>
<p>Regular meetings shall be held at least <span class="blank" style="min-width:60px;"></span> times per year.</p>
<h3>Section 3.3 -- Special Meetings</h3>
<p>Special meetings may be called by the Chair or by any two directors with at least 5 days written notice.</p>
<h3>Section 3.4 -- Quorum</h3>
<p>A majority of the directors then serving shall constitute a quorum for the transaction of business.</p>
<h3>Section 3.5 -- Voting</h3>
<p>Each director shall have one vote. Actions shall be taken by a majority of directors present at a meeting at which a quorum is present, unless a greater vote is required by law or these Bylaws.</p>

<h2>Article IV -- Officers</h2>
<h3>Section 4.1 -- Designation</h3>
<p>The officers of the corporation shall be a ${isNonprofit ? 'Chair, Vice Chair, Secretary, and Treasurer' : 'President, Vice President, Secretary, and Treasurer'}. The Board may create additional officer positions as needed.</p>
<h3>Section 4.2 -- Election and Term</h3>
<p>Officers shall be elected by the Board of Directors at the annual meeting and shall serve for <span class="blank" style="min-width:40px;"></span> year(s).</p>
<h3>Section 4.3 -- Duties</h3>
<ul>
  <li><strong>${isNonprofit ? 'Chair' : 'President'}:</strong> Presides over meetings, provides general oversight and direction.</li>
  <li><strong>${isNonprofit ? 'Vice Chair' : 'Vice President'}:</strong> Acts in the absence of the ${isNonprofit ? 'Chair' : 'President'}.</li>
  <li><strong>Secretary:</strong> Maintains corporate records, meeting minutes, and official correspondence.</li>
  <li><strong>Treasurer:</strong> Manages financial accounts, prepares financial reports, and oversees budgets.</li>
</ul>

<h2>Article V -- Committees</h2>
<p>The Board may establish committees as necessary. Each committee shall consist of at least two directors and shall report to the full Board.</p>

${isNonprofit ? `
<h2>Article VI -- Conflict of Interest</h2>
<p>Any director, officer, or employee with a financial or personal interest in a matter before the Board shall disclose the conflict, abstain from voting, and leave the room during discussion if requested by the Board.</p>

<h2>Article VII -- Fiscal Year</h2>
<p>The fiscal year of the corporation shall begin on <strong>January 1</strong> and end on <strong>December 31</strong> of each year.</p>

<h2>Article VIII -- Amendments</h2>
<p>These Bylaws may be amended by a two-thirds vote of the Board of Directors at any regular or special meeting, provided that written notice of the proposed amendment has been given at least 10 days in advance.</p>

<h2>Article IX -- Dissolution</h2>
<p>Upon dissolution, all remaining assets shall be distributed to one or more organizations exempt under Section 501(c)(3) of the Internal Revenue Code, or to a governmental entity for public purposes.</p>
` : `
<h2>Article VI -- Fiscal Year</h2>
<p>The fiscal year of the corporation shall begin on <strong>January 1</strong> and end on <strong>December 31</strong> of each year.</p>

<h2>Article VII -- Amendments</h2>
<p>These Bylaws may be amended by a majority vote of the Board of Directors at any regular or special meeting, provided that written notice of the proposed amendment has been given at least 10 days in advance.</p>

<h2>Article VIII -- Indemnification</h2>
<p>The corporation shall indemnify its directors, officers, and employees to the fullest extent permitted by the laws of the State of ${esc(d.state.name)}.</p>
`}

<h2>Certification</h2>
<p>The undersigned Secretary certifies that these Bylaws were duly adopted by the Board of Directors of ${esc(d.bizName)} on ${fmtDate()}.</p>
<div class="sig-line">
  <div class="sig-block">Secretary Signature</div>
  <div class="sig-block">Date</div>
</div>`;

    return htmlShell('Bylaws -- ' + d.bizName, body);
  }

  // Operating Agreement for LLCs (and sole props)
  function generateOperatingAgreement() {
    const d = getWizardData();

    const body = `
<div class="cover">
  <div class="cover__brand">Think! Ventures LaunchPad</div>
  <div class="cover__title">Operating Agreement</div>
  <div class="cover__subtitle">${esc(d.bizName)}</div>
  <div class="cover__line"></div>
  <div class="cover__meta">
    <strong>Entity Type:</strong> ${esc(d.entityLabel)}<br>
    <strong>State:</strong> ${esc(d.state.name)}<br>
    <strong>Effective Date:</strong> ${fmtDate()}
  </div>
</div>

<h1>Operating Agreement of ${esc(d.bizName)}</h1>
<p>This Operating Agreement ("Agreement") is entered into effective ${fmtDate()}, by and among the undersigned Member(s) of <strong>${esc(d.bizName)}</strong>, a limited liability company organized under the laws of the State of ${esc(d.state.name)}.</p>

<h2>Article I -- Formation</h2>
<h3>Section 1.1 -- Organization</h3>
<p>The Members have formed a limited liability company under ${esc(d.state.statute ? d.state.statute.llc : 'the applicable state LLC act')}.</p>
<h3>Section 1.2 -- Name</h3>
<p>The name of the company is <strong>${esc(d.bizName)}</strong>.</p>
<h3>Section 1.3 -- Purpose</h3>
<p>The company is formed for the purpose of engaging in any lawful business activity.</p>
<h3>Section 1.4 -- Duration</h3>
<p>The company shall have perpetual existence unless dissolved in accordance with this Agreement or applicable law.</p>

<h2>Article II -- Members and Capital</h2>
<h3>Section 2.1 -- Members</h3>
<table>
  <tr><th>Member Name</th><th>Address</th><th>Ownership %</th><th>Capital Contribution</th></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td><td><span class="blank" style="min-width:40px;"></span>%</td><td>$<span class="blank" style="min-width:60px;"></span></td></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td><td><span class="blank" style="min-width:40px;"></span>%</td><td>$<span class="blank" style="min-width:60px;"></span></td></tr>
</table>
<h3>Section 2.2 -- Additional Contributions</h3>
<p>No Member shall be required to make additional capital contributions without unanimous consent.</p>

<h2>Article III -- Management</h2>
<h3>Section 3.1 -- Management Structure</h3>
<p>The company shall be managed by its <strong>[  ] Members</strong> / <strong>[  ] Manager(s)</strong>. <em>(Check one.)</em></p>
<h3>Section 3.2 -- Voting</h3>
<p>Each Member shall vote in proportion to their ownership interest. Major decisions (admission of new members, sale of assets, dissolution) require unanimous consent.</p>
<h3>Section 3.3 -- Officers</h3>
<p>The Members may appoint officers to manage day-to-day operations. Initial officers:</p>
<ul>
  <li><strong>Managing Member / CEO:</strong> <span class="blank"></span></li>
  <li><strong>Treasurer / CFO:</strong> <span class="blank"></span></li>
  <li><strong>Secretary:</strong> <span class="blank"></span></li>
</ul>

<h2>Article IV -- Distributions and Allocations</h2>
<h3>Section 4.1 -- Distributions</h3>
<p>Net profits and losses shall be allocated to the Members in proportion to their respective ownership interests.</p>
<h3>Section 4.2 -- Timing</h3>
<p>Distributions shall be made at such times and in such amounts as determined by the Members, subject to the company's obligation to maintain adequate reserves.</p>
<h3>Section 4.3 -- Tax Distributions</h3>
<p>Prior to other distributions, the company shall distribute to each Member an amount sufficient to cover estimated income tax liability arising from the company's income.</p>

<h2>Article V -- Transfer of Interests</h2>
<p>No Member may transfer their interest without the written consent of all other Members. A transferee shall have no right to participate in management unless admitted as a Member by unanimous consent.</p>

<h2>Article VI -- Dissolution</h2>
<p>The company shall be dissolved upon: (a) the unanimous written consent of all Members; (b) the occurrence of any event that makes it unlawful to continue business; or (c) a judicial decree of dissolution.</p>

<h2>Article VII -- Miscellaneous</h2>
<h3>Section 7.1 -- Fiscal Year</h3>
<p>The fiscal year shall be the calendar year (January 1 -- December 31).</p>
<h3>Section 7.2 -- Governing Law</h3>
<p>This Agreement shall be governed by the laws of the State of ${esc(d.state.name)}.</p>
<h3>Section 7.3 -- Amendments</h3>
<p>This Agreement may be amended only by the unanimous written consent of all Members.</p>
<h3>Section 7.4 -- Entire Agreement</h3>
<p>This Agreement constitutes the entire agreement among the Members and supersedes all prior agreements.</p>

<h2>Signatures</h2>
<p>IN WITNESS WHEREOF, the Members have executed this Operating Agreement effective as of the date first written above.</p>
<div class="sig-line">
  <div class="sig-block">Member 1 Signature / Print Name</div>
  <div class="sig-block">Date</div>
</div>
<br>
<div class="sig-line">
  <div class="sig-block">Member 2 Signature / Print Name</div>
  <div class="sig-block">Date</div>
</div>`;

    return htmlShell('Operating Agreement -- ' + d.bizName, body);
  }


  // ═══════════════════════════════════════════════════════
  //  DOCUMENT 4: ORGANIZATIONAL MINUTES
  // ═══════════════════════════════════════════════════════
  function generateMinutes() {
    const d = getWizardData();
    const isLLC = d.entityKey === 'llc' || d.entityKey === 'sole';
    const isNonprofit = d.entityKey === 'nonprofit';
    const meetingLabel = isLLC ? 'Initial Meeting of the Members' : 'Organizational Meeting of the Board of Directors';
    const participantLabel = isLLC ? 'Members' : 'Directors';

    const body = `
<div class="cover">
  <div class="cover__brand">Think! Ventures LaunchPad</div>
  <div class="cover__title">Organizational Minutes</div>
  <div class="cover__subtitle">${esc(d.bizName)}</div>
  <div class="cover__line"></div>
  <div class="cover__meta">
    <strong>Entity Type:</strong> ${esc(d.entityLabel)}<br>
    <strong>State:</strong> ${esc(d.state.name)}<br>
    <strong>Meeting Date:</strong> ${fmtDate()}
  </div>
</div>

<h1>Minutes of the ${meetingLabel}</h1>
<h3>${esc(d.bizName)}</h3>
<p>A ${esc(d.entityShort)} organized under the laws of the State of ${esc(d.state.name)}.</p>

<h2>Call to Order</h2>
<p>The ${meetingLabel.toLowerCase()} of <strong>${esc(d.bizName)}</strong> was held on <strong>${fmtDate()}</strong> at <span class="blank" style="min-width:60px;"></span> <em>(time)</em>, at <span class="blank" style="min-width:200px;"></span> <em>(location/virtual)</em>.</p>

<h2>${participantLabel} Present</h2>
<table>
  <tr><th>Name</th><th>Title / Role</th></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td></tr>
  <tr><td><span class="blank"></span></td><td><span class="blank"></span></td></tr>
</table>
<p>A quorum was determined to be present, and the meeting was called to order.</p>

<h2>Resolutions Adopted</h2>

<h3>Resolution 1: Adoption of ${isLLC ? 'Operating Agreement' : 'Bylaws'}</h3>
<p><strong>RESOLVED</strong>, that the ${isLLC ? 'Operating Agreement' : 'Bylaws'} presented to the ${participantLabel.toLowerCase()} be, and hereby are, adopted as the ${isLLC ? 'Operating Agreement' : 'Bylaws'} of <strong>${esc(d.bizName)}</strong>, and that a copy be inserted in the company's records.</p>

<h3>Resolution 2: Election of ${isLLC ? 'Officers / Managing Member' : 'Officers'}</h3>
<p><strong>RESOLVED</strong>, that the following persons are elected to serve as officers of <strong>${esc(d.bizName)}</strong> until their successors are duly elected and qualified:</p>
<table>
  <tr><th>Office</th><th>Name</th></tr>
  ${isLLC ? `
  <tr><td>Managing Member / CEO</td><td><span class="blank"></span></td></tr>
  <tr><td>Treasurer</td><td><span class="blank"></span></td></tr>
  <tr><td>Secretary</td><td><span class="blank"></span></td></tr>
  ` : isNonprofit ? `
  <tr><td>Chair</td><td><span class="blank"></span></td></tr>
  <tr><td>Vice Chair</td><td><span class="blank"></span></td></tr>
  <tr><td>Secretary</td><td><span class="blank"></span></td></tr>
  <tr><td>Treasurer</td><td><span class="blank"></span></td></tr>
  ` : `
  <tr><td>President</td><td><span class="blank"></span></td></tr>
  <tr><td>Vice President</td><td><span class="blank"></span></td></tr>
  <tr><td>Secretary</td><td><span class="blank"></span></td></tr>
  <tr><td>Treasurer</td><td><span class="blank"></span></td></tr>
  `}
</table>

<h3>Resolution 3: Banking</h3>
<p><strong>RESOLVED</strong>, that the ${isLLC ? 'Managing Member' : isNonprofit ? 'Treasurer' : 'President and Treasurer'} be authorized to open and maintain bank accounts on behalf of <strong>${esc(d.bizName)}</strong> at a financial institution of their choosing, and to execute any documents necessary to establish such accounts.</p>
<p>Authorized signers on the account(s) shall be:</p>
<ul>
  <li><span class="blank"></span></li>
  <li><span class="blank"></span></li>
</ul>

<h3>Resolution 4: Fiscal Year</h3>
<p><strong>RESOLVED</strong>, that the fiscal year of <strong>${esc(d.bizName)}</strong> shall end on <strong>December 31</strong> of each year.</p>

<h3>Resolution 5: EIN Application</h3>
<p><strong>RESOLVED</strong>, that the ${isLLC ? 'Managing Member' : isNonprofit ? 'Chair or Treasurer' : 'President or Secretary'} is authorized to apply for an Employer Identification Number (EIN) from the Internal Revenue Service on behalf of <strong>${esc(d.bizName)}</strong>.</p>

${isNonprofit ? `
<h3>Resolution 6: Tax-Exempt Status Application</h3>
<p><strong>RESOLVED</strong>, that the Board authorizes the filing of IRS Form 1023 (or 1023-EZ) for recognition of tax-exempt status under Section 501(c)(3) of the Internal Revenue Code.</p>

<h3>Resolution 7: Conflict of Interest Policy</h3>
<p><strong>RESOLVED</strong>, that the Conflict of Interest Policy presented to the Board be adopted, and that each director and officer shall sign an annual disclosure statement.</p>
` : ''}

${d.entityKey === 'scorp' ? `
<h3>Resolution 6: S-Corporation Election</h3>
<p><strong>RESOLVED</strong>, that the officers are authorized and directed to file IRS Form 2553 to elect S-Corporation status under Subchapter S of the Internal Revenue Code, effective as of the date of incorporation.</p>
` : ''}

<h2>Adjournment</h2>
<p>There being no further business, the meeting was adjourned at <span class="blank" style="min-width:60px;"></span> <em>(time)</em>.</p>

<h2>Certification</h2>
<p>I certify that the above is a true and correct record of the proceedings of the ${meetingLabel.toLowerCase()} of ${esc(d.bizName)}.</p>
<div class="sig-line">
  <div class="sig-block">Secretary Signature</div>
  <div class="sig-block">Date</div>
</div>`;

    return htmlShell('Organizational Minutes -- ' + d.bizName, body);
  }


  // ═══════════════════════════════════════════════════════
  //  DOCUMENT 5: EIN APPLICATION GUIDE
  // ═══════════════════════════════════════════════════════
  function generateEINGuide() {
    const d = getWizardData();

    const entityTypeMap = {
      'llc': 'Limited Liability Company',
      'sole': 'Sole Proprietorship',
      'scorp': 'Corporation (will elect S-Corp status)',
      'nonprofit': 'Other Nonprofit Organization / Church-Controlled Organization'
    };

    const reasonMap = {
      'llc': 'Started a new business',
      'sole': 'Started a new business',
      'scorp': 'Started a new business',
      'nonprofit': 'Started a new business'
    };

    const body = `
<div class="cover">
  <div class="cover__brand">Think! Ventures LaunchPad</div>
  <div class="cover__title">EIN Application Guide</div>
  <div class="cover__subtitle">${esc(d.bizName)}</div>
  <div class="cover__line"></div>
  <div class="cover__meta">
    <strong>IRS Form SS-4 Walkthrough</strong><br>
    <strong>Estimated Time:</strong> 10 minutes<br>
    <strong>Cost:</strong> FREE<br>
    <strong>Date Prepared:</strong> ${fmtDate()}
  </div>
</div>

<h1>EIN Application Guide</h1>
<h3>Step-by-Step Walkthrough for ${esc(d.bizName)}</h3>

<div class="callout">
  <strong>What is an EIN?</strong> An Employer Identification Number (EIN) is a nine-digit number assigned by the IRS. It is used for tax filing, opening business bank accounts, hiring employees, and applying for business licenses. Think of it as a Social Security Number for your business.
</div>

<h2>Before You Begin</h2>
<p>Have the following information ready:</p>
<ul>
  <li>Your Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN)</li>
  <li>Legal name and address of the business</li>
  <li>Name and SSN of the responsible party (the person who controls the entity)</li>
  <li>Date the business was started or acquired</li>
  <li>Type of business entity</li>
</ul>

<h2>Apply Online (Recommended)</h2>
<div class="callout callout--gold">
  <strong>Direct Link:</strong> <a href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" target="_blank">https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online</a><br>
  <strong>Hours:</strong> Monday-Friday, 7:00 AM - 10:00 PM Eastern<br>
  <strong>Cost:</strong> FREE (never pay a third party for this!)
</div>

<h2>Pre-Filled Answers for Your Application</h2>
<p>Based on your LaunchPad wizard selections, here are the answers you will provide:</p>

<table>
  <tr><th>Question</th><th>Your Answer</th></tr>
  <tr><td>Type of legal structure</td><td><strong>${esc(entityTypeMap[d.entityKey] || 'Limited Liability Company')}</strong></td></tr>
  ${d.entityKey === 'llc' ? '<tr><td>Number of LLC members</td><td><strong>[Enter number of members]</strong></td></tr>' : ''}
  <tr><td>Reason for applying</td><td><strong>${esc(reasonMap[d.entityKey] || 'Started a new business')}</strong></td></tr>
  <tr><td>Legal name of entity</td><td><strong>${esc(d.bizName)}</strong></td></tr>
  <tr><td>State of organization</td><td><strong>${esc(d.state.name)}</strong></td></tr>
  <tr><td>Trade name / DBA</td><td><strong>${esc(d.bizName)}</strong> (if different from legal name)</td></tr>
  <tr><td>Principal business activity</td><td><strong>${esc(d.industryLabel)}</strong></td></tr>
  <tr><td>Date business started</td><td><strong>${fmtDate()}</strong> (or your actual start date)</td></tr>
  <tr><td>Closing month of accounting year</td><td><strong>December</strong></td></tr>
  <tr><td>Highest number of employees expected in the next 12 months</td><td><strong>[Enter expected number, or 0 if none]</strong></td></tr>
  <tr><td>Do you expect to pay wages?</td><td><strong>[Yes / No]</strong></td></tr>
</table>

<h2>Step-by-Step Process</h2>

<h3>Step 1: Go to the IRS Website</h3>
<p>Navigate to the IRS EIN online application. Click "Apply Online Now" and then "Begin Application."</p>

<h3>Step 2: Select Your Entity Type</h3>
<p>Choose <strong>"${esc(entityTypeMap[d.entityKey] || 'Limited Liability Company')}"</strong> from the list of entity types.</p>
${d.entityKey === 'llc' ? '<p>On the next screen, select the number of LLC members.</p>' : ''}

<h3>Step 3: Confirm Why You Need an EIN</h3>
<p>Select <strong>"Started a new business"</strong> as the reason for applying.</p>

<h3>Step 4: Enter Responsible Party Information</h3>
<p>The responsible party is the individual who owns or controls the entity. Enter your full legal name and SSN.</p>
<div class="callout">
  <strong>Important:</strong> The responsible party must be an individual (not another business). For LLCs, this is typically the managing member. For corporations, this is typically an officer. For nonprofits, this is typically the board chair.
</div>

<h3>Step 5: Enter Business Details</h3>
<p>Enter your business name, address, state of organization (${esc(d.state.name)}), and start date.</p>

<h3>Step 6: Describe Your Business</h3>
<p>Select the industry category that best matches <strong>${esc(d.industryLabel)}</strong> and provide a brief description.</p>

<h3>Step 7: Review and Submit</h3>
<p>Review all information carefully. Once submitted, your EIN will be issued immediately. You will receive a confirmation notice (CP 575) that you can download and print.</p>

<h2>After You Receive Your EIN</h2>
<ol>
  <li><strong>Save the confirmation notice (CP 575)</strong> -- Print and store this document safely. You will need it to open a bank account.</li>
  <li><strong>Open a business bank account</strong> -- Bring your EIN confirmation, formation documents, and a valid photo ID.</li>
  ${d.entityKey === 'scorp' ? '<li><strong>File Form 2553</strong> -- Submit the S-Corporation election within 75 days of formation.</li>' : ''}
  ${d.entityKey === 'nonprofit' ? '<li><strong>File Form 1023 or 1023-EZ</strong> -- Apply for 501(c)(3) tax-exempt status.</li>' : ''}
  <li><strong>Register for state taxes</strong> -- Use your EIN to register with the ${esc(d.state.name)} Department of Revenue.</li>
  <li><strong>Set up payroll (if applicable)</strong> -- Register for federal and state payroll tax withholding.</li>
</ol>

<div class="callout callout--gold">
  <strong>Never pay for an EIN!</strong> The IRS provides EINs completely free of charge. Any website charging you for an EIN application is a third-party service, not the IRS. Always use the official IRS website at <a href="https://www.irs.gov" target="_blank">irs.gov</a>.
</div>`;

    return htmlShell('EIN Application Guide -- ' + d.bizName, body);
  }


  // ─── HELPER: Escape HTML ─────────────────────────────
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }


  // ─── OPEN DOCUMENT IN NEW TAB ────────────────────────
  function openDocument(htmlContent) {
    var win = window.open('', '_blank');
    if (!win) {
      // Popup blocked -- fall back to blob download
      var blob = new Blob([htmlContent], { type: 'text/html' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'document.html';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    win.document.write(htmlContent);
    win.document.close();
  }


  // ═══════════════════════════════════════════════════════
  //  DOCUMENT CARD DEFINITIONS
  // ═══════════════════════════════════════════════════════
  function getDocCards() {
    var d = getWizardData();
    var isLLC = d.entityKey === 'llc';
    var isSole = d.entityKey === 'sole';

    return [
      {
        id: 'doc-business-plan',
        icon: 'chart',
        title: 'Business Plan',
        desc: '5-section plan with executive summary, market analysis, and financial projections.',
        generator: generateBusinessPlan
      },
      {
        id: 'doc-articles',
        icon: 'document',
        title: isSole ? 'DBA Registration Guide' : (d.state.articleTitle ? (d.state.articleTitle[d.entityKey] || 'Articles of Organization') : 'Articles of Organization'),
        desc: isSole
          ? 'Trade name registration guide with filing instructions for your state.'
          : 'Pre-filled formation document template with ' + d.state.sosName + ' filing instructions. Fee: $' + (d.state.fees[d.entityKey] || 0) + '.',
        generator: generateArticles
      },
      {
        id: 'doc-bylaws',
        icon: 'certificate',
        title: (isLLC || isSole) ? 'Operating Agreement' : 'Bylaws',
        desc: (isLLC || isSole)
          ? 'Member agreement covering ownership, management, distributions, and transfers.'
          : 'Corporate governance document with board structure, officer duties, and meeting rules.',
        generator: generateBylaws
      },
      {
        id: 'doc-minutes',
        icon: 'users',
        title: 'Organizational Minutes',
        desc: 'First meeting minutes template with standard resolutions for officers, banking, and fiscal year.',
        generator: generateMinutes
      },
      {
        id: 'doc-ein',
        icon: 'shield',
        title: 'EIN Application Guide',
        desc: 'Step-by-step IRS SS-4 walkthrough with pre-filled answers. Free, takes 10 minutes.',
        generator: generateEINGuide
      }
    ];
  }


  // ═══════════════════════════════════════════════════════
  //  INJECT CSS
  // ═══════════════════════════════════════════════════════
  function injectStyles() {
    if (document.getElementById('doc-gen-styles')) return;
    var style = document.createElement('style');
    style.id = 'doc-gen-styles';
    style.textContent = `
/* ═══ Document Generator Panel ═══ */
.docgen-panel {
  margin-top: var(--sp-2xl);
  animation: fadeIn 0.4s ease;
}
.docgen-panel__header {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);
}
.docgen-panel__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-secondary) 0%, #e6951e 100%);
  border-radius: var(--border-radius-md);
  color: var(--color-bg);
  flex-shrink: 0;
}
.docgen-panel__icon svg { width: 22px; height: 22px; }
.docgen-panel__title {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: var(--fs-xl);
  color: var(--color-secondary);
}
.docgen-panel__subtitle {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* ── Document Card Grid ── */
.docgen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--sp-lg);
}
.docgen-card {
  position: relative;
  padding: var(--sp-xl);
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--border-radius-lg);
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}
.docgen-card:hover {
  border-color: rgba(245, 166, 35, 0.35);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(245, 166, 35, 0.1);
}
.docgen-card__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  border-radius: var(--border-radius-sm);
  color: var(--color-white);
  margin-bottom: var(--sp-md);
  flex-shrink: 0;
}
.docgen-card__icon svg { width: 20px; height: 20px; }
.docgen-card__title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--fs-base);
  color: var(--color-white);
  margin-bottom: var(--sp-xs);
}
.docgen-card__desc {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
  flex: 1;
  margin-bottom: var(--sp-lg);
}
.docgen-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}
.docgen-card__status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-xs);
  font-weight: 600;
  font-family: var(--font-heading);
}
.docgen-card__status--ready { color: var(--color-accent); }
.docgen-card__status--busy { color: var(--color-secondary); }
.docgen-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.docgen-status-dot--ready { background: var(--color-accent); box-shadow: 0 0 6px rgba(16,185,129,0.5); }
.docgen-status-dot--busy { background: var(--color-secondary); animation: docgenPulse 1s ease-in-out infinite; }

@keyframes docgenPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.docgen-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}
.docgen-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
}
.docgen-btn svg { width: 14px; height: 14px; }
.docgen-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .docgen-grid { grid-template-columns: 1fr; }
}
@media print {
  .docgen-panel { display: none !important; }
}
`;
    document.head.appendChild(style);
  }


  // ═══════════════════════════════════════════════════════
  //  BUILD AND INJECT THE PANEL
  // ═══════════════════════════════════════════════════════
  var panelInjected = false;

  function injectPanel() {
    if (panelInjected) return;

    var checklist = document.getElementById('checklist-container');
    if (!checklist) return;

    // Only inject if step-4 is visible (has items rendered)
    if (checklist.children.length === 0) return;

    panelInjected = true;
    injectStyles();

    var cards = getDocCards();

    // Download icon SVG
    var dlIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

    // Panel header icon (file-text)
    var panelIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';

    var panel = document.createElement('div');
    panel.className = 'docgen-panel';
    panel.innerHTML =
      '<div class="docgen-panel__header">' +
        '<div class="docgen-panel__icon">' + panelIcon + '</div>' +
        '<div>' +
          '<div class="docgen-panel__title">Your Documents</div>' +
          '<div class="docgen-panel__subtitle">Download professional formation documents customized to your business.</div>' +
        '</div>' +
      '</div>' +
      '<div class="docgen-grid">' +
        cards.map(function(card) {
          return '<div class="docgen-card" id="' + card.id + '">' +
            '<div class="docgen-card__icon">' + (window.ICONS && window.ICONS[card.icon] ? window.ICONS[card.icon] : panelIcon) + '</div>' +
            '<div class="docgen-card__title">' + card.title + '</div>' +
            '<div class="docgen-card__desc">' + card.desc + '</div>' +
            '<div class="docgen-card__footer">' +
              '<div class="docgen-card__status docgen-card__status--ready" data-status="' + card.id + '">' +
                '<span class="docgen-status-dot docgen-status-dot--ready"></span> Ready' +
              '</div>' +
              '<button class="docgen-btn" data-doc="' + card.id + '">' +
                dlIcon + ' Download' +
              '</button>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';

    // Insert after checklist, before the resources section
    var resources = checklist.nextElementSibling;
    if (resources) {
      checklist.parentNode.insertBefore(panel, resources);
    } else {
      checklist.parentNode.appendChild(panel);
    }

    // Attach click handlers via event delegation on the panel
    panel.addEventListener('click', function(e) {
      var btn = e.target.closest('.docgen-btn');
      if (!btn) return;

      var docId = btn.getAttribute('data-doc');
      if (!docId) return;

      // Find the matching card definition
      var cardDef = cards.find(function(c) { return c.id === docId; });
      if (!cardDef) return;

      // Show generating state
      var statusEl = panel.querySelector('[data-status="' + docId + '"]');
      if (statusEl) {
        statusEl.className = 'docgen-card__status docgen-card__status--busy';
        statusEl.innerHTML = '<span class="docgen-status-dot docgen-status-dot--busy"></span> Generating...';
      }
      btn.disabled = true;

      // Use a short timeout so the UI updates before the
      // synchronous document generation runs
      setTimeout(function() {
        try {
          var html = cardDef.generator();
          openDocument(html);
        } catch (err) {
          console.error('DocGenerator error:', err);
        }

        // Reset status
        if (statusEl) {
          statusEl.className = 'docgen-card__status docgen-card__status--ready';
          statusEl.innerHTML = '<span class="docgen-status-dot docgen-status-dot--ready"></span> Ready';
        }
        btn.disabled = false;
      }, 150);
    });
  }


  // ═══════════════════════════════════════════════════════
  //  DETECT STEP-4 ACTIVATION
  // ═══════════════════════════════════════════════════════
  // The wizard shows step-4 by adding the 'active' class
  // to #step-4. We watch for that via MutationObserver
  // and also hook into the global generateRoadmap function.

  // Strategy 1: MutationObserver on #step-4
  function watchStep4() {
    var step4 = document.getElementById('step-4');
    if (!step4) return;

    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'class') {
          if (step4.classList.contains('active')) {
            // Small delay to let the checklist render first
            setTimeout(injectPanel, 200);
          }
        }
      }
    });
    observer.observe(step4, { attributes: true });

    // Also watch the checklist container for child additions
    // (the checklist is populated dynamically)
    var checklist = document.getElementById('checklist-container');
    if (checklist) {
      var childObserver = new MutationObserver(function() {
        if (step4.classList.contains('active') && checklist.children.length > 0) {
          setTimeout(injectPanel, 100);
        }
      });
      childObserver.observe(checklist, { childList: true });
    }
  }

  // Strategy 2: Hook into generateRoadmap if it exists
  function hookRoadmap() {
    if (typeof window.generateRoadmap === 'function') {
      var original = window.generateRoadmap;
      window.generateRoadmap = function() {
        original.apply(this, arguments);
        // Reset so we can re-inject if the user starts over
        panelInjected = false;
        setTimeout(injectPanel, 300);
      };
    }
  }

  // Strategy 3: Hook into startOver to reset the panel flag
  function hookStartOver() {
    if (typeof window.startOver === 'function') {
      var originalStartOver = window.startOver;
      window.startOver = function() {
        panelInjected = false;
        var existing = document.querySelector('.docgen-panel');
        if (existing) existing.remove();
        originalStartOver.apply(this, arguments);
      };
    }
  }


  // ─── INIT ────────────────────────────────────────────
  function init() {
    watchStep4();
    hookRoadmap();
    hookStartOver();

    // If step-4 is already active (page reload mid-wizard)
    var step4 = document.getElementById('step-4');
    if (step4 && step4.classList.contains('active')) {
      setTimeout(injectPanel, 300);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
