/* ============================================================
   THINK! VENTURES -- Entrepreneur Dashboard
   Handles auth guard, data loading, checklist engine, document
   vault, resources, stats, and give-back display.
   ============================================================ */

const Dashboard = (function () {
  'use strict';

  // ── Guard: Firebase must be available ─────────────────────
  if (typeof firebase === 'undefined' || typeof db === 'undefined' || typeof auth === 'undefined') {
    console.warn('[Dashboard] Firebase not available.');
    return {};
  }

  // ── Constants ─────────────────────────────────────────────
  const APPLICATIONS_COL = 'applications';
  const USERS_COL = 'users';
  const DASH_CHECKLIST_PATH = 'dashboard/checklist';
  const DASH_DOCUMENTS_PATH = 'dashboard/documents';

  const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 12 10 16 18 8"/></svg>';
  const UPLOAD_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
  const DOC_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const DOWNLOAD_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  const LINK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

  // ── Minimal Lookup Maps ───────────────────────────────────
  // Subset of data from launchpad.html -- only what we need for labels and checklist
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

  const INDUSTRY_LICENSES = {
    'home-services': [
      { title: 'Home Improvement Contractor License', desc: 'Required for residential contracting work over $30,000.', fee: '$75-$250', time: '2-4 weeks' },
      { title: 'Trade-Specific License', desc: 'Plumbing, electrical, or HVAC requires separate trade certification.', fee: 'Varies', time: '1-6 months' }
    ],
    'food-beverage': [
      { title: 'Food Establishment Permit', desc: 'Health department inspection and permit for food handling.', fee: '$50-$400', time: '2-6 weeks' },
      { title: 'Food Handler Certification', desc: 'Required for all food service employees.', fee: '$15-$25', time: '1 day' },
      { title: 'ABC Permit (if serving alcohol)', desc: 'State permit for serving or selling alcohol.', fee: '$400-$1,000', time: '4-8 weeks' }
    ],
    'health-beauty': [
      { title: 'Cosmetology License', desc: 'State board license for hair, nail, or skin services.', fee: '$50-$115', time: '2-4 weeks' },
      { title: 'Salon/Shop Registration', desc: 'Physical location must be registered and inspected.', fee: '$50-$100', time: '1-3 weeks' }
    ],
    'professional': [
      { title: 'Professional License (if applicable)', desc: 'Accounting (CPA), legal (Bar), or engineering require state licenses.', fee: 'Varies', time: 'Varies' },
      { title: 'Business Privilege License', desc: 'Local city/county business operating permit.', fee: '$25-$100', time: '1-2 weeks' }
    ],
    'retail': [
      { title: 'Retail Sales Tax Certificate', desc: 'Required for collecting and remitting sales tax.', fee: 'Free', time: '1-2 weeks' },
      { title: 'Resale Certificate', desc: 'Exempts wholesale purchases from sales tax.', fee: 'Free', time: '1 week' }
    ],
    'creative': [
      { title: 'Business Privilege License', desc: 'Standard local operating permit.', fee: '$25-$50', time: '1-2 weeks' },
      { title: 'Copyright Registration (optional)', desc: 'Federal copyright protection for original works.', fee: '$35-$55', time: '3-6 months' }
    ],
    'construction': [
      { title: 'General Contractor License', desc: 'Required for projects over $30,000.', fee: '$75-$400', time: '4-8 weeks' },
      { title: 'Workers Compensation Insurance', desc: 'Required if hiring employees in construction.', fee: 'Varies', time: '1-2 weeks' }
    ],
    'tech': [
      { title: 'Business Privilege License', desc: 'Standard local operating permit.', fee: '$25-$50', time: '1-2 weeks' }
    ],
    'education': [
      { title: 'Business Privilege License', desc: 'Standard local operating permit.', fee: '$25-$50', time: '1-2 weeks' },
      { title: 'Teaching Certification (if applicable)', desc: 'May be required for certain educational programs.', fee: 'Varies', time: 'Varies' }
    ]
  };

  const INDUSTRY_RESOURCES = {
    'home-services': [
      { title: 'Liability Insurance Guide', desc: 'Minimum coverage requirements for home service businesses.', link: '' },
      { title: 'Trade Certification Programs', desc: 'Free and low-cost training for plumbing, electrical, and HVAC.', link: '' }
    ],
    'food-beverage': [
      { title: 'Food Truck Startup Guide', desc: 'Step-by-step guide for launching a mobile food business.', link: '' },
      { title: 'Restaurant Financial Template', desc: 'Revenue projections and cost analysis for food businesses.', link: '' }
    ],
    'health-beauty': [
      { title: 'Salon Business Plan Template', desc: 'Industry-specific business plan with financial projections.', link: '' },
      { title: 'Client Management Tools', desc: 'Free scheduling and CRM tools for beauty professionals.', link: '' }
    ],
    'professional': [
      { title: 'Consulting Agreement Template', desc: 'Professional service contract template for client engagements.', link: '' },
      { title: 'Pricing Strategy Guide', desc: 'How to price professional services competitively.', link: '' }
    ],
    'retail': [
      { title: 'MerchEngine Guide', desc: 'How to set up zero-inventory e-commerce with print-on-demand.', link: '' },
      { title: 'Product Pricing Calculator', desc: 'Markup and margin calculator for retail products.', link: '' }
    ],
    'creative': [
      { title: 'Creative Services Contract', desc: 'Project agreement template for creative professionals.', link: '' },
      { title: 'Portfolio Building Guide', desc: 'How to showcase work and attract clients online.', link: '' }
    ],
    'construction': [
      { title: 'Job Costing Template', desc: 'Construction project estimation and bidding worksheet.', link: '' },
      { title: 'Insurance Requirements', desc: 'Minimum insurance coverage for construction businesses.', link: '' }
    ],
    'tech': [
      { title: 'SaaS Business Model Guide', desc: 'Subscription pricing, MRR tracking, and growth strategies.', link: '' },
      { title: 'Privacy Policy Template', desc: 'GDPR and CCPA compliant privacy policy generator.', link: '' }
    ],
    'education': [
      { title: 'Online Course Platform Guide', desc: 'How to build and sell courses on Teachable, Udemy, and more.', link: '' },
      { title: 'Student Management Tools', desc: 'Free tools for scheduling, invoicing, and tracking progress.', link: '' }
    ]
  };

  // All 50 states + DC -- title, SOS link, filing fees
  const STATE_DATA = {
    'nc': { title: 'North Carolina', sosLink: 'https://www.sosnc.gov', sosText: 'NC Secretary of State', llcFee: 125, corpFee: 125, nonprofitFee: 60 },
    'al': { title: 'Alabama', sosLink: 'https://www.sos.alabama.gov/business-entities', sosText: 'AL Secretary of State', llcFee: 200, corpFee: 200, nonprofitFee: 200 },
    'ak': { title: 'Alaska', sosLink: 'https://www.commerce.alaska.gov/cbp/main/search/entities', sosText: 'AK Division of Corporations', llcFee: 250, corpFee: 250, nonprofitFee: 50 },
    'az': { title: 'Arizona', sosLink: 'https://ecorp.azcc.gov/EntitySearch/Index', sosText: 'AZ Corporation Commission', llcFee: 50, corpFee: 60, nonprofitFee: 40 },
    'ar': { title: 'Arkansas', sosLink: 'https://www.sos.arkansas.gov/corps/search_all.php', sosText: 'AR Secretary of State', llcFee: 45, corpFee: 50, nonprofitFee: 50 },
    'ca': { title: 'California', sosLink: 'https://bizfileonline.sos.ca.gov/search/business', sosText: 'CA Secretary of State', llcFee: 70, corpFee: 100, nonprofitFee: 30 },
    'co': { title: 'Colorado', sosLink: 'https://www.sos.state.co.us/biz/BusinessEntityCriteriaExt.do', sosText: 'CO Secretary of State', llcFee: 50, corpFee: 50, nonprofitFee: 50 },
    'ct': { title: 'Connecticut', sosLink: 'https://service.ct.gov/business/s/onlinebusinesssearch', sosText: 'CT Secretary of State', llcFee: 120, corpFee: 250, nonprofitFee: 50 },
    'de': { title: 'Delaware', sosLink: 'https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx', sosText: 'DE Division of Corporations', llcFee: 90, corpFee: 89, nonprofitFee: 89 },
    'dc': { title: 'District of Columbia', sosLink: 'https://corponline.dcra.dc.gov/Home.aspx', sosText: 'DC Dept. of Licensing', llcFee: 99, corpFee: 220, nonprofitFee: 80 },
    'fl': { title: 'Florida', sosLink: 'https://dos.fl.gov/sunbiz/search/', sosText: 'FL Sunbiz', llcFee: 125, corpFee: 70, nonprofitFee: 35 },
    'ga': { title: 'Georgia', sosLink: 'https://ecorp.sos.ga.gov/BusinessSearch', sosText: 'GA Secretary of State', llcFee: 100, corpFee: 100, nonprofitFee: 100 },
    'hi': { title: 'Hawaii', sosLink: 'https://hbe.ehawaii.gov/documents/search.html', sosText: 'HI DCCA', llcFee: 50, corpFee: 50, nonprofitFee: 25 },
    'id': { title: 'Idaho', sosLink: 'https://sosbiz.idaho.gov/search/business', sosText: 'ID Secretary of State', llcFee: 100, corpFee: 100, nonprofitFee: 30 },
    'il': { title: 'Illinois', sosLink: 'https://www.ilsos.gov/corporatellc/', sosText: 'IL Secretary of State', llcFee: 150, corpFee: 150, nonprofitFee: 50 },
    'in': { title: 'Indiana', sosLink: 'https://bsd.sos.in.gov/publicbusinesssearch', sosText: 'IN Secretary of State', llcFee: 95, corpFee: 95, nonprofitFee: 30 },
    'ia': { title: 'Iowa', sosLink: 'https://sos.iowa.gov/search/business/(S(0))/search.aspx', sosText: 'IA Secretary of State', llcFee: 50, corpFee: 50, nonprofitFee: 20 },
    'ks': { title: 'Kansas', sosLink: 'https://www.sos.ks.gov/business/business-entities.html', sosText: 'KS Secretary of State', llcFee: 165, corpFee: 90, nonprofitFee: 20 },
    'ky': { title: 'Kentucky', sosLink: 'https://web.sos.ky.gov/bussearchnew/search', sosText: 'KY Secretary of State', llcFee: 40, corpFee: 50, nonprofitFee: 8 },
    'la': { title: 'Louisiana', sosLink: 'https://coraweb.sos.la.gov/commercialsearch/CommercialSearchAnon.aspx', sosText: 'LA Secretary of State', llcFee: 100, corpFee: 75, nonprofitFee: 75 },
    'me': { title: 'Maine', sosLink: 'https://icrs.informe.org/nei-sos-icrs/ICRS?MainPage=x', sosText: 'ME Secretary of State', llcFee: 175, corpFee: 145, nonprofitFee: 40 },
    'md': { title: 'Maryland', sosLink: 'https://egov.maryland.gov/BusinessExpress/EntitySearch', sosText: 'MD SDAT', llcFee: 100, corpFee: 120, nonprofitFee: 100 },
    'ma': { title: 'Massachusetts', sosLink: 'https://corp.sec.state.ma.us/corpweb/CorpSearch/CorpSearch.aspx', sosText: 'MA Secretary of the Commonwealth', llcFee: 500, corpFee: 275, nonprofitFee: 35 },
    'mi': { title: 'Michigan', sosLink: 'https://cofs.lara.state.mi.us/corpweb/CorpSearch/CorpSearch.aspx', sosText: 'MI LARA', llcFee: 50, corpFee: 60, nonprofitFee: 20 },
    'mn': { title: 'Minnesota', sosLink: 'https://mblsportal.sos.state.mn.us/Business/Search', sosText: 'MN Secretary of State', llcFee: 155, corpFee: 155, nonprofitFee: 70 },
    'ms': { title: 'Mississippi', sosLink: 'https://corp.sos.ms.gov/corp/portal/c/page/corpBusinessIdSearch/portal.aspx', sosText: 'MS Secretary of State', llcFee: 50, corpFee: 50, nonprofitFee: 50 },
    'mo': { title: 'Missouri', sosLink: 'https://bsd.sos.mo.gov/BusinessEntity/BESearch.aspx', sosText: 'MO Secretary of State', llcFee: 50, corpFee: 58, nonprofitFee: 25 },
    'mt': { title: 'Montana', sosLink: 'https://biz.sosmt.gov/search', sosText: 'MT Secretary of State', llcFee: 70, corpFee: 70, nonprofitFee: 20 },
    'ne': { title: 'Nebraska', sosLink: 'https://www.nebraska.gov/sos/corp/corpsearch.cgi', sosText: 'NE Secretary of State', llcFee: 105, corpFee: 60, nonprofitFee: 10 },
    'nv': { title: 'Nevada', sosLink: 'https://esos.nv.gov/EntitySearch/OnlineEntitySearch', sosText: 'NV Secretary of State', llcFee: 75, corpFee: 75, nonprofitFee: 50 },
    'nh': { title: 'New Hampshire', sosLink: 'https://quickstart.sos.nh.gov/online/BusinessInquire', sosText: 'NH Secretary of State', llcFee: 100, corpFee: 100, nonprofitFee: 25 },
    'nj': { title: 'New Jersey', sosLink: 'https://www.njportal.com/DOR/BusinessNameSearch', sosText: 'NJ Division of Revenue', llcFee: 125, corpFee: 125, nonprofitFee: 75 },
    'nm': { title: 'New Mexico', sosLink: 'https://portal.sos.state.nm.us/BFS/online/CorporationBusinessSearch', sosText: 'NM Secretary of State', llcFee: 50, corpFee: 100, nonprofitFee: 25 },
    'ny': { title: 'New York', sosLink: 'https://www.dos.ny.gov/corps/bus_entity_search.html', sosText: 'NY Department of State', llcFee: 200, corpFee: 125, nonprofitFee: 75 },
    'nd': { title: 'North Dakota', sosLink: 'https://firststop.sos.nd.gov/search/business', sosText: 'ND Secretary of State', llcFee: 135, corpFee: 100, nonprofitFee: 40 },
    'oh': { title: 'Ohio', sosLink: 'https://businesssearch.ohiosos.gov/', sosText: 'OH Secretary of State', llcFee: 99, corpFee: 99, nonprofitFee: 99 },
    'ok': { title: 'Oklahoma', sosLink: 'https://www.sos.ok.gov/business/corp/records.aspx', sosText: 'OK Secretary of State', llcFee: 100, corpFee: 50, nonprofitFee: 25 },
    'or': { title: 'Oregon', sosLink: 'https://sos.oregon.gov/business/pages/find.aspx', sosText: 'OR Secretary of State', llcFee: 100, corpFee: 100, nonprofitFee: 50 },
    'pa': { title: 'Pennsylvania', sosLink: 'https://www.corporations.pa.gov/search/corpsearch', sosText: 'PA Department of State', llcFee: 125, corpFee: 125, nonprofitFee: 125 },
    'ri': { title: 'Rhode Island', sosLink: 'https://business.sos.ri.gov/CorpWeb/CorpSearch/CorpSearch.aspx', sosText: 'RI Secretary of State', llcFee: 150, corpFee: 230, nonprofitFee: 35 },
    'sc': { title: 'South Carolina', sosLink: 'https://businessfilings.sc.gov/businessfiling', sosText: 'SC Secretary of State', llcFee: 110, corpFee: 135, nonprofitFee: 25 },
    'sd': { title: 'South Dakota', sosLink: 'https://sosenterprise.sd.gov/BusinessServices/Business/FilingSearch.aspx', sosText: 'SD Secretary of State', llcFee: 150, corpFee: 150, nonprofitFee: 30 },
    'tn': { title: 'Tennessee', sosLink: 'https://tnbear.tn.gov/ECommerce/FilingSearch.aspx', sosText: 'TN Secretary of State', llcFee: 300, corpFee: 100, nonprofitFee: 100 },
    'tx': { title: 'Texas', sosLink: 'https://www.sos.state.tx.us/corp/sosda/index.shtml', sosText: 'TX Secretary of State', llcFee: 300, corpFee: 300, nonprofitFee: 25 },
    'ut': { title: 'Utah', sosLink: 'https://secure.utah.gov/bes/', sosText: 'UT Corporations Division', llcFee: 54, corpFee: 70, nonprofitFee: 30 },
    'vt': { title: 'Vermont', sosLink: 'https://bizfilings.vermont.gov/online/BusinessInquire', sosText: 'VT Secretary of State', llcFee: 125, corpFee: 125, nonprofitFee: 75 },
    'va': { title: 'Virginia', sosLink: 'https://www.scc.virginia.gov/pages/Business-Entity-Search', sosText: 'VA State Corporation Commission', llcFee: 100, corpFee: 75, nonprofitFee: 75 },
    'wa': { title: 'Washington', sosLink: 'https://ccfs.sos.wa.gov/#/', sosText: 'WA Secretary of State', llcFee: 200, corpFee: 180, nonprofitFee: 30 },
    'wv': { title: 'West Virginia', sosLink: 'https://apps.wv.gov/SOS/BusinessEntitySearch/', sosText: 'WV Secretary of State', llcFee: 100, corpFee: 50, nonprofitFee: 25 },
    'wi': { title: 'Wisconsin', sosLink: 'https://www.wdfi.org/apps/CorpSearch/Search.aspx', sosText: 'WI DFI', llcFee: 130, corpFee: 100, nonprofitFee: 35 },
    'wy': { title: 'Wyoming', sosLink: 'https://wyobiz.wyo.gov/Business/FilingSearch.aspx', sosText: 'WY Secretary of State', llcFee: 100, corpFee: 100, nonprofitFee: 25 }
  };

  const ENTITY_DATA = {
    'llc': { title: 'LLC', feeKey: 'llcFee' },
    'sole': { title: 'Sole Proprietorship', feeKey: null },
    'scorp': { title: 'S-Corporation', feeKey: 'corpFee' },
    'nonprofit': { title: '501(c)(3) Nonprofit', feeKey: 'nonprofitFee' }
  };

  const DOCUMENT_SLOTS = [
    { id: 'articles', name: 'Articles of Incorporation', desc: 'Formation documents filed with your state' },
    { id: 'ein-letter', name: 'EIN Letter', desc: 'IRS confirmation of your Employer Identification Number' },
    { id: 'business-license', name: 'Business License', desc: 'Local city or county operating license' },
    { id: 'insurance-cert', name: 'Insurance Certificate', desc: 'Proof of general liability or professional insurance' },
    { id: 'operating-agreement', name: 'Operating Agreement', desc: 'Internal governance document for your entity' },
    { id: 'bank-statement', name: 'Bank Statement', desc: 'Business bank account verification' }
  ];

  const BELLA_MESSAGES = {
    explorer: "Welcome to Think! Ventures. Head over to the LaunchPad to start building your business -- I will guide you through every step.",
    builder: "You have started your journey -- that is the hardest part. Keep checking off those steps and you will be launching before you know it.",
    founder: "Look at you -- your entity structure is in place. You are officially building something real. Keep the momentum going.",
    operator: "You have completed every step on your checklist. You are officially running your business. I am so proud of you."
  };

  const UNIVERSAL_RESOURCES = [
    { title: 'SCORE Mentorship', desc: 'Free business mentorship from experienced entrepreneurs.', link: 'https://www.score.org' },
    { title: 'SBA Resources', desc: 'Small Business Administration tools, loans, and training.', link: 'https://www.sba.gov' },
    { title: 'IRS Small Business Center', desc: 'Tax guides, forms, and EIN application.', link: 'https://www.irs.gov/businesses/small-businesses-self-employed' }
  ];

  // ── Internal State ────────────────────────────────────────
  let _user = null;
  let _appData = null;
  let _userData = null;
  let _checklistState = {};
  let _documentsData = {};
  let _checklistItems = [];

  // ── Level System ──────────────────────────────────────────
  function getLevel() {
    if (!_appData) return 'explorer';
    const allDone = _checklistItems.length > 0 && _checklistItems.every(item => _checklistState[item.id]);
    if (allDone) return 'operator';
    if (_appData.selectedEntity) return 'founder';
    if (_appData.status === 'in-progress' || _appData.status === 'completed') return 'builder';
    return 'explorer';
  }

  function getLevelLabel(level) {
    const labels = {
      explorer: 'Explorer',
      builder: 'Builder',
      founder: 'Founder',
      operator: 'Operator'
    };
    return labels[level] || 'Explorer';
  }

  function getLevelDesc(level) {
    const descs = {
      explorer: 'Just getting started',
      builder: 'Roadmap in progress',
      founder: 'Entity selected',
      operator: 'All steps complete'
    };
    return descs[level] || '';
  }

  // ── Checklist Generation ──────────────────────────────────
  function generateChecklist(industry, stateKey, entityKey) {
    const items = [];
    const st = STATE_DATA[stateKey] || {};
    const ent = ENTITY_DATA[entityKey] || {};
    let idCounter = 0;

    function addItem(category, title, desc, opts) {
      items.push({
        id: 'item-' + (idCounter++),
        category: category,
        title: title,
        desc: desc,
        fee: (opts && opts.fee) || null,
        time: (opts && opts.time) || null,
        link: (opts && opts.link) || null,
        linkText: (opts && opts.linkText) || null
      });
    }

    // 1. Entity Formation
    if (entityKey !== 'sole') {
      const feeKey = ent.feeKey;
      const fee = feeKey && st[feeKey] ? st[feeKey] : 0;
      addItem('Entity Formation', 'File ' + (ent.title || 'Entity') + ' with ' + (st.title || 'your state'),
        'Submit formation documents to the Secretary of State.',
        { fee: fee ? '$' + fee : null, time: '1-2 weeks', link: st.sosLink, linkText: st.sosText || 'Secretary of State' });
    }

    addItem('Entity Formation', 'Get an EIN (Employer Identification Number)',
      'Free federal tax ID from the IRS. Required for banking and taxes.',
      { fee: 'Free', time: 'Immediate', link: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online', linkText: 'IRS EIN Application' });

    addItem('Entity Formation', 'Open a Business Bank Account',
      'Separate personal and business finances. Bring EIN and formation docs.',
      { time: '1 day' });

    if (entityKey === 'nonprofit') {
      addItem('Entity Formation', 'Apply for 501(c)(3) Tax-Exempt Status',
        'File Form 1023 or 1023-EZ with the IRS.',
        { fee: '$275-$600', time: '3-6 months', link: 'https://www.irs.gov/charities-non-profits/application-for-recognition-of-exemption', linkText: 'IRS Form 1023' });
    }

    // 2. Tax Registration
    addItem('Tax Registration', 'Register for State Taxes',
      'Sales tax, withholding, and unemployment insurance registration.',
      { fee: 'Free', time: '1-2 weeks' });
    addItem('Tax Registration', 'Understand Quarterly Tax Payments',
      'Self-employed individuals must pay estimated taxes quarterly.',
      { time: 'Ongoing' });

    // 3. Industry Licenses
    const licenses = INDUSTRY_LICENSES[industry] || [];
    licenses.forEach(function (lic) {
      addItem('Industry Licenses & Permits', lic.title, lic.desc,
        { fee: lic.fee, time: lic.time, link: lic.link, linkText: lic.linkText });
    });

    // 4. Insurance
    addItem('Insurance', 'General Liability Insurance',
      'Protects against lawsuits, property damage, and injury claims.',
      { fee: '$30-$100/mo', time: '1-3 days' });
    addItem('Insurance', 'Professional Liability (E&O)',
      'Covers claims of negligence or inadequate work. Critical for service businesses.',
      { fee: '$20-$80/mo', time: '1-3 days' });

    // 5. Digital Presence
    addItem('Digital Presence', 'Register Your Domain Name',
      'Secure your .com, .app, or other domain before someone else does.',
      { fee: '$10-$15/yr', time: 'Immediate' });
    addItem('Digital Presence', 'Build Your Website',
      'Professional site with your brand. Think! LaunchPad builds this for you free.',
      { fee: '$0 (via LaunchPad)', time: '1-2 days' });
    addItem('Digital Presence', 'Set Up Google Business Profile',
      'Appear in Google Maps and local search results.',
      { fee: 'Free', time: '1-2 weeks', link: 'https://business.google.com', linkText: 'Google Business' });
    addItem('Digital Presence', 'Create Social Media Accounts',
      'Claim your business name on Instagram, Facebook, LinkedIn, and TikTok.',
      { fee: 'Free', time: '1 day' });

    return items;
  }

  // ── Cost Calculation ──────────────────────────────────────
  function calculateRemainingCosts() {
    let total = 0;
    _checklistItems.forEach(function (item) {
      if (_checklistState[item.id]) return; // already done
      if (!item.fee) return;
      // Parse the fee string to extract minimum dollar amount
      const match = item.fee.match(/\$(\d[\d,]*)/);
      if (match) {
        total += parseInt(match[1].replace(',', ''), 10);
      }
    });
    return total;
  }

  // ── Render Functions ──────────────────────────────────────

  function renderWelcome() {
    const el = document.getElementById('dash-welcome');
    if (!el) return;

    const name = (_user && _user.displayName) || (_userData && _userData.name) || 'Entrepreneur';
    const biz = (_appData && _appData.businessName) || '';
    const level = getLevel();

    let subtitle = '';
    if (biz) {
      subtitle = 'Your business ' + biz + ' is taking shape. Keep building -- every checked item is a step closer to launch.';
    } else {
      subtitle = 'Your entrepreneurial journey starts here. Head to the LaunchPad to define your business and generate your roadmap.';
    }

    el.innerHTML = '<img src="assets/images/bella-mascot.png" alt="Bella" class="dash-welcome__avatar">' +
      '<div class="dash-welcome__text">' +
      '<h2>Welcome back, ' + escHtml(name) + '</h2>' +
      '<p>' + subtitle + '</p>' +
      '</div>';
  }

  function renderStats() {
    const total = _checklistItems.length;
    const done = _checklistItems.filter(function (item) { return _checklistState[item.id]; }).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const remaining = calculateRemainingCosts();

    setElText('stat-total', total);
    setElText('stat-done', done);
    setElText('stat-pct', pct + '%');
    setElText('stat-cost', '$' + remaining);
  }

  function renderProgress() {
    const total = _checklistItems.length;
    const done = _checklistItems.filter(function (item) { return _checklistState[item.id]; }).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    setElText('progress-pct', pct + '%');
    setElText('progress-label', done + ' of ' + total + ' steps completed');
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct + '%';
  }

  function renderChecklist() {
    const container = document.getElementById('dash-checklist');
    if (!container) return;

    if (_checklistItems.length === 0) {
      container.innerHTML =
        '<div class="dash-empty">' +
        '<div class="dash-empty__icon">' + DOC_SVG + '</div>' +
        '<div class="dash-empty__title">No Roadmap Yet</div>' +
        '<div class="dash-empty__desc">Complete the LaunchPad wizard to generate your personalized business checklist.</div>' +
        '<a href="launchpad.html" class="btn btn--primary">Go to LaunchPad</a>' +
        '</div>';
      return;
    }

    // Group items by category
    const categories = [];
    const catMap = {};
    _checklistItems.forEach(function (item) {
      if (!catMap[item.category]) {
        catMap[item.category] = [];
        categories.push(item.category);
      }
      catMap[item.category].push(item);
    });

    let html = '';
    categories.forEach(function (cat) {
      html += '<div class="dash-section__title" style="font-size:var(--fs-base);margin-top:var(--sp-lg);margin-bottom:var(--sp-sm);color:var(--color-accent);">' + escHtml(cat) + '</div>';
      html += '<ul class="dash-checklist">';
      catMap[cat].forEach(function (item) {
        const done = _checklistState[item.id];
        html += '<li class="dash-checklist__item' + (done ? ' dash-checklist__item--done' : '') + '" data-id="' + item.id + '" onclick="Dashboard.toggleItem(\'' + item.id + '\')">';
        html += '<div class="dash-checklist__check">' + (done ? CHECK_SVG : '') + '</div>';
        html += '<div class="dash-checklist__content">';
        html += '<div class="dash-checklist__title">' + escHtml(item.title) + '</div>';
        html += '<div class="dash-checklist__desc">' + escHtml(item.desc) + '</div>';
        html += '<div class="dash-checklist__meta">';
        if (item.fee) html += '<span class="dash-checklist__tag dash-checklist__tag--fee">' + escHtml(item.fee) + '</span>';
        if (item.time) html += '<span class="dash-checklist__tag dash-checklist__tag--time">' + escHtml(item.time) + '</span>';
        if (item.link) html += '<a href="' + item.link + '" target="_blank" class="dash-checklist__link" onclick="event.stopPropagation();">' + LINK_SVG + ' ' + escHtml(item.linkText || 'Link') + '</a>';
        html += '</div></div></li>';
      });
      html += '</ul>';
    });

    container.innerHTML = html;
  }

  function renderDocuments() {
    const container = document.getElementById('dash-docs');
    if (!container) return;

    let html = '';
    DOCUMENT_SLOTS.forEach(function (slot) {
      const docMeta = _documentsData[slot.id];
      const uploaded = docMeta && docMeta.uploaded;

      html += '<div class="dash-doc' + (uploaded ? ' dash-doc--uploaded' : '') + '">';
      html += '<div class="dash-doc__icon">' + DOC_SVG + '</div>';
      html += '<div class="dash-doc__info">';
      html += '<div class="dash-doc__name">' + escHtml(slot.name) + '</div>';
      if (uploaded) {
        html += '<div class="dash-doc__status dash-doc__status--uploaded">Uploaded</div>';
      } else {
        html += '<div class="dash-doc__status dash-doc__status--missing">Not uploaded</div>';
      }
      html += '</div>';

      if (uploaded && docMeta.url) {
        html += '<a href="' + docMeta.url + '" target="_blank" class="dash-doc__action" title="View document">' + DOWNLOAD_SVG + '</a>';
      }
      // Upload button (hidden file input triggered by button)
      html += '<button class="dash-doc__action" onclick="Dashboard.uploadDoc(\'' + slot.id + '\')" title="Upload document">' + UPLOAD_SVG + '</button>';
      html += '</div>';
    });

    container.innerHTML = html;
  }

  function renderResources() {
    const container = document.getElementById('dash-resources-list');
    if (!container) return;

    let html = '';

    // Industry-specific resources
    const industry = _appData && _appData.selectedIndustry;
    if (industry && INDUSTRY_RESOURCES[industry]) {
      html += '<div class="dash-resources__title">Industry Resources</div>';
      INDUSTRY_RESOURCES[industry].forEach(function (r) {
        html += renderResourceCard(r.title, r.desc, r.link);
      });
    }

    // State-specific resources
    const stateKey = _appData && _appData.selectedState;
    const stateInfo = stateKey && STATE_DATA[stateKey];
    if (stateInfo) {
      html += '<div class="dash-resources__title" style="margin-top:var(--sp-lg);">' + escHtml(stateInfo.title) + ' Resources</div>';
      html += renderResourceCard('Secretary of State', 'File formation documents, search business names, and check compliance.', stateInfo.sosLink);
    }

    // Universal resources
    html += '<div class="dash-resources__title" style="margin-top:var(--sp-lg);">Essential Resources</div>';
    UNIVERSAL_RESOURCES.forEach(function (r) {
      html += renderResourceCard(r.title, r.desc, r.link);
    });

    container.innerHTML = html;

    // Bella encouragement
    renderBellaMessage();
  }

  function renderResourceCard(title, desc, link) {
    let html = '<div class="dash-resource-card">';
    html += '<div class="dash-resource-card__title">' + escHtml(title) + '</div>';
    html += '<div class="dash-resource-card__desc">' + escHtml(desc) + '</div>';
    if (link) {
      html += '<a href="' + link + '" target="_blank" class="dash-resource-card__link">Visit ' + LINK_SVG + '</a>';
    }
    html += '</div>';
    return html;
  }

  function renderBellaMessage() {
    const el = document.getElementById('dash-bella-text');
    if (!el) return;
    const level = getLevel();
    el.textContent = BELLA_MESSAGES[level] || BELLA_MESSAGES.explorer;
  }

  function renderLevel() {
    const level = getLevel();
    const badgeEl = document.getElementById('dash-level-badge');
    const labelEl = document.getElementById('dash-level-label');
    if (badgeEl) badgeEl.textContent = getLevelLabel(level);
    if (labelEl) labelEl.textContent = getLevelDesc(level);
  }

  function renderSidebar() {
    const nameEl = document.getElementById('dash-user-name');
    const typeEl = document.getElementById('dash-user-type');
    if (!nameEl || !typeEl) return;

    const name = (_user && _user.displayName) || (_userData && _userData.name) || 'Entrepreneur';
    const entity = (_appData && _appData.selectedEntity && ENTITY_DATA[_appData.selectedEntity])
      ? ENTITY_DATA[_appData.selectedEntity].title
      : 'Getting Started';

    nameEl.textContent = name;
    typeEl.textContent = entity;
  }

  function renderGiveback() {
    // The give-back section is static HTML in dashboard.html, no JS rendering needed
  }

  function renderAll() {
    renderSidebar();
    renderWelcome();
    renderStats();
    renderProgress();
    renderChecklist();
    renderDocuments();
    renderResources();
    renderLevel();
  }

  // ── Helpers ───────────────────────────────────────────────
  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function setElText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── Firestore Operations ──────────────────────────────────

  function saveChecklistState() {
    if (!_user) return;
    db.collection(USERS_COL).doc(_user.uid)
      .collection('dashboard').doc('checklist')
      .set({ items: _checklistState, lastUpdated: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true })
      .catch(function (err) {
        console.warn('[Dashboard] Save checklist failed:', err.message || err);
      });
  }

  function loadData() {
    if (!_user) return Promise.resolve();

    var promises = [];

    // Load application data
    promises.push(
      db.collection(APPLICATIONS_COL).doc(_user.uid).get().then(function (doc) {
        if (doc.exists) _appData = doc.data();
      }).catch(function () { _appData = null; })
    );

    // Load user profile
    promises.push(
      db.collection(USERS_COL).doc(_user.uid).get().then(function (doc) {
        if (doc.exists) _userData = doc.data();
      }).catch(function () { _userData = null; })
    );

    // Load checklist state
    promises.push(
      db.collection(USERS_COL).doc(_user.uid)
        .collection('dashboard').doc('checklist').get().then(function (doc) {
          if (doc.exists && doc.data().items) {
            _checklistState = doc.data().items;
          }
        }).catch(function () { _checklistState = {}; })
    );

    // Load documents metadata
    promises.push(
      db.collection(USERS_COL).doc(_user.uid)
        .collection('dashboard').doc('documents').get().then(function (doc) {
          if (doc.exists) _documentsData = doc.data();
        }).catch(function () { _documentsData = {}; })
    );

    return Promise.all(promises);
  }

  // ── Public Methods ────────────────────────────────────────

  function toggleItem(itemId) {
    _checklistState[itemId] = !_checklistState[itemId];
    saveChecklistState();
    renderChecklist();
    renderStats();
    renderProgress();
    renderLevel();
    renderBellaMessage();
  }

  function uploadDoc(slotId) {
    // Check for Firebase Storage
    if (typeof firebase.storage !== 'function') {
      alert('Document upload is not yet available. Firebase Storage is being configured.');
      return;
    }

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = function () {
      if (!input.files || !input.files[0]) return;
      var file = input.files[0];

      if (file.size > 10 * 1024 * 1024) {
        alert('File must be under 10 MB.');
        return;
      }

      var storageRef = firebase.storage().ref('documents/' + _user.uid + '/' + slotId + '/' + file.name);

      // Show uploading feedback
      var btn = document.querySelector('[onclick="Dashboard.uploadDoc(\'' + slotId + '\')"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = '...';
      }

      storageRef.put(file).then(function (snapshot) {
        return snapshot.ref.getDownloadURL();
      }).then(function (url) {
        // Save metadata to Firestore
        var update = {};
        update[slotId] = {
          uploaded: true,
          url: url,
          fileName: file.name,
          uploadedAt: new Date().toISOString()
        };
        _documentsData[slotId] = update[slotId];

        return db.collection(USERS_COL).doc(_user.uid)
          .collection('dashboard').doc('documents')
          .set(update, { merge: true });
      }).then(function () {
        renderDocuments();
      }).catch(function (err) {
        console.error('[Dashboard] Upload failed:', err);
        alert('Upload failed. Please try again.');
        renderDocuments();
      });
    };
    input.click();
  }

  // ── Sidebar Navigation ────────────────────────────────────

  function scrollToSection(sectionId) {
    var el = document.getElementById(sectionId);
    var center = document.querySelector('.dash-center');
    if (el && center) {
      center.scrollTo({
        top: el.offsetTop - center.offsetTop - 20,
        behavior: 'smooth'
      });
    }

    // Update active nav
    document.querySelectorAll('.dash-sidebar__nav a').forEach(function (a) {
      a.classList.remove('active');
    });
    var link = document.querySelector('.dash-sidebar__nav a[onclick*="' + sectionId + '"]');
    if (link) link.classList.add('active');
  }

  // ── Init ──────────────────────────────────────────────────

  function init() {
    var loadingEl = document.getElementById('dash-loading');
    var layoutEl = document.getElementById('dash-layout');

    auth.onAuthStateChanged(function (user) {
      if (!user) {
        // Not logged in -- redirect to launchpad
        window.location.href = 'launchpad.html';
        return;
      }

      _user = user;

      // Update nav auth state
      if (typeof Auth !== 'undefined' && Auth.updateNavAuth) {
        Auth.updateNavAuth(user);
      }

      // Load all data then render
      loadData().then(function () {
        // Generate checklist from application data
        if (_appData && _appData.selectedIndustry && _appData.selectedState && _appData.selectedEntity) {
          _checklistItems = generateChecklist(
            _appData.selectedIndustry,
            _appData.selectedState,
            _appData.selectedEntity
          );
        } else {
          _checklistItems = [];
        }

        // Hide loading, show layout
        if (loadingEl) loadingEl.style.display = 'none';
        if (layoutEl) layoutEl.style.display = 'grid';

        renderAll();
      });
    });
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ────────────────────────────────────────────
  return {
    toggleItem: toggleItem,
    uploadDoc: uploadDoc,
    scrollToSection: scrollToSection
  };

})();
