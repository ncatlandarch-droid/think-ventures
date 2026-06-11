/* =====================================================
   THINK! VENTURES -- LaunchPad Tier 2 Features
   Injects AFTER the Tier 1 sections in step-4 (Roadmap):
     6. Funding & Grants Directory
     7. Domain & Social Media Check
     8. Compliance Calendar
     9. Bella AI Assistant (FAQ Mode)
   Load AFTER launchpad-extras.js.
   ===================================================== */

(function LaunchPadTier2() {
  'use strict';

  // ─── CONSTANTS ───────────────────────────────────────

  var EMERALD = '#10B981';
  var GOLD    = '#F5A623';
  var TEAL    = '#0D4F4F';
  var NAVY    = '#070F1A';


  // ─── STATE LABELS ────────────────────────────────────
  var STATE_LABELS = {
    nc: 'North Carolina', va: 'Virginia', sc: 'South Carolina',
    ga: 'Georgia', tx: 'Texas', ny: 'New York',
    ca: 'California', fl: 'Florida'
  };


  // ─── ENTITY LABELS ──────────────────────────────────
  var ENTITY_LABELS = {
    llc: 'LLC', scorp: 'S-Corporation',
    nonprofit: '501(c)(3) Nonprofit', sole: 'Sole Proprietorship'
  };


  // ─── FUNDING DATA ───────────────────────────────────

  var FUNDING_FEDERAL = [
    {
      title: 'SBA Microloan Program',
      desc: 'Small loans up to $50,000 for startups and small businesses through nonprofit intermediary lenders.',
      amount: 'Up to $50,000',
      link: 'https://www.sba.gov/funding-programs/loans/microloans',
      icon: 'microloan'
    },
    {
      title: 'SBA 7(a) Loan',
      desc: 'The SBA\'s primary business loan program for established businesses needing working capital or expansion funds.',
      amount: 'Up to $5,000,000',
      link: 'https://www.sba.gov/funding-programs/loans/7a-loans',
      icon: 'loan'
    },
    {
      title: 'SBA Community Advantage',
      desc: 'Loans designed specifically for businesses in underserved and low-to-moderate income communities.',
      amount: 'Up to $350,000',
      link: 'https://www.sba.gov/funding-programs/loans',
      icon: 'community'
    },
    {
      title: 'USDA Rural Business Grants',
      desc: 'Federal grants and loans for businesses located in rural areas. Multiple programs available.',
      amount: 'Varies by program',
      link: 'https://www.rd.usda.gov/programs-services/business-programs',
      icon: 'rural'
    }
  ];

  var FUNDING_NONPROFIT = [
    {
      title: 'Foundation Center / Candid',
      desc: 'The most comprehensive database of foundation grants, grantmaker profiles, and nonprofit resources.',
      amount: 'Varies',
      link: 'https://candid.org',
      icon: 'foundation'
    },
    {
      title: 'Grants.gov',
      desc: 'The central clearinghouse for all federal grant opportunities. Search and apply for thousands of grants.',
      amount: 'Varies',
      link: 'https://www.grants.gov',
      icon: 'grants'
    },
    {
      title: 'State Arts & Humanities Councils',
      desc: 'State-level grant programs for arts, culture, and humanities organizations. Check your state council.',
      amount: 'Varies by state',
      link: 'https://www.arts.gov/initiatives/state-regional',
      icon: 'arts'
    }
  ];

  var FUNDING_CDFI = [
    {
      title: 'CDFI Fund Locator',
      desc: 'Find Community Development Financial Institutions near you that provide affordable loans to underserved communities.',
      amount: 'Varies',
      link: 'https://www.cdfifund.gov/',
      icon: 'cdfi'
    },
    {
      title: 'Opportunity Finance Network',
      desc: 'National network of CDFIs. Use their locator to find mission-driven lenders in your area.',
      amount: 'Varies',
      link: 'https://ofn.org/cdfi-locator',
      icon: 'network'
    }
  ];

  var FUNDING_ALTERNATIVE = [
    {
      title: 'Kiva',
      desc: 'Crowdfunded microloans at 0% interest. Build your loan profile and get funded by real people.',
      amount: 'Up to $15,000',
      link: 'https://www.kiva.org/borrow',
      icon: 'kiva'
    },
    {
      title: 'Accion Opportunity Fund',
      desc: 'Affordable microloans for underserved entrepreneurs, especially women and minority-owned businesses.',
      amount: 'Up to $250,000',
      link: 'https://www.accionopportunityfund.org',
      icon: 'accion'
    },
    {
      title: 'Hello Alice',
      desc: 'A platform that matches small businesses with grants, loans, and resources. Free to join.',
      amount: 'Grant amounts vary',
      link: 'https://helloalice.com/grants',
      icon: 'alice'
    },
    {
      title: 'SCORE Mentorship',
      desc: 'Free one-on-one business mentoring from experienced professionals. 10,000+ volunteer mentors nationwide.',
      amount: 'Free',
      link: 'https://www.score.org',
      icon: 'score'
    }
  ];


  // ─── SOCIAL PLATFORMS ───────────────────────────────

  var SOCIAL_PLATFORMS = [
    {
      name: 'Domain (.com)',
      slugType: 'domain',
      urlPattern: 'https://www.namecheap.com/domains/registration/results/?domain={slug}.com',
      what: 'Check if your .com domain is available',
      icon: 'globe'
    },
    {
      name: 'Domain (.org)',
      slugType: 'domain',
      urlPattern: 'https://www.namecheap.com/domains/registration/results/?domain={slug}.org',
      what: 'Check if your .org domain is available',
      icon: 'globe'
    },
    {
      name: 'Instagram',
      slugType: 'nohyphen',
      urlPattern: 'https://www.instagram.com/{slug}/',
      what: 'Check if your username is taken',
      icon: 'instagram'
    },
    {
      name: 'Facebook',
      slugType: 'hyphen',
      urlPattern: 'https://www.facebook.com/{slug}',
      what: 'Check if your page name is available',
      icon: 'facebook'
    },
    {
      name: 'TikTok',
      slugType: 'nohyphen',
      urlPattern: 'https://www.tiktok.com/@{slug}',
      what: 'Check if your handle is taken',
      icon: 'tiktok'
    },
    {
      name: 'LinkedIn',
      slugType: 'hyphen',
      urlPattern: 'https://www.linkedin.com/company/{slug}',
      what: 'Check company page availability',
      icon: 'linkedin'
    },
    {
      name: 'Google Business',
      slugType: 'none',
      urlPattern: 'https://business.google.com/create',
      what: 'Create your Google Business Profile',
      icon: 'google'
    }
  ];


  // ─── COMPLIANCE DEADLINES ───────────────────────────

  var COMPLIANCE_ALL = [
    { label: 'EIN Application', when: 'Immediately after formation', priority: 'immediate' },
    { label: 'Business Bank Account', when: 'Within 1 week of receiving EIN', priority: 'immediate' },
    { label: 'Business Insurance', when: 'Before starting operations', priority: 'immediate' }
  ];

  var COMPLIANCE_LLC = [
    { label: 'Annual Report', when: 'Check your state Secretary of State website for due date', priority: 'annual' },
    { label: 'Franchise Tax (if applicable)', when: 'TX: May 15 annually, CA: $800 minimum due by Apr 15', priority: 'annual' },
    { label: 'Quarterly Estimated Taxes', when: 'Apr 15, Jun 15, Sep 15, Jan 15', priority: 'quarterly' }
  ];

  var COMPLIANCE_SCORP = [
    { label: 'S-Election (Form 2553)', when: 'Within 75 days of formation or by March 15', priority: 'immediate' },
    { label: 'Annual Report', when: 'State-specific deadline; check your Secretary of State', priority: 'annual' },
    { label: 'Payroll Tax Setup', when: 'Before issuing your first paycheck', priority: 'immediate' },
    { label: 'Form 941 (Quarterly Payroll)', when: 'End of each quarter: Apr 30, Jul 31, Oct 31, Jan 31', priority: 'quarterly' },
    { label: 'W-2s & 1099s', when: 'January 31 annually', priority: 'annual' },
    { label: 'Corporate Tax Return (1120-S)', when: 'March 15 annually', priority: 'annual' }
  ];

  var COMPLIANCE_NONPROFIT = [
    { label: '501(c)(3) Application (Form 1023/1023-EZ)', when: 'Within 27 months of formation for retroactive exemption', priority: 'immediate' },
    { label: 'State Charitable Solicitation Registration', when: 'Before soliciting any donations in your state', priority: 'immediate' },
    { label: 'Form 990 / 990-N / 990-EZ', when: 'May 15 (or 4.5 months after fiscal year end)', priority: 'annual' },
    { label: 'Annual Report', when: 'State-specific deadline; check your Secretary of State', priority: 'annual' },
    { label: 'Board Meetings', when: 'At least quarterly recommended; document all minutes', priority: 'quarterly' }
  ];

  var COMPLIANCE_SOLE = [
    { label: 'Schedule C (Tax Return)', when: 'April 15 annually, filed with your personal 1040', priority: 'annual' },
    { label: 'Quarterly Estimated Taxes', when: 'Apr 15, Jun 15, Sep 15, Jan 15', priority: 'quarterly' },
    { label: 'DBA Renewal', when: 'Every 5 years (varies by state and county)', priority: 'annual' }
  ];


  // ─── BELLA FAQ DATA ─────────────────────────────────

  var BELLA_FAQ = [
    {
      q: 'What is the difference between an LLC and S-Corp?',
      a: 'An LLC (Limited Liability Company) is a business structure that protects your personal assets from business debts and lawsuits. Profits pass through to your personal tax return, and you pay self-employment tax on all net income.\n\nAn S-Corporation is a tax election, not a business structure. You can form an LLC and then elect S-Corp tax treatment. The main benefit is that you pay yourself a reasonable salary (subject to payroll taxes), and any remaining profit is distributed as dividends not subject to self-employment tax.\n\nMost businesses under $80K-$100K in annual profit are better off as a standard LLC. Once profits exceed that threshold, the S-Corp election can save thousands in self-employment taxes. Talk to a CPA before making this decision.'
    },
    {
      q: 'How much does it cost to start a business?',
      a: 'The cost varies significantly by state and business type. For an LLC, expect to pay $50-$500 in state filing fees, $0 for your EIN (free from the IRS), $25-$300 for a business license, and $400-$3,000 annually for insurance.\n\nA sole proprietorship is the cheapest option with minimal or no filing fees. An S-Corporation has similar filing costs to an LLC but adds ongoing payroll processing expenses. A 501(c)(3) nonprofit has a $275-$600 IRS application fee on top of state filing.\n\nThrough Think! Ventures, we handle the formation paperwork, website, and branding at zero cost to you. Your main out-of-pocket expenses will be state filing fees, insurance, and any industry-specific licenses.'
    },
    {
      q: 'Do I need a business license?',
      a: 'In most cases, yes. Almost every city and county requires some form of business privilege license or operating permit. The requirements depend on your location and industry.\n\nSome industries, like food service, construction, and health/beauty, require additional specialized licenses and certifications. Professional services like accounting, legal, and engineering require state board licenses.\n\nCheck with your city and county clerk\'s office for local requirements. Your state\'s Secretary of State website will list state-level requirements. We include specific licensing guidance in your roadmap above.'
    },
    {
      q: 'What is an EIN and how do I get one?',
      a: 'An EIN (Employer Identification Number) is essentially a Social Security number for your business. The IRS issues it for free, and you need it to open a business bank account, file taxes, and hire employees.\n\nYou can apply online at IRS.gov in about 10 minutes. The process is straightforward: answer questions about your business structure, responsible party, and activity. You receive your EIN immediately upon completion.\n\nSole proprietors without employees can technically use their Social Security number, but getting an EIN is still recommended. It protects your SSN on invoices and business documents, and you will need one eventually when you grow.'
    },
    {
      q: 'Should I form an LLC or Sole Proprietorship?',
      a: 'For most new businesses, we recommend forming an LLC. The key advantage is personal liability protection. If your business is sued or incurs debt, your personal assets (home, car, savings) are generally protected.\n\nA sole proprietorship is simpler and cheaper, with no formation paperwork required. However, there is no legal separation between you and the business. If someone sues your business, they can go after your personal assets.\n\nThe filing fee for an LLC is typically $50-$300 depending on your state. This one-time cost is a small price for the peace of mind that comes with liability protection. If budget is extremely tight, start as a sole prop and convert to an LLC once revenue allows.'
    },
    {
      q: 'What insurance do I need?',
      a: 'At minimum, most businesses need General Liability Insurance, which covers third-party bodily injury, property damage, and advertising injury claims. Annual premiums typically range from $400 to $1,500.\n\nDepending on your industry, you may also need Professional Liability (errors and omissions) for service businesses, Product Liability for physical goods, Commercial Auto if you use vehicles for business, and Workers Compensation once you hire employees.\n\nWe recommend getting quotes from multiple providers. Online platforms like Next Insurance and The Hartford make it easy to compare. Many policies can be started for under $50 per month. Check your roadmap\'s insurance section above for industry-specific recommendations.'
    },
    {
      q: 'How do I file for 501(c)(3) status?',
      a: 'Filing for 501(c)(3) tax-exempt status involves several steps. First, incorporate as a nonprofit corporation with your state. Then apply to the IRS using Form 1023 (for larger organizations, $600 fee) or Form 1023-EZ (for smaller organizations under $250K in gross receipts, $275 fee).\n\nYour application must include articles of incorporation with specific IRS-required language, bylaws, a conflict of interest policy, a narrative description of your activities, and financial projections for three years.\n\nThe timeline is typically 3-6 months for Form 1023-EZ and 6-18 months for the full Form 1023. File within 27 months of incorporation to receive retroactive tax-exempt status from your formation date. Many organizations hire a nonprofit attorney for this process, which costs $1,500-$5,000.'
    },
    {
      q: 'What is a registered agent?',
      a: 'A registered agent is a person or company designated to receive official legal and government correspondence on behalf of your business. This includes service of process (lawsuits), state compliance notices, tax documents, and annual report reminders.\n\nEvery state requires LLCs and corporations to maintain a registered agent with a physical street address in the state of formation. You can serve as your own registered agent, but this means your personal address becomes public record and you must be available during business hours.\n\nProfessional registered agent services cost $50-$300 per year and provide a business address, privacy protection, and mail forwarding. Popular options include Northwest Registered Agent, Incfile, and LegalZoom. Many formation services include a free year of registered agent service.'
    },
    {
      q: 'How long does it take to form a business?',
      a: 'Timeline varies by state and entity type. A sole proprietorship can be started immediately with no formal filing. An LLC typically takes 3-10 business days for state processing, though some states offer expedited processing for an additional fee.\n\nAfter state filing, you can apply for your EIN online (immediate), open a business bank account (1-2 days), and apply for business licenses (1-4 weeks depending on industry). The entire process from start to operations typically takes 2-4 weeks.\n\nFor S-Corporations, add time for the S-Election filing (Form 2553). For nonprofits, add 3-18 months for the IRS 501(c)(3) determination. Through Think! Ventures, we streamline this process and handle the paperwork, typically getting businesses operational within 2 weeks.'
    },
    {
      q: 'Can I change my business structure later?',
      a: 'Yes, you can change your business structure, though the process and complexity vary. Converting from a sole proprietorship to an LLC is straightforward: file articles of organization with your state, get a new EIN, and update your business accounts.\n\nConverting from an LLC to an S-Corporation is simple since it is just a tax election change using Form 2553. Converting from any structure to a nonprofit is more complex and typically requires dissolving the existing entity and forming a new one.\n\nKeep in mind that structural changes may trigger tax consequences. Converting a sole proprietorship to an LLC is generally tax-neutral, but converting an LLC to a C-Corporation can create taxable events. Always consult with a CPA or tax attorney before making structural changes to understand the financial implications.'
    }
  ];


  // ─── ICONS (inline SVG, Tier 2 specific) ────────────

  var ICON2 = {
    funding:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>',
    globe:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"/></svg>',
    calendar:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    chat:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    external:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    check:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    send:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    dollar:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    star:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    users:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    heart:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    gift:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    facebook:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
    tiktok:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 104 4V4c1 2.5 3.5 4 6 4"/></svg>',
    linkedin:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    google:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>',
    clock:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    chevDown:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    chevUp:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'
  };


  // ─── HELPERS ─────────────────────────────────────────

  /** Read wizard selections from globals (same pattern as Tier 1). */
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

  /** Escape HTML entities. */
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Slugify for domains (lowercase, strip specials, hyphens for spaces). */
  function slugDomain(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  /** Slugify for social handles (no hyphens, no spaces). */
  function slugHandle(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /** Build a slug based on the platform type. */
  function buildSlug(name, type) {
    if (type === 'domain') return slugDomain(name);
    if (type === 'nohyphen') return slugHandle(name);
    if (type === 'hyphen') return slugDomain(name);
    return '';
  }

  /** Build a URL from a pattern + slug. */
  function buildUrl(pattern, slug) {
    return pattern.replace('{slug}', slug);
  }


  // ═══════════════════════════════════════════════════════
  //  INJECT CSS
  // ═══════════════════════════════════════════════════════
  function injectStyles() {
    if (document.getElementById('lpx2-styles')) return;
    var s = document.createElement('style');
    s.id = 'lpx2-styles';
    s.textContent = [

      /* ── Shared Section Card ── */
      '.lpx2-section {',
      '  margin-top: var(--sp-2xl, 2rem);',
      '  padding: var(--sp-xl, 1.5rem) var(--sp-xl, 1.5rem) var(--sp-lg, 1.25rem);',
      '  background: rgba(255,255,255,0.03);',
      '  backdrop-filter: blur(16px);',
      '  -webkit-backdrop-filter: blur(16px);',
      '  border: 1px solid rgba(255,255,255,0.08);',
      '  border-radius: var(--border-radius-lg, 16px);',
      '  animation: fadeIn 0.4s ease;',
      '}',
      '.lpx2-section:hover {',
      '  border-color: rgba(16,185,129,0.2);',
      '}',

      /* ── Section Header ── */
      '.lpx2-header {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: var(--sp-md, 0.75rem);',
      '  margin-bottom: var(--sp-lg, 1.25rem);',
      '}',
      '.lpx2-header__icon {',
      '  width: 44px; height: 44px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  border-radius: var(--border-radius-md, 12px);',
      '  flex-shrink: 0; color: #fff;',
      '}',
      '.lpx2-header__icon svg { width: 22px; height: 22px; }',
      '.lpx2-header__icon--emerald { background: linear-gradient(135deg, #10B981 0%, #0D4F4F 100%); }',
      '.lpx2-header__icon--gold    { background: linear-gradient(135deg, #F5A623 0%, #e6951e 100%); }',
      '.lpx2-header__icon--teal    { background: linear-gradient(135deg, #0D4F4F 0%, #083838 100%); }',
      '.lpx2-title {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 800;',
      '  font-size: var(--fs-xl, 1.25rem);',
      '  color: #F5A623;',
      '}',
      '.lpx2-subtitle {',
      '  font-family: var(--font-body, "Inter", sans-serif);',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  margin-top: 2px;',
      '}',
      '.lpx2-desc {',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  line-height: 1.6;',
      '  margin-bottom: var(--sp-md, 0.75rem);',
      '}',

      /* ── Group Label ── */
      '.lpx2-group-label {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-base, 1rem);',
      '  color: #fff;',
      '  margin-top: var(--sp-xl, 1.5rem);',
      '  margin-bottom: var(--sp-md, 0.75rem);',
      '  padding-bottom: var(--sp-xs, 0.25rem);',
      '  border-bottom: 1px solid rgba(255,255,255,0.06);',
      '}',

      /* ══ FUNDING GRID ══ */
      '.lpx2-fund-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));',
      '  gap: var(--sp-md, 0.75rem);',
      '}',
      '.lpx2-fund-card {',
      '  padding: var(--sp-lg, 1.25rem);',
      '  background: rgba(255,255,255,0.03);',
      '  border: 1px solid rgba(255,255,255,0.06);',
      '  border-radius: var(--border-radius-sm, 8px);',
      '  transition: border-color 0.3s ease, transform 0.3s ease;',
      '  display: flex; flex-direction: column;',
      '}',
      '.lpx2-fund-card:hover {',
      '  border-color: rgba(16,185,129,0.3);',
      '  transform: translateY(-2px);',
      '}',
      '.lpx2-fund-card__icon {',
      '  width: 36px; height: 36px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  border-radius: 8px;',
      '  background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(13,79,79,0.15));',
      '  color: #10B981;',
      '  margin-bottom: var(--sp-sm, 0.5rem);',
      '}',
      '.lpx2-fund-card__icon svg { width: 18px; height: 18px; }',
      '.lpx2-fund-card__title {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-base, 1rem);',
      '  color: #fff;',
      '  margin-bottom: var(--sp-xs, 0.25rem);',
      '}',
      '.lpx2-fund-card__desc {',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  line-height: 1.5;',
      '  flex: 1;',
      '  margin-bottom: var(--sp-sm, 0.5rem);',
      '}',
      '.lpx2-fund-card__amount {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: #10B981;',
      '  margin-bottom: var(--sp-sm, 0.5rem);',
      '}',
      '.lpx2-fund-card__link {',
      '  display: inline-flex; align-items: center; gap: 6px;',
      '  padding: 8px 16px;',
      '  background: linear-gradient(135deg, #10B981, #0D4F4F);',
      '  color: #fff;',
      '  border: none; border-radius: 6px;',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 600; font-size: 0.8rem;',
      '  text-decoration: none;',
      '  transition: transform 0.2s, box-shadow 0.2s;',
      '  align-self: flex-start;',
      '}',
      '.lpx2-fund-card__link:hover {',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 4px 14px rgba(16,185,129,0.3);',
      '  color: #fff;',
      '}',
      '.lpx2-fund-card__link svg { width: 14px; height: 14px; }',
      '.lpx2-cdfi-note {',
      '  margin-bottom: var(--sp-md, 0.75rem);',
      '  padding: var(--sp-md, 0.75rem) var(--sp-lg, 1rem);',
      '  background: rgba(16,185,129,0.06);',
      '  border-left: 3px solid #10B981;',
      '  border-radius: 0 8px 8px 0;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  line-height: 1.6;',
      '}',
      '.lpx2-cdfi-note strong { color: #10B981; }',

      /* ══ SOCIAL / DOMAIN GRID ══ */
      '.lpx2-social-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));',
      '  gap: var(--sp-md, 0.75rem);',
      '}',
      '.lpx2-social-card {',
      '  padding: var(--sp-lg, 1.25rem);',
      '  background: rgba(255,255,255,0.03);',
      '  border: 1px solid rgba(255,255,255,0.06);',
      '  border-radius: var(--border-radius-sm, 8px);',
      '  text-align: center;',
      '  transition: border-color 0.3s ease, transform 0.3s ease;',
      '}',
      '.lpx2-social-card:hover {',
      '  border-color: rgba(245,166,35,0.3);',
      '  transform: translateY(-2px);',
      '}',
      '.lpx2-social-card__icon {',
      '  width: 40px; height: 40px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  border-radius: 10px;',
      '  background: linear-gradient(135deg, rgba(245,166,35,0.12), rgba(245,166,35,0.04));',
      '  color: #F5A623;',
      '  margin: 0 auto var(--sp-sm, 0.5rem);',
      '}',
      '.lpx2-social-card__icon svg { width: 20px; height: 20px; }',
      '.lpx2-social-card__name {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-base, 1rem);',
      '  color: #fff;',
      '  margin-bottom: 4px;',
      '}',
      '.lpx2-social-card__what {',
      '  font-size: var(--fs-xs, 0.75rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  margin-bottom: var(--sp-md, 0.75rem);',
      '  line-height: 1.4;',
      '}',
      '.lpx2-social-card__btn {',
      '  display: inline-flex; align-items: center; gap: 6px;',
      '  padding: 8px 16px;',
      '  background: linear-gradient(135deg, #F5A623, #e6951e);',
      '  color: #070F1A;',
      '  border: none; border-radius: 6px;',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700; font-size: 0.8rem;',
      '  text-decoration: none;',
      '  transition: transform 0.2s, box-shadow 0.2s;',
      '}',
      '.lpx2-social-card__btn:hover {',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 4px 14px rgba(245,166,35,0.3);',
      '  color: #070F1A;',
      '}',
      '.lpx2-social-card__btn svg { width: 14px; height: 14px; }',
      '.lpx2-tip {',
      '  margin-top: var(--sp-lg, 1.25rem);',
      '  padding: var(--sp-md, 0.75rem) var(--sp-lg, 1rem);',
      '  background: rgba(245,166,35,0.06);',
      '  border-left: 3px solid #F5A623;',
      '  border-radius: 0 8px 8px 0;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  line-height: 1.6;',
      '}',
      '.lpx2-tip strong { color: #F5A623; }',

      /* ══ COMPLIANCE TIMELINE ══ */
      '.lpx2-timeline {',
      '  position: relative;',
      '  padding-left: 32px;',
      '  margin-top: var(--sp-lg, 1.25rem);',
      '}',
      '.lpx2-timeline::before {',
      '  content: "";',
      '  position: absolute;',
      '  left: 11px; top: 0; bottom: 0;',
      '  width: 2px;',
      '  background: rgba(255,255,255,0.08);',
      '}',
      '.lpx2-tl-group {',
      '  margin-bottom: var(--sp-lg, 1.25rem);',
      '}',
      '.lpx2-tl-group__label {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: #F5A623;',
      '  text-transform: uppercase;',
      '  letter-spacing: 1.5px;',
      '  margin-bottom: var(--sp-sm, 0.5rem);',
      '  position: relative;',
      '}',
      '.lpx2-tl-item {',
      '  position: relative;',
      '  padding: var(--sp-sm, 0.5rem) 0 var(--sp-sm, 0.5rem) var(--sp-md, 0.75rem);',
      '  border-bottom: 1px solid rgba(255,255,255,0.03);',
      '}',
      '.lpx2-tl-item:last-child { border-bottom: none; }',
      '.lpx2-tl-dot {',
      '  position: absolute;',
      '  left: -26px; top: 12px;',
      '  width: 12px; height: 12px;',
      '  border-radius: 50%;',
      '  border: 2px solid;',
      '}',
      '.lpx2-tl-dot--immediate {',
      '  background: #10B981;',
      '  border-color: #10B981;',
      '  box-shadow: 0 0 8px rgba(16,185,129,0.4);',
      '}',
      '.lpx2-tl-dot--quarterly {',
      '  background: #F5A623;',
      '  border-color: #F5A623;',
      '  box-shadow: 0 0 8px rgba(245,166,35,0.4);',
      '}',
      '.lpx2-tl-dot--annual {',
      '  background: #0D4F4F;',
      '  border-color: #0D4F4F;',
      '  box-shadow: 0 0 8px rgba(13,79,79,0.4);',
      '}',
      '.lpx2-tl-item__label {',
      '  font-family: var(--font-heading, "Outfit", sans-serif);',
      '  font-weight: 700;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: #fff;',
      '}',
      '.lpx2-tl-item__when {',
      '  font-size: var(--fs-xs, 0.75rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '  margin-top: 2px;',
      '  line-height: 1.4;',
      '}',
      '.lpx2-legend {',
      '  display: flex; gap: var(--sp-lg, 1.25rem);',
      '  margin-top: var(--sp-lg, 1.25rem);',
      '  flex-wrap: wrap;',
      '}',
      '.lpx2-legend__item {',
      '  display: flex; align-items: center; gap: 6px;',
      '  font-size: var(--fs-xs, 0.75rem);',
      '  color: var(--color-text-muted, #9ca3af);',
      '}',
      '.lpx2-legend__dot {',
      '  width: 10px; height: 10px;',
      '  border-radius: 50%;',
      '  flex-shrink: 0;',
      '}',

      /* ══ BELLA CHAT ══ */
      '.lpx2-chat {',
      '  overflow: hidden;',
      '}',
      '.lpx2-chat-toggle {',
      '  display: flex; align-items: center; justify-content: space-between;',
      '  width: 100%;',
      '  padding: 0;',
      '  background: none; border: none;',
      '  cursor: pointer;',
      '  color: inherit;',
      '}',
      '.lpx2-chat-toggle svg { width: 20px; height: 20px; color: #F5A623; transition: transform 0.3s ease; }',
      '.lpx2-chat-body {',
      '  max-height: 0;',
      '  overflow: hidden;',
      '  transition: max-height 0.4s ease;',
      '}',
      '.lpx2-chat-body.lpx2-open {',
      '  max-height: 2000px;',
      '}',
      '.lpx2-chat-questions {',
      '  display: flex; flex-wrap: wrap; gap: 8px;',
      '  margin: var(--sp-lg, 1.25rem) 0;',
      '}',
      '.lpx2-chat-q {',
      '  padding: 8px 14px;',
      '  background: rgba(245,166,35,0.08);',
      '  border: 1px solid rgba(245,166,35,0.2);',
      '  border-radius: 20px;',
      '  font-family: var(--font-body, "Inter", sans-serif);',
      '  font-size: var(--fs-xs, 0.75rem);',
      '  color: var(--color-text, #e5e7eb);',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  text-align: left;',
      '}',
      '.lpx2-chat-q:hover {',
      '  background: rgba(245,166,35,0.15);',
      '  border-color: #F5A623;',
      '  color: #fff;',
      '  transform: translateY(-1px);',
      '}',
      '.lpx2-chat-log {',
      '  display: flex; flex-direction: column; gap: var(--sp-md, 0.75rem);',
      '  max-height: 500px; overflow-y: auto;',
      '  padding: var(--sp-sm, 0.5rem) 0;',
      '  scroll-behavior: smooth;',
      '}',
      '.lpx2-chat-log::-webkit-scrollbar { width: 4px; }',
      '.lpx2-chat-log::-webkit-scrollbar-track { background: transparent; }',
      '.lpx2-chat-log::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }',

      /* User message */
      '.lpx2-msg-user {',
      '  align-self: flex-end;',
      '  max-width: 80%;',
      '  padding: 10px 16px;',
      '  background: linear-gradient(135deg, rgba(245,166,35,0.15), rgba(245,166,35,0.08));',
      '  border: 1px solid rgba(245,166,35,0.2);',
      '  border-radius: 16px 16px 4px 16px;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: #fff;',
      '  line-height: 1.5;',
      '}',

      /* Bella message */
      '.lpx2-msg-bella {',
      '  display: flex; gap: 10px; align-items: flex-start;',
      '  max-width: 90%;',
      '}',
      '.lpx2-msg-bella__avatar {',
      '  width: 36px; height: 36px;',
      '  border-radius: 50%;',
      '  object-fit: cover;',
      '  border: 2px solid #10B981;',
      '  flex-shrink: 0;',
      '}',
      '.lpx2-msg-bella__bubble {',
      '  padding: 12px 16px;',
      '  background: rgba(16,185,129,0.08);',
      '  border: 1px solid rgba(16,185,129,0.2);',
      '  border-radius: 4px 16px 16px 16px;',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  color: var(--color-text, #e5e7eb);',
      '  line-height: 1.6;',
      '  white-space: pre-line;',
      '}',

      /* Typing indicator */
      '.lpx2-typing {',
      '  display: flex; gap: 4px; align-items: center;',
      '  padding: 12px 20px;',
      '}',
      '.lpx2-typing__dot {',
      '  width: 8px; height: 8px;',
      '  background: #10B981;',
      '  border-radius: 50%;',
      '  animation: lpx2Bounce 1.4s ease-in-out infinite;',
      '}',
      '.lpx2-typing__dot:nth-child(2) { animation-delay: 0.2s; }',
      '.lpx2-typing__dot:nth-child(3) { animation-delay: 0.4s; }',
      '@keyframes lpx2Bounce {',
      '  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }',
      '  30% { transform: translateY(-8px); opacity: 1; }',
      '}',

      /* Chat input area */
      '.lpx2-chat-input {',
      '  display: flex; gap: 8px;',
      '  margin-top: var(--sp-md, 0.75rem);',
      '  padding-top: var(--sp-md, 0.75rem);',
      '  border-top: 1px solid rgba(255,255,255,0.06);',
      '}',
      '.lpx2-chat-input__field {',
      '  flex: 1;',
      '  padding: 10px 14px;',
      '  background: rgba(255,255,255,0.04);',
      '  border: 1px solid rgba(255,255,255,0.1);',
      '  border-radius: 8px;',
      '  color: var(--color-text-muted, #9ca3af);',
      '  font-family: var(--font-body, "Inter", sans-serif);',
      '  font-size: var(--fs-sm, 0.875rem);',
      '  outline: none;',
      '  cursor: default;',
      '}',
      '.lpx2-chat-input__field:focus {',
      '  border-color: rgba(245,166,35,0.3);',
      '}',
      '.lpx2-chat-input__field::placeholder { color: rgba(255,255,255,0.25); }',
      '.lpx2-chat-input__btn {',
      '  width: 40px; height: 40px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  background: rgba(255,255,255,0.06);',
      '  border: 1px solid rgba(255,255,255,0.1);',
      '  border-radius: 8px;',
      '  color: var(--color-text-muted, #9ca3af);',
      '  cursor: not-allowed;',
      '}',
      '.lpx2-chat-input__btn svg { width: 18px; height: 18px; }',
      '.lpx2-chat-input__note {',
      '  font-size: 0.7rem;',
      '  color: rgba(255,255,255,0.25);',
      '  margin-top: 6px;',
      '  font-style: italic;',
      '}',

      /* ── Responsive ── */
      '@media (max-width: 768px) {',
      '  .lpx2-fund-grid   { grid-template-columns: 1fr; }',
      '  .lpx2-social-grid { grid-template-columns: 1fr 1fr; }',
      '  .lpx2-legend      { flex-direction: column; gap: 6px; }',
      '  .lpx2-chat-questions { flex-direction: column; }',
      '  .lpx2-msg-user  { max-width: 95%; }',
      '  .lpx2-msg-bella { max-width: 95%; }',
      '}',
      '@media (max-width: 480px) {',
      '  .lpx2-social-grid { grid-template-columns: 1fr; }',
      '}',

      /* ── Print: hide Tier 2 extras ── */
      '@media print {',
      '  .lpx2-section { display: none !important; }',
      '}'

    ].join('\n');
    document.head.appendChild(s);
  }


  // ═══════════════════════════════════════════════════════
  //  SECTION 6: FUNDING & GRANTS DIRECTORY
  // ═══════════════════════════════════════════════════════
  function buildFundingDirectory(d) {
    var html = '';

    // Header
    html += '<div class="lpx2-header">';
    html += '  <div class="lpx2-header__icon lpx2-header__icon--gold">' + ICON2.funding + '</div>';
    html += '  <div>';
    html += '    <div class="lpx2-title">Find Funding for Your Business</div>';
    html += '    <div class="lpx2-subtitle">Grants, loans, and financial resources to launch and grow.</div>';
    html += '  </div>';
    html += '</div>';

    // Federal Programs
    html += '<div class="lpx2-group-label">Federal Programs</div>';
    html += '<div class="lpx2-fund-grid">';
    for (var i = 0; i < FUNDING_FEDERAL.length; i++) {
      html += buildFundCard(FUNDING_FEDERAL[i]);
    }
    html += '</div>';

    // Nonprofit-specific (only when entity is nonprofit)
    if (d.entityKey === 'nonprofit') {
      html += '<div class="lpx2-group-label">Nonprofit Grant Resources</div>';
      html += '<div class="lpx2-fund-grid">';
      for (var n = 0; n < FUNDING_NONPROFIT.length; n++) {
        html += buildFundCard(FUNDING_NONPROFIT[n]);
      }
      html += '</div>';
    }

    // CDFI Lenders
    html += '<div class="lpx2-group-label">CDFI Lenders</div>';
    html += '<div class="lpx2-cdfi-note">';
    html += '  <strong>What are CDFIs?</strong> Community Development Financial Institutions provide affordable loans, financial services, and technical assistance to underserved communities. They are certified by the U.S. Treasury.';
    html += '</div>';
    html += '<div class="lpx2-fund-grid">';
    for (var c = 0; c < FUNDING_CDFI.length; c++) {
      html += buildFundCard(FUNDING_CDFI[c]);
    }
    html += '</div>';

    // Alternative Funding
    html += '<div class="lpx2-group-label">Alternative Funding</div>';
    html += '<div class="lpx2-fund-grid">';
    for (var a = 0; a < FUNDING_ALTERNATIVE.length; a++) {
      html += buildFundCard(FUNDING_ALTERNATIVE[a]);
    }
    html += '</div>';

    var section = document.createElement('div');
    section.className = 'lpx2-section';
    section.id = 'lpx2-funding-directory';
    section.innerHTML = html;
    return section;
  }

  /** Build a single funding card. */
  function buildFundCard(item) {
    var h = '';
    h += '<div class="lpx2-fund-card">';
    h += '  <div class="lpx2-fund-card__icon">' + ICON2.dollar + '</div>';
    h += '  <div class="lpx2-fund-card__title">' + escHtml(item.title) + '</div>';
    h += '  <div class="lpx2-fund-card__desc">' + escHtml(item.desc) + '</div>';
    h += '  <div class="lpx2-fund-card__amount">' + escHtml(item.amount) + '</div>';
    h += '  <a href="' + item.link + '" target="_blank" rel="noopener" class="lpx2-fund-card__link">';
    h += '    ' + ICON2.external + ' Learn More';
    h += '  </a>';
    h += '</div>';
    return h;
  }


  // ═══════════════════════════════════════════════════════
  //  SECTION 7: DOMAIN & SOCIAL MEDIA CHECK
  // ═══════════════════════════════════════════════════════
  function buildDomainSocial(d) {
    var html = '';

    // Header
    html += '<div class="lpx2-header">';
    html += '  <div class="lpx2-header__icon lpx2-header__icon--emerald">' + ICON2.globe + '</div>';
    html += '  <div>';
    html += '    <div class="lpx2-title">Claim Your Digital Presence</div>';
    html += '    <div class="lpx2-subtitle">Secure your business name across the web before someone else does.</div>';
    html += '  </div>';
    html += '</div>';

    html += '<p class="lpx2-desc">Check availability for "<strong style="color:#fff;">' + escHtml(d.bizName) + '</strong>" across domains and social platforms.</p>';

    // Social grid
    html += '<div class="lpx2-social-grid">';
    for (var i = 0; i < SOCIAL_PLATFORMS.length; i++) {
      var p = SOCIAL_PLATFORMS[i];
      var slug = buildSlug(d.bizName, p.slugType);
      var url  = buildUrl(p.urlPattern, slug);

      html += '<div class="lpx2-social-card">';
      html += '  <div class="lpx2-social-card__icon">' + (ICON2[p.icon] || ICON2.globe) + '</div>';
      html += '  <div class="lpx2-social-card__name">' + escHtml(p.name) + '</div>';
      html += '  <div class="lpx2-social-card__what">' + escHtml(p.what) + '</div>';
      html += '  <a href="' + url + '" target="_blank" rel="noopener" class="lpx2-social-card__btn">';
      html += '    ' + ICON2.external + ' Check Availability';
      html += '  </a>';
      html += '</div>';
    }
    html += '</div>';

    // Tip
    html += '<div class="lpx2-tip">';
    html += '  <strong>Pro Tip:</strong> Secure your business name on all platforms before someone else does. Even if you are not active yet, register the accounts to protect your brand. Consistency across platforms builds trust and makes you easier to find.';
    html += '</div>';

    var section = document.createElement('div');
    section.className = 'lpx2-section';
    section.id = 'lpx2-domain-social';
    section.innerHTML = html;
    return section;
  }


  // ═══════════════════════════════════════════════════════
  //  SECTION 8: COMPLIANCE CALENDAR
  // ═══════════════════════════════════════════════════════
  function buildComplianceCalendar(d) {
    var html = '';

    // Header
    html += '<div class="lpx2-header">';
    html += '  <div class="lpx2-header__icon lpx2-header__icon--teal">' + ICON2.calendar + '</div>';
    html += '  <div>';
    html += '    <div class="lpx2-title">Your Compliance Calendar</div>';
    html += '    <div class="lpx2-subtitle">Never miss a deadline. Key dates for your ' + escHtml(ENTITY_LABELS[d.entityKey] || 'business') + '.</div>';
    html += '  </div>';
    html += '</div>';

    // Gather deadlines based on entity type
    var deadlines = [];

    // ALL entities
    deadlines.push({ group: 'Immediate / Formation', items: COMPLIANCE_ALL });

    // Entity-specific
    var entityItems = [];
    var groupLabel = '';

    if (d.entityKey === 'llc') {
      entityItems = COMPLIANCE_LLC;
      groupLabel = 'LLC Ongoing Compliance';
    } else if (d.entityKey === 'scorp') {
      entityItems = COMPLIANCE_SCORP;
      groupLabel = 'S-Corporation Ongoing Compliance';
    } else if (d.entityKey === 'nonprofit') {
      entityItems = COMPLIANCE_NONPROFIT;
      groupLabel = 'Nonprofit Ongoing Compliance';
    } else if (d.entityKey === 'sole') {
      entityItems = COMPLIANCE_SOLE;
      groupLabel = 'Sole Proprietorship Ongoing Compliance';
    }

    if (entityItems.length > 0) {
      deadlines.push({ group: groupLabel, items: entityItems });
    }

    // Build timeline
    html += '<div class="lpx2-timeline">';
    for (var g = 0; g < deadlines.length; g++) {
      var grp = deadlines[g];
      html += '<div class="lpx2-tl-group">';
      html += '  <div class="lpx2-tl-group__label">' + escHtml(grp.group) + '</div>';
      for (var t = 0; t < grp.items.length; t++) {
        var item = grp.items[t];
        html += '<div class="lpx2-tl-item">';
        html += '  <div class="lpx2-tl-dot lpx2-tl-dot--' + item.priority + '"></div>';
        html += '  <div class="lpx2-tl-item__label">' + escHtml(item.label) + '</div>';
        html += '  <div class="lpx2-tl-item__when">' + escHtml(item.when) + '</div>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Legend
    html += '<div class="lpx2-legend">';
    html += '  <div class="lpx2-legend__item"><div class="lpx2-legend__dot" style="background:#10B981;"></div> Immediate / Do Now</div>';
    html += '  <div class="lpx2-legend__item"><div class="lpx2-legend__dot" style="background:#F5A623;"></div> Quarterly / Recurring</div>';
    html += '  <div class="lpx2-legend__item"><div class="lpx2-legend__dot" style="background:#0D4F4F;"></div> Annual</div>';
    html += '</div>';

    var section = document.createElement('div');
    section.className = 'lpx2-section';
    section.id = 'lpx2-compliance-calendar';
    section.innerHTML = html;
    return section;
  }


  // ═══════════════════════════════════════════════════════
  //  SECTION 9: BELLA AI ASSISTANT (FAQ MODE)
  // ═══════════════════════════════════════════════════════
  function buildBellaChat() {
    var html = '';

    // Header with toggle
    html += '<button class="lpx2-chat-toggle" id="lpx2-chat-toggle" type="button">';
    html += '  <div class="lpx2-header" style="margin-bottom:0;">';
    html += '    <div class="lpx2-header__icon lpx2-header__icon--emerald">' + ICON2.chat + '</div>';
    html += '    <div>';
    html += '      <div class="lpx2-title">Ask Bella</div>';
    html += '      <div class="lpx2-subtitle">Your AI business assistant — tap a question to get started.</div>';
    html += '    </div>';
    html += '  </div>';
    html += '  <span id="lpx2-chat-chevron">' + ICON2.chevDown + '</span>';
    html += '</button>';

    // Collapsible body
    html += '<div class="lpx2-chat-body" id="lpx2-chat-body">';

    // Pre-loaded question chips
    html += '  <div class="lpx2-chat-questions" id="lpx2-chat-questions">';
    for (var i = 0; i < BELLA_FAQ.length; i++) {
      html += '    <button type="button" class="lpx2-chat-q" data-faq="' + i + '">' + escHtml(BELLA_FAQ[i].q) + '</button>';
    }
    html += '  </div>';

    // Chat log
    html += '  <div class="lpx2-chat-log" id="lpx2-chat-log"></div>';

    // Free-text input
    html += '  <div class="lpx2-chat-input">';
    html += '    <input type="text" class="lpx2-chat-input__field" placeholder="Type your question..." readonly>';
    html += '    <div class="lpx2-chat-input__btn">' + ICON2.send + '</div>';
    html += '  </div>';
    html += '  <div class="lpx2-chat-input__note">AI-powered answers coming soon. For now, browse common questions above.</div>';

    html += '</div>'; // end chat-body

    var section = document.createElement('div');
    section.className = 'lpx2-section lpx2-chat';
    section.id = 'lpx2-bella-chat';
    section.innerHTML = html;

    // Wire up events after DOM insertion (deferred)
    setTimeout(function() { initChatEvents(); }, 50);

    return section;
  }

  /** Initialize chat toggle and question click handlers. */
  function initChatEvents() {
    // Toggle open/close
    var toggle = document.getElementById('lpx2-chat-toggle');
    var body   = document.getElementById('lpx2-chat-body');
    var chev   = document.getElementById('lpx2-chat-chevron');
    if (toggle && body) {
      toggle.addEventListener('click', function() {
        var isOpen = body.classList.toggle('lpx2-open');
        if (chev) chev.innerHTML = isOpen ? ICON2.chevUp : ICON2.chevDown;
      });
      // Open by default
      body.classList.add('lpx2-open');
      if (chev) chev.innerHTML = ICON2.chevUp;
    }

    // Question chip clicks
    var questions = document.getElementById('lpx2-chat-questions');
    if (questions) {
      questions.addEventListener('click', function(e) {
        var btn = e.target.closest('.lpx2-chat-q');
        if (!btn) return;
        var idx = parseInt(btn.getAttribute('data-faq'), 10);
        if (isNaN(idx) || !BELLA_FAQ[idx]) return;
        askBella(idx);
      });
    }
  }

  /** Handle a FAQ question being asked. */
  function askBella(faqIndex) {
    var faq = BELLA_FAQ[faqIndex];
    var log = document.getElementById('lpx2-chat-log');
    if (!log || !faq) return;

    // Add user message
    var userMsg = document.createElement('div');
    userMsg.className = 'lpx2-msg-user';
    userMsg.textContent = faq.q;
    log.appendChild(userMsg);

    // Add typing indicator
    var typing = document.createElement('div');
    typing.className = 'lpx2-msg-bella';
    typing.innerHTML =
      '<img src="assets/images/bella-mascot.png" alt="Bella" class="lpx2-msg-bella__avatar">' +
      '<div class="lpx2-msg-bella__bubble">' +
      '  <div class="lpx2-typing">' +
      '    <div class="lpx2-typing__dot"></div>' +
      '    <div class="lpx2-typing__dot"></div>' +
      '    <div class="lpx2-typing__dot"></div>' +
      '  </div>' +
      '</div>';
    log.appendChild(typing);

    // Scroll to bottom
    log.scrollTop = log.scrollHeight;

    // Simulate typing delay then show answer
    var delay = 800 + Math.random() * 700;
    setTimeout(function() {
      // Replace typing with actual answer
      typing.innerHTML =
        '<img src="assets/images/bella-mascot.png" alt="Bella" class="lpx2-msg-bella__avatar">' +
        '<div class="lpx2-msg-bella__bubble">' + escHtml(faq.a) + '</div>';
      typing.style.animation = 'fadeIn 0.3s ease';

      // Scroll to bottom after render
      requestAnimationFrame(function() {
        log.scrollTop = log.scrollHeight;
      });
    }, delay);
  }


  // ═══════════════════════════════════════════════════════
  //  INJECT ALL TIER 2 SECTIONS
  // ═══════════════════════════════════════════════════════
  var tier2Injected = false;

  function injectTier2() {
    if (tier2Injected) return;

    // Wait for Tier 1 to finish injecting. If the last Tier 1 section
    // exists, inject after it. Otherwise, fall back to checklist-container.
    var anchor = document.getElementById('lpx-insurance-checklist')
              || document.getElementById('lpx-tax-guide')
              || document.getElementById('lpx-banking-guide')
              || document.getElementById('lpx-name-search')
              || document.getElementById('lpx-cost-calculator');

    if (!anchor) {
      // Tier 1 has not injected yet. Try the checklist-container.
      var checklist = document.getElementById('checklist-container');
      if (!checklist || checklist.children.length === 0) return;
      anchor = checklist;
    }

    var step4 = document.getElementById('step-4');
    if (!step4) return;

    tier2Injected = true;
    injectStyles();

    var d = getData();

    // Build all four Tier 2 sections
    var funding    = buildFundingDirectory(d);
    var domain     = buildDomainSocial(d);
    var compliance = buildComplianceCalendar(d);
    var bellaChat  = buildBellaChat();

    // Insert all sections in order, after the anchor
    var sections = [funding, domain, compliance, bellaChat];
    var insertAfter = anchor;

    for (var i = 0; i < sections.length; i++) {
      if (insertAfter.nextSibling) {
        insertAfter.parentNode.insertBefore(sections[i], insertAfter.nextSibling);
      } else {
        insertAfter.parentNode.appendChild(sections[i]);
      }
      insertAfter = sections[i];
    }
  }


  /** Remove all Tier 2 sections (for start-over resets). */
  function removeTier2() {
    var ids = [
      'lpx2-funding-directory',
      'lpx2-domain-social',
      'lpx2-compliance-calendar',
      'lpx2-bella-chat'
    ];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.remove();
    }
    tier2Injected = false;
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
            // Delay to let Tier 1 inject first
            setTimeout(injectTier2, 500);
          }
        }
      }
    });
    observer.observe(step4, { attributes: true });

    // Also watch the checklist for child additions (in case Tier 1
    // has not injected yet when step-4 activates)
    var checklist = document.getElementById('checklist-container');
    if (checklist) {
      var childObserver = new MutationObserver(function() {
        if (step4.classList.contains('active') && checklist.children.length > 0) {
          setTimeout(injectTier2, 400);
        }
      });
      childObserver.observe(checklist, { childList: true });
    }

    // Watch for Tier 1 sections appearing (they inject after checklist)
    var step4Observer = new MutationObserver(function() {
      if (step4.classList.contains('active') && !tier2Injected) {
        var lastTier1 = document.getElementById('lpx-insurance-checklist');
        if (lastTier1) {
          setTimeout(injectTier2, 200);
        }
      }
    });
    step4Observer.observe(step4, { childList: true, subtree: true });
  }


  // Strategy 2: Hook into generateRoadmap
  function hookRoadmap() {
    if (typeof window.generateRoadmap === 'function') {
      var original = window.generateRoadmap;
      window.generateRoadmap = function() {
        // Reset so we can re-inject with fresh data
        removeTier2();
        original.apply(this, arguments);
        // Longer delay than Tier 1 to ensure Tier 1 injects first
        setTimeout(injectTier2, 600);
      };
    }
  }


  // Strategy 3: Hook into startOver
  function hookStartOver() {
    if (typeof window.startOver === 'function') {
      var originalStartOver = window.startOver;
      window.startOver = function() {
        removeTier2();
        originalStartOver.apply(this, arguments);
      };
    }
  }


  // ─── INIT ─────────────────────────────────────────────
  function init() {
    watchStep4();
    hookRoadmap();
    hookStartOver();

    // If step-4 is already active on load (e.g. page reload with
    // saved progress), inject after a delay for Tier 1 to finish.
    var step4 = document.getElementById('step-4');
    if (step4 && step4.classList.contains('active')) {
      setTimeout(injectTier2, 600);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
