/* ═══════════════════════════════════════════════════════════════
 *  bella-conversation.js  --  Conversational Wizard Flow
 *  Think! Ventures LaunchPad
 *  ---------------------------------------------------------------
 *  Replaces the traditional multi-step wizard (steps 0-3) with a
 *  natural chat conversation where Bella asks one question at a time.
 *  Step 4 (roadmap) stays intact.
 *  Runs 100% client-side.
 * ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Keyword-to-Industry Mapping ──────────────────────────────
  var BUSINESS_KEYWORDS = {
    'home-services': [
      'cleaning service', 'cleaning company', 'maid service', 'house cleaning',
      'pressure washing', 'pressure wash', 'power washing',
      'christmas light', 'holiday light', 'light installation', 'lighting installation',
      'pest control', 'exterminator',
      'carpet cleaning', 'window cleaning', 'gutter cleaning',
      'junk removal', 'hauling', 'moving company', 'mover',
      'handyman', 'home repair', 'home improvement',
      'plumber', 'plumbing', 'electrician', 'electrical work',
      'hvac', 'heating and cooling', 'air conditioning',
      'landscaping', 'lawn care', 'lawn mowing', 'yard work', 'tree service', 'tree trimming',
      'pool service', 'pool cleaning',
      'locksmith', 'appliance repair',
      'cleaning', 'maid', 'janitorial', 'custodial'
    ],
    'construction': [
      'general contractor', 'general contracting', 'construction company',
      'garage door', 'garage installation',
      'sign installation', 'sign company', 'signage',
      'roofing', 'roofer', 'roof repair',
      'concrete', 'masonry', 'bricklaying',
      'framing', 'drywall', 'insulation',
      'fencing', 'fence installation', 'fence company',
      'demolition', 'excavation', 'grading',
      'foundation', 'foundation repair',
      'deck building', 'deck installation', 'patio',
      'paving', 'asphalt', 'sealcoating',
      'welding', 'metal fabrication',
      'contractor', 'contracting', 'renovation', 'remodel', 'remodeling',
      'building', 'carpentry', 'cabinet', 'tile', 'flooring'
    ],
    'food-beverage': [
      'food truck', 'food cart', 'food trailer',
      'meal prep', 'meal delivery',
      'catering company', 'catering service',
      'ice cream', 'frozen yogurt',
      'juice bar', 'smoothie bar',
      'coffee shop', 'coffee roasting',
      'restaurant', 'cafe', 'diner', 'bistro',
      'bakery', 'baking', 'cake', 'cupcake', 'pastry',
      'catering', 'chef', 'personal chef', 'private chef',
      'bar', 'brewery', 'winery', 'distillery',
      'food', 'cooking', 'pizza', 'bbq', 'barbecue',
      'dessert', 'candy', 'chocolate', 'snack',
      'tea', 'boba', 'beverage'
    ],
    'health-beauty': [
      'hair salon', 'beauty salon', 'nail salon',
      'barber shop', 'barbershop',
      'day spa', 'med spa', 'medical spa',
      'lash extensions', 'lash tech',
      'brow artist', 'microblading',
      'personal trainer', 'personal training',
      'yoga studio', 'pilates studio',
      'massage therapy', 'massage therapist',
      'salon', 'barber', 'hair', 'hairstylist', 'hairdresser',
      'nails', 'nail tech', 'manicure', 'pedicure',
      'spa', 'massage', 'facial', 'skincare', 'skin care',
      'waxing', 'esthetician', 'aesthetician',
      'lash', 'brow', 'makeup', 'makeup artist', 'mua',
      'beauty', 'cosmetic', 'dermatology',
      'tattoo', 'piercing', 'body art',
      'fitness', 'gym', 'crossfit', 'boxing',
      'yoga', 'wellness', 'holistic', 'acupuncture', 'chiropractic',
      'nutrition', 'nutritionist', 'dietitian', 'health coach'
    ],
    'professional': [
      'consulting firm', 'consulting company',
      'marketing agency', 'advertising agency', 'digital agency',
      'law firm', 'legal services',
      'accounting firm', 'cpa firm',
      'real estate agent', 'real estate agency', 'property management',
      'insurance agency', 'insurance agent',
      'financial advisor', 'financial planning',
      'consulting', 'consultant', 'advisor', 'advisory',
      'accounting', 'bookkeeping', 'bookkeeper', 'cpa', 'tax preparation',
      'legal', 'attorney', 'lawyer', 'paralegal',
      'marketing', 'advertising', 'pr', 'public relations',
      'recruiting', 'staffing', 'hr', 'human resources',
      'coaching', 'life coach', 'business coach', 'executive coach',
      'freelance', 'freelancer', 'writer', 'copywriting', 'copywriter',
      'translation', 'interpreter', 'notary',
      'real estate', 'property', 'insurance', 'financial',
      'project management', 'virtual assistant', 'administrative'
    ],
    'retail': [
      'online store', 'online shop', 'e-commerce', 'ecommerce',
      'clothing line', 'clothing brand', 'fashion brand',
      'thrift store', 'consignment shop', 'resale shop',
      'gift shop', 'gift basket',
      'pet store', 'pet supply',
      'store', 'shop', 'boutique', 'retail',
      'clothing', 'apparel', 'fashion', 'accessories',
      'jewelry', 'jeweler',
      'candle', 'candle making', 'soap', 'soap making',
      'craft', 'handmade', 'artisan', 'etsy',
      'resale', 'thrift', 'vintage', 'antique',
      'wholesale', 'distribution', 'dropshipping',
      'merchandise', 'merch', 'print on demand',
      'flowers', 'florist', 'floral',
      'auto parts', 'vape', 'smoke shop',
      'grocery', 'convenience store', 'liquor store'
    ],
    'creative': [
      'graphic design', 'web design', 'interior design',
      'photography studio', 'photo studio',
      'video production', 'film production',
      'recording studio', 'music studio',
      'content creator', 'content creation',
      'social media manager', 'social media management',
      'design', 'designer', 'creative',
      'photography', 'photographer', 'photo', 'videography', 'videographer',
      'video', 'film', 'filmmaker', 'cinema',
      'music', 'musician', 'producer', 'dj', 'band',
      'art', 'artist', 'illustration', 'illustrator',
      'animation', 'animator', 'motion graphics',
      'podcast', 'podcasting', 'broadcasting',
      'influencer', 'social media', 'youtube', 'tiktok',
      'web design', 'ux', 'ui', 'branding',
      'event planning', 'event planner', 'wedding planner',
      'printing', 'print shop', 'screen printing', 'embroidery'
    ],
    'tech': [
      'software company', 'software development',
      'web development', 'website development',
      'mobile app', 'app development',
      'it services', 'it support', 'it consulting',
      'managed services', 'msp',
      'software', 'saas', 'app', 'developer', 'programming', 'coder',
      'computer', 'computer repair', 'tech support',
      'network', 'networking', 'cybersecurity', 'security',
      'website', 'web developer', 'web dev',
      'ai', 'artificial intelligence', 'machine learning',
      'data', 'data analytics', 'database',
      'cloud', 'cloud computing', 'devops',
      'blockchain', 'crypto', 'automation',
      'robotics', 'drone', 'iot'
    ],
    'education': [
      'tutoring service', 'tutoring company',
      'music lessons', 'music school',
      'dance studio', 'dance school',
      'martial arts', 'karate', 'taekwondo',
      'driving school', 'driving instructor',
      'daycare center', 'child care center',
      'after school program',
      'tutoring', 'tutor', 'teaching', 'teacher', 'instructor',
      'training', 'trainer', 'course', 'class', 'lessons',
      'academy', 'school', 'institute',
      'mentoring', 'mentor',
      'workshop', 'seminar', 'bootcamp',
      'daycare', 'childcare', 'preschool', 'nursery',
      'swim lessons', 'art lessons', 'language school',
      'test prep', 'sat prep', 'college prep'
    ]
  };

  var INDUSTRY_NAMES = {
    'home-services': 'Home Services',
    'construction': 'Construction',
    'food-beverage': 'Food & Beverage',
    'health-beauty': 'Health & Beauty',
    'professional': 'Professional Services',
    'retail': 'Retail & E-Commerce',
    'creative': 'Creative & Media',
    'tech': 'Technology',
    'education': 'Education & Training'
  };

  var INDUSTRY_DESCRIPTIONS = {
    'home-services': 'things like installation, repair, cleaning, and maintenance work',
    'construction': 'general contracting, building, renovation, and construction trades',
    'food-beverage': 'restaurants, food trucks, catering, baking, and food service',
    'health-beauty': 'salons, barbershops, spas, fitness, and wellness services',
    'professional': 'consulting, accounting, marketing, legal, and other professional services',
    'retail': 'online stores, boutiques, e-commerce, and physical retail',
    'creative': 'design, photography, video production, and creative content',
    'tech': 'software development, IT services, apps, and technology solutions',
    'education': 'tutoring, coaching, training, online courses, and childcare'
  };

  var ENTITY_REASONS = {
    'home-services': {
      type: 'llc',
      reasons: [
        'Protects your personal assets if something goes wrong on a job',
        'Simple to set up',
        'Flexible tax options',
        'Looks professional to customers'
      ]
    },
    'construction': {
      type: 'llc',
      reasons: [
        'Shields your personal assets from job-site liability',
        'Required by many general contractors for subcontractors',
        'Flexible tax structure',
        'Easier to get bonded and insured'
      ]
    },
    'food-beverage': {
      type: 'llc',
      reasons: [
        'Liability protection is critical when serving food to the public',
        'Separates personal assets from the business',
        'Required for many food permits and licenses',
        'Flexible management structure'
      ]
    },
    'health-beauty': {
      type: 'llc',
      reasons: [
        'Keeps personal finances separate from your salon or spa',
        'Liability protection for services performed on clients',
        'Looks more professional on signage and marketing',
        'Pass-through taxation keeps things simple'
      ]
    },
    'professional': {
      type: 'llc',
      reasons: [
        'Most consultants and freelancers start with an LLC',
        'Protects personal assets from client disputes',
        'Flexible -- can elect S-Corp taxation later if needed',
        'Low maintenance compared to a corporation'
      ]
    },
    'retail': {
      type: 'llc',
      reasons: [
        'Protects you personally from product liability claims',
        'Required for wholesale accounts and vendor relationships',
        'Simple pass-through taxation',
        'Easy to add partners later if needed'
      ]
    },
    'creative': {
      type: 'llc',
      reasons: [
        'Protects personal assets from client disputes',
        'Looks professional to clients and agencies',
        'Flexible tax treatment',
        'Simple to maintain with minimal paperwork'
      ]
    },
    'tech': {
      type: 'llc',
      reasons: [
        'Protects personal assets from software liability',
        'Simple structure for bootstrapped startups',
        'Can convert to C-Corp later if raising investment',
        'Pass-through taxation until you grow'
      ]
    },
    'education': {
      type: 'llc',
      reasons: [
        'Protects your personal assets from business liabilities',
        'Simple tax filing with pass-through treatment',
        'Professional credibility with parents and students',
        'Easy to manage as a solo operator'
      ]
    }
  };

  var ENTITY_DISPLAY_NAMES = {
    'llc': 'LLC (Limited Liability Company)',
    'sole': 'Sole Proprietorship',
    'scorp': 'S-Corporation',
    'nonprofit': '501(c)(3) Nonprofit'
  };

  var ENTITY_DESCRIPTIONS = {
    'llc': 'Limited liability protection with pass-through taxation. Best for most small businesses.',
    'sole': 'No formal filing required. Simplest but no personal asset protection.',
    'scorp': 'Tax benefits through salary + dividend structure. Best at higher revenue.',
    'nonprofit': 'Tax-exempt charitable organization. Eligible for grants and donations.'
  };

  // Top 10 featured states
  var TOP_STATES = ['nc', 'tx', 'fl', 'ca', 'ny', 'ga', 'va', 'sc', 'oh', 'pa'];

  // ── Classification Engine ─────────────────────────────────────

  function classifyBusiness(description) {
    if (!description || typeof description !== 'string') return [];
    var input = description.toLowerCase().trim();
    if (input.length < 2) return [];

    var scores = {};
    Object.keys(BUSINESS_KEYWORDS).forEach(function (industry) {
      var keywords = BUSINESS_KEYWORDS[industry];
      var matchedTerms = [];
      var score = 0;

      keywords.forEach(function (keyword) {
        var kw = keyword.toLowerCase();
        if (input.indexOf(kw) !== -1) {
          var weight = kw.split(' ').length;
          score += weight;
          matchedTerms.push(keyword);
        }
      });

      if (score > 0) {
        scores[industry] = { industry: industry, score: score, matchedTerms: matchedTerms };
      }
    });

    var results = Object.keys(scores).map(function (k) { return scores[k]; });
    results.sort(function (a, b) { return b.score - a.score; });
    return results;
  }

  // ── HTML Escaper ──────────────────────────────────────────────

  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ═══ INJECT CSS ═══════════════════════════════════════════════

  function injectStyles() {
    var style = document.createElement('style');
    style.id = 'bella-chat-styles';
    style.textContent = [
      '/* ═══ Bella Conversational Chat ═══ */',

      '.bella-chat {',
      '  display: flex;',
      '  flex-direction: column;',
      '  height: calc(100vh - 72px - 120px);',
      '  min-height: 400px;',
      '  position: relative;',
      '}',

      '.bella-chat__messages {',
      '  flex: 1;',
      '  overflow-y: auto;',
      '  padding: 0 var(--sp-md) var(--sp-lg);',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: var(--sp-md);',
      '  scroll-behavior: smooth;',
      '  -webkit-overflow-scrolling: touch;',
      '}',

      '.bella-chat__messages::-webkit-scrollbar {',
      '  width: 6px;',
      '}',
      '.bella-chat__messages::-webkit-scrollbar-track {',
      '  background: transparent;',
      '}',
      '.bella-chat__messages::-webkit-scrollbar-thumb {',
      '  background: rgba(245, 166, 35, 0.2);',
      '  border-radius: 3px;',
      '}',

      /* ── Bubble Base ── */
      '.bella-chat__bubble {',
      '  max-width: 85%;',
      '  padding: var(--sp-lg) var(--sp-xl);',
      '  border-radius: var(--border-radius-lg);',
      '  font-size: var(--fs-sm);',
      '  line-height: 1.7;',
      '  color: var(--color-text);',
      '  animation: bellaChatSlideUp 0.35s ease-out;',
      '  word-wrap: break-word;',
      '}',

      '@keyframes bellaChatSlideUp {',
      '  from { opacity: 0; transform: translateY(12px); }',
      '  to { opacity: 1; transform: translateY(0); }',
      '}',

      /* ── Bella Messages (left) ── */
      '.bella-chat__bubble--bella {',
      '  align-self: flex-start;',
      '  background: rgba(13, 79, 79, 0.3);',
      '  border: 1px solid rgba(245, 166, 35, 0.15);',
      '  border-radius: 4px var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg);',
      '  display: flex;',
      '  gap: var(--sp-md);',
      '  align-items: flex-start;',
      '}',

      '.bella-chat__avatar {',
      '  width: 36px;',
      '  height: 36px;',
      '  border-radius: 50%;',
      '  object-fit: cover;',
      '  border: 2px solid var(--color-secondary);',
      '  flex-shrink: 0;',
      '  margin-top: 2px;',
      '}',

      '.bella-chat__bubble-text {',
      '  flex: 1;',
      '  min-width: 0;',
      '}',

      '.bella-chat__bubble-text p {',
      '  margin: 0 0 var(--sp-sm);',
      '}',
      '.bella-chat__bubble-text p:last-child {',
      '  margin-bottom: 0;',
      '}',

      '.bella-chat__bubble-text ul {',
      '  margin: var(--sp-sm) 0;',
      '  padding-left: var(--sp-lg);',
      '  list-style: none;',
      '}',
      '.bella-chat__bubble-text ul li {',
      '  position: relative;',
      '  padding-left: var(--sp-md);',
      '  margin-bottom: 4px;',
      '  color: var(--color-text-muted);',
      '  font-size: var(--fs-sm);',
      '  line-height: 1.6;',
      '}',
      '.bella-chat__bubble-text ul li::before {',
      '  content: "";',
      '  position: absolute;',
      '  left: 0;',
      '  top: 8px;',
      '  width: 5px;',
      '  height: 5px;',
      '  border-radius: 50%;',
      '  background: var(--color-secondary);',
      '}',

      '.bella-chat__sender {',
      '  font-family: var(--font-heading);',
      '  font-weight: 700;',
      '  font-size: var(--fs-xs);',
      '  color: var(--color-secondary);',
      '  margin-bottom: 4px;',
      '  display: block;',
      '}',

      /* ── User Messages (right) ── */
      '.bella-chat__bubble--user {',
      '  align-self: flex-end;',
      '  background: rgba(245, 166, 35, 0.1);',
      '  border: 1px solid rgba(245, 166, 35, 0.25);',
      '  border-radius: var(--border-radius-lg) var(--border-radius-lg) 4px var(--border-radius-lg);',
      '  font-weight: 500;',
      '}',

      /* ── Typing Indicator ── */
      '.bella-chat__typing {',
      '  display: flex;',
      '  gap: 6px;',
      '  padding: var(--sp-xs) 0;',
      '  align-items: center;',
      '}',
      '.bella-chat__typing span {',
      '  width: 8px;',
      '  height: 8px;',
      '  border-radius: 50%;',
      '  background: var(--color-secondary);',
      '  animation: bellaChatDot 1.2s infinite;',
      '}',
      '.bella-chat__typing span:nth-child(2) { animation-delay: 0.2s; }',
      '.bella-chat__typing span:nth-child(3) { animation-delay: 0.4s; }',
      '@keyframes bellaChatDot {',
      '  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }',
      '  30% { opacity: 1; transform: scale(1.1); }',
      '}',

      /* ── Input Area (fixed bottom) ── */
      '.bella-chat__input-area {',
      '  flex-shrink: 0;',
      '  padding: var(--sp-md) 0 0;',
      '  border-top: 1px solid rgba(245, 166, 35, 0.1);',
      '}',

      '.bella-chat__chips {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: var(--sp-sm);',
      '  margin-bottom: var(--sp-sm);',
      '}',

      '.bella-chat__chip {',
      '  padding: 8px 16px;',
      '  background: transparent;',
      '  border: 1px solid var(--color-secondary);',
      '  border-radius: 20px;',
      '  color: var(--color-secondary);',
      '  font-size: var(--fs-sm);',
      '  font-family: var(--font-body);',
      '  font-weight: 500;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  white-space: nowrap;',
      '}',
      '.bella-chat__chip:hover {',
      '  background: rgba(245, 166, 35, 0.15);',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.2);',
      '}',
      '.bella-chat__chip--primary {',
      '  background: linear-gradient(135deg, var(--color-secondary) 0%, #e6951e 100%);',
      '  color: var(--color-bg);',
      '  font-weight: 700;',
      '  border-color: transparent;',
      '}',
      '.bella-chat__chip--primary:hover {',
      '  box-shadow: 0 4px 16px rgba(245, 166, 35, 0.4);',
      '}',

      '.bella-chat__text-input {',
      '  display: flex;',
      '  gap: var(--sp-sm);',
      '}',
      '.bella-chat__text-input input,',
      '.bella-chat__text-input textarea {',
      '  flex: 1;',
      '  padding: var(--sp-md) var(--sp-lg);',
      '  background: rgba(255, 255, 255, 0.06);',
      '  border: 1px solid var(--color-border);',
      '  border-radius: var(--border-radius-sm);',
      '  color: var(--color-white);',
      '  font-family: var(--font-body);',
      '  font-size: var(--fs-sm);',
      '  outline: none;',
      '  transition: border-color 0.2s ease;',
      '  min-width: 0;',
      '}',
      '.bella-chat__text-input input:focus,',
      '.bella-chat__text-input textarea:focus {',
      '  border-color: var(--color-secondary);',
      '  box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);',
      '}',
      '.bella-chat__text-input input::placeholder,',
      '.bella-chat__text-input textarea::placeholder {',
      '  color: var(--color-text-muted);',
      '}',
      '.bella-chat__text-input textarea {',
      '  resize: vertical;',
      '  min-height: 60px;',
      '  max-height: 120px;',
      '}',

      '.bella-chat__send-btn {',
      '  width: 44px;',
      '  height: 44px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  background: linear-gradient(135deg, var(--color-secondary) 0%, #e6951e 100%);',
      '  border: none;',
      '  border-radius: var(--border-radius-sm);',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  flex-shrink: 0;',
      '  color: var(--color-bg);',
      '}',
      '.bella-chat__send-btn:hover {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 16px rgba(245, 166, 35, 0.3);',
      '}',
      '.bella-chat__send-btn svg {',
      '  width: 20px;',
      '  height: 20px;',
      '}',

      /* ── Verification Card ── */
      '.bella-chat__verify {',
      '  padding: var(--sp-lg);',
      '  background: rgba(13, 79, 79, 0.15);',
      '  border: 1px solid rgba(245, 166, 35, 0.2);',
      '  border-radius: var(--border-radius-md);',
      '  margin-top: var(--sp-sm);',
      '}',
      '.bella-chat__verify-title {',
      '  font-family: var(--font-heading);',
      '  font-weight: 700;',
      '  font-size: var(--fs-sm);',
      '  color: var(--color-secondary);',
      '  margin-bottom: var(--sp-md);',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '}',
      '.bella-chat__verify-row {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  align-items: baseline;',
      '  padding: 6px 0;',
      '  border-bottom: 1px solid rgba(255, 255, 255, 0.05);',
      '}',
      '.bella-chat__verify-row:last-child {',
      '  border-bottom: none;',
      '}',
      '.bella-chat__verify-label {',
      '  font-size: var(--fs-xs);',
      '  color: var(--color-text-muted);',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '  font-weight: 600;',
      '}',
      '.bella-chat__verify-value {',
      '  font-family: var(--font-heading);',
      '  font-weight: 600;',
      '  font-size: var(--fs-sm);',
      '  color: var(--color-white);',
      '  text-align: right;',
      '  max-width: 60%;',
      '  word-wrap: break-word;',
      '}',

      /* ── State search within chat ── */
      '.bella-chat__state-search {',
      '  width: 100%;',
      '  padding: var(--sp-md) var(--sp-lg);',
      '  background: rgba(255, 255, 255, 0.06);',
      '  border: 1px solid var(--color-border);',
      '  border-radius: var(--border-radius-sm);',
      '  color: var(--color-white);',
      '  font-family: var(--font-body);',
      '  font-size: var(--fs-sm);',
      '  outline: none;',
      '  transition: border-color 0.2s ease;',
      '  margin-bottom: var(--sp-sm);',
      '}',
      '.bella-chat__state-search:focus {',
      '  border-color: var(--color-secondary);',
      '}',
      '.bella-chat__state-search::placeholder {',
      '  color: var(--color-text-muted);',
      '}',

      '.bella-chat__state-results {',
      '  max-height: 200px;',
      '  overflow-y: auto;',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: var(--sp-sm);',
      '}',

      /* ── Responsive ── */
      '@media (max-width: 1024px) {',
      '  .bella-chat {',
      '    height: auto;',
      '    min-height: 60vh;',
      '  }',
      '}',
      '@media (max-width: 768px) {',
      '  .bella-chat__bubble { max-width: 95%; }',
      '  .bella-chat__chips { gap: 6px; }',
      '  .bella-chat__chip { font-size: var(--fs-xs); padding: 6px 12px; }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }


  // ═══ CONVERSATION ENGINE ══════════════════════════════════════

  var chatData = {
    industry: null,
    industryName: null,
    state: null,
    stateName: null,
    entity: null,
    entityName: null,
    businessName: '',
    businessDesc: '',
    userIdea: ''
  };

  var conversationStep = 0; // tracks which question we are on
  var messagesEl = null;
  var inputAreaEl = null;
  var centerPanel = null;
  var STATES = null;
  var INDUSTRIES = null;
  var ENTITIES = null;

  // ── Build the Chat UI ────────────────────────────────────────

  function buildChatUI() {
    centerPanel = document.querySelector('.lp-center');
    if (!centerPanel) return false;

    // Grab data from the global wizard
    STATES = window.STATES || {};
    INDUSTRIES = window.INDUSTRIES || {};
    ENTITIES = window.ENTITIES || [];

    // Hide all wizard steps (0-3) -- we replace them
    for (var i = 0; i <= 3; i++) {
      var stepEl = document.getElementById('step-' + i);
      if (stepEl) stepEl.style.display = 'none';
    }

    // Keep stepper visible -- find it
    var stepper = document.getElementById('stepper');

    // Build chat container
    var chatWrap = document.createElement('div');
    chatWrap.className = 'bella-chat';
    chatWrap.id = 'bella-chat';

    // Messages area
    messagesEl = document.createElement('div');
    messagesEl.className = 'bella-chat__messages';
    messagesEl.id = 'bella-chat-messages';

    // Input area
    inputAreaEl = document.createElement('div');
    inputAreaEl.className = 'bella-chat__input-area';
    inputAreaEl.id = 'bella-chat-input-area';

    chatWrap.appendChild(messagesEl);
    chatWrap.appendChild(inputAreaEl);

    // Insert after stepper, before step-0
    var step0 = document.getElementById('step-0');
    if (step0) {
      centerPanel.insertBefore(chatWrap, step0);
    } else {
      centerPanel.appendChild(chatWrap);
    }

    return true;
  }

  // ── Message Helpers ──────────────────────────────────────────

  function addBellaMessage(html, callback) {
    // Show typing first
    var typingBubble = document.createElement('div');
    typingBubble.className = 'bella-chat__bubble bella-chat__bubble--bella';
    typingBubble.innerHTML =
      '<img src="assets/images/bella-mascot.png" alt="Bella" class="bella-chat__avatar">' +
      '<div class="bella-chat__bubble-text">' +
        '<span class="bella-chat__sender">Bella</span>' +
        '<div class="bella-chat__typing"><span></span><span></span><span></span></div>' +
      '</div>';
    messagesEl.appendChild(typingBubble);
    scrollToBottom();

    // Replace with real message after delay
    var delay = 300 + Math.random() * 200;
    setTimeout(function () {
      typingBubble.querySelector('.bella-chat__bubble-text').innerHTML =
        '<span class="bella-chat__sender">Bella</span>' + html;
      // Re-trigger animation
      typingBubble.style.animation = 'none';
      typingBubble.offsetHeight; // reflow
      typingBubble.style.animation = '';
      scrollToBottom();
      if (callback) callback();
    }, delay);
  }

  function addUserMessage(text) {
    var bubble = document.createElement('div');
    bubble.className = 'bella-chat__bubble bella-chat__bubble--user';
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  function scrollToBottom() {
    setTimeout(function () {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 50);
  }

  function clearInputArea() {
    inputAreaEl.innerHTML = '';
  }

  // ── Input Renderers ──────────────────────────────────────────

  function renderTextInput(placeholder, onSubmit, isTextarea) {
    clearInputArea();
    var wrap = document.createElement('div');
    wrap.className = 'bella-chat__text-input';

    var input;
    if (isTextarea) {
      input = document.createElement('textarea');
      input.rows = 3;
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }
    input.placeholder = placeholder;
    input.autocomplete = 'off';

    var sendBtn = document.createElement('button');
    sendBtn.className = 'bella-chat__send-btn';
    sendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    sendBtn.title = 'Send';

    function submit() {
      var val = input.value.trim();
      if (!val) return;
      onSubmit(val);
    }

    sendBtn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    });

    wrap.appendChild(input);
    wrap.appendChild(sendBtn);
    inputAreaEl.appendChild(wrap);

    // Focus
    setTimeout(function () { input.focus(); }, 100);
  }

  function renderChips(chips, onSelect) {
    clearInputArea();
    var wrap = document.createElement('div');
    wrap.className = 'bella-chat__chips';

    chips.forEach(function (chip) {
      var btn = document.createElement('button');
      btn.className = 'bella-chat__chip' + (chip.primary ? ' bella-chat__chip--primary' : '');
      btn.textContent = chip.label;
      btn.addEventListener('click', function () {
        onSelect(chip);
      });
      wrap.appendChild(btn);
    });

    inputAreaEl.appendChild(wrap);
  }

  function renderChipsAndText(chips, onChipSelect, textPlaceholder, onTextSubmit) {
    clearInputArea();
    var wrap = document.createElement('div');
    wrap.className = 'bella-chat__chips';

    chips.forEach(function (chip) {
      var btn = document.createElement('button');
      btn.className = 'bella-chat__chip' + (chip.primary ? ' bella-chat__chip--primary' : '');
      btn.textContent = chip.label;
      btn.addEventListener('click', function () {
        onChipSelect(chip);
      });
      wrap.appendChild(btn);
    });

    inputAreaEl.appendChild(wrap);

    if (textPlaceholder && onTextSubmit) {
      var textWrap = document.createElement('div');
      textWrap.className = 'bella-chat__text-input';
      textWrap.style.marginTop = 'var(--sp-sm)';

      var input = document.createElement('input');
      input.type = 'text';
      input.placeholder = textPlaceholder;
      input.autocomplete = 'off';

      var sendBtn = document.createElement('button');
      sendBtn.className = 'bella-chat__send-btn';
      sendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

      function submit() {
        var val = input.value.trim();
        if (!val) return;
        onTextSubmit(val);
      }
      sendBtn.addEventListener('click', submit);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });

      textWrap.appendChild(input);
      textWrap.appendChild(sendBtn);
      inputAreaEl.appendChild(textWrap);
    }
  }

  // ── Stepper Sync ─────────────────────────────────────────────

  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 12 10 16 18 8"/></svg>';

  function syncStepper(activeStep) {
    var steps = document.querySelectorAll('.stepper__step');
    steps.forEach(function (s, i) {
      s.classList.remove('active', 'complete');
      if (i < activeStep) {
        s.classList.add('complete');
        s.querySelector('.stepper__circle').innerHTML = CHECK_SVG;
      } else if (i === activeStep) {
        s.classList.add('active');
        s.querySelector('.stepper__circle').textContent = (i + 1).toString();
      } else {
        s.querySelector('.stepper__circle').textContent = (i + 1).toString();
      }
    });
  }

  // ── Guide panel sync ─────────────────────────────────────────

  function updateGuideText(text) {
    var guideEl = document.getElementById('guideText');
    if (guideEl) guideEl.textContent = text;
  }

  // ═══ CONVERSATION FLOW ════════════════════════════════════════

  // -- Step 1: Ask about business idea ──────────────────────────

  function askBusinessIdea() {
    conversationStep = 0;
    syncStepper(0);
    updateGuideText('Tell me about the business you want to start! I will help you shape your idea.');

    var msg =
      '<p>Hey there! I am Bella, your launch guide at Think! Ventures. ' +
      'I am here to help you build a clear, strong business concept before we handle any paperwork.</p>' +
      '<p>So tell me -- what kind of business are you thinking about starting? Even a rough idea is fine, ' +
      'we will sharpen it together.</p>';

    addBellaMessage(msg, function () {
      renderChipsAndText(
        [{ label: 'I already know what I need -- skip ahead', value: 'quickstart' }],
        function (chip) {
          if (chip.value === 'quickstart') {
            addUserMessage('I already know what I need');
            clearInputArea();
            quickStartFlow();
          }
        },
        'e.g. I want to start a cleaning company, I want to open a bakery...',
        handleBusinessIdea
      );
    });
  }

  // ── Quick-Start Flow (skip discovery) ─────────────────────────

  function quickStartFlow() {
    addBellaMessage(
      '<p>No problem -- let us move fast. Pick your industry:</p>',
      function () {
        var chips = Object.keys(INDUSTRY_NAMES).map(function (key) {
          return { label: INDUSTRY_NAMES[key], value: key };
        });
        renderChips(chips, function (chip) {
          addUserMessage(chip.label);
          chatData.industry = chip.value;
          chatData.industryName = chip.label;
          chatData.businessDesc = chip.label + ' business';
          clearInputArea();

          if (window.selections) window.selections.industry = chip.value;
          if (typeof window.selectIndustry === 'function') {
            try { window.selectIndustry(chip.value); } catch (e) { /* silent */ }
          }
          if (window.gamification) {
            try { window.gamification.completeStep(0); } catch (e) { /* silent */ }
          }

          syncStepper(1);
          askState();
        });
      }
    );
  }

  // ── Discovery Phase Sub-Question Maps ──────────────────────────

  var SERVICE_TYPE_CHIPS = {
    'home-services': [
      'Residential cleaning (homes, apartments)',
      'Commercial cleaning (offices, businesses)',
      'Specialty cleaning (carpet, windows, pressure washing)',
      'Installation and repair (lights, doors, fixtures)',
      'Maintenance and handyman services',
      'Landscaping and outdoor services'
    ],
    'construction': [
      'General contracting (full builds, renovations)',
      'Specialty trade (roofing, concrete, electrical)',
      'Residential construction',
      'Commercial construction',
      'Remodeling and renovation',
      'Specialty installations (fencing, decks, signs)'
    ],
    'food-beverage': [
      'Food truck or mobile kitchen',
      'Restaurant or cafe',
      'Catering and events',
      'Baking and specialty foods',
      'Meal prep and delivery',
      'Beverages (coffee, juice, bar)'
    ],
    'health-beauty': [
      'Hair salon or barbershop',
      'Spa or skincare services',
      'Nail or lash services',
      'Personal training or fitness',
      'Massage or wellness therapy',
      'Makeup and beauty services'
    ],
    'professional': [
      'Business consulting or coaching',
      'Marketing or advertising agency',
      'Accounting or bookkeeping',
      'Legal or paralegal services',
      'Real estate services',
      'Virtual assistant or admin support'
    ],
    'retail': [
      'Online store (e-commerce)',
      'Physical retail or boutique',
      'Handmade or artisan products',
      'Resale, thrift, or vintage',
      'Clothing or fashion brand',
      'Specialty products (candles, crafts, jewelry)'
    ],
    'creative': [
      'Graphic or web design',
      'Photography or videography',
      'Music production or DJ services',
      'Content creation or social media',
      'Event planning',
      'Printing or custom products'
    ],
    'tech': [
      'Software development or SaaS',
      'Web development',
      'IT support or managed services',
      'App development',
      'Cybersecurity or data services',
      'Tech consulting'
    ],
    'education': [
      'Tutoring or academic support',
      'Music, art, or dance lessons',
      'Professional training or workshops',
      'Daycare or childcare',
      'Online courses or coaching',
      'Test prep or college prep'
    ]
  };

  var CUSTOMER_CHIPS = [
    'Individual consumers (homeowners, families)',
    'Businesses and offices',
    'Property managers and landlords',
    'Other businesses (B2B)',
    'Government or public sector',
    'A mix of consumers and businesses'
  ];

  // ── Discovery Phase: Flesh Out the Idea ─────────────────────

  function handleBusinessIdea(text) {
    addUserMessage(text);
    chatData.userIdea = text;
    clearInputArea();

    // Classify the idea
    var results = classifyBusiness(text);

    if (results.length > 0) {
      chatData._prelimIndustry = results[0].industry;
      var industryName = INDUSTRY_NAMES[results[0].industry] || results[0].industry;

      // Confirm classification with user
      addBellaMessage(
        '<p>It sounds like you want to start a <strong>' + esc(industryName) + '</strong> business. ' +
        'Did I get that right?</p>',
        function () {
          renderChips([
            { label: 'Yes, that is right', value: results[0].industry, primary: true },
            { label: 'No, let me pick a different category', value: 'pick' }
          ], function (chip) {
            if (chip.value === 'pick') {
              addUserMessage('Let me pick a different category');
              clearInputArea();
              pickIndustryManually();
            } else {
              addUserMessage('Yes -- ' + industryName);
              clearInputArea();
              confirmAndContinue(chip.value);
            }
          });
        }
      );
    } else {
      // No match -- ask them to pick
      addBellaMessage(
        '<p>Interesting idea! I was not able to narrow that down to a specific category. ' +
        'Which of these industries best describes what you want to do?</p>',
        function () { pickIndustryManually(); }
      );
    }
  }

  function pickIndustryManually() {
    clearInputArea();
    var chips = Object.keys(INDUSTRY_NAMES).map(function (key) {
      return { label: INDUSTRY_NAMES[key], value: key };
    });
    renderChips(chips, function (chip) {
      addUserMessage(chip.label);
      clearInputArea();
      chatData._prelimIndustry = chip.value;
      confirmAndContinue(chip.value);
    });
  }

  function confirmAndContinue(industryKey) {
    var industryName = INDUSTRY_NAMES[industryKey] || industryKey;
    chatData._prelimIndustry = industryKey;

    addBellaMessage(
      '<p>' + esc(industryName) + ' -- that is a solid space to be in. ' +
      'Now let me ask a few quick questions so I can build you a strong business concept. ' +
      'Ready? Here we go.</p>',
      function () {
        // Small delay then auto-advance to first question
        setTimeout(function () {
          askServiceType();
        }, 600);
      }
    );
  }

  function askServiceType() {
    var prelim = chatData._prelimIndustry;
    var industryName = prelim ? INDUSTRY_NAMES[prelim] : '';

    addBellaMessage(
      '<p><strong>Question 1 of 3:</strong> What specific type of work will you do? ' +
      'The more specific we get, the stronger your business plan will be.</p>',
      function () {
        // Show relevant chips if we have a preliminary industry
        var chips = [];
        if (prelim && SERVICE_TYPE_CHIPS[prelim]) {
          SERVICE_TYPE_CHIPS[prelim].forEach(function (label) {
            chips.push({ label: label, value: label });
          });
        }

        // Always add a go-back option
        chips.push({ label: 'Go back -- I want to change my industry', value: '__goback__' });

        if (chips.length > 1) {
          renderChipsAndText(
            chips,
            function (chip) {
              if (chip.value === '__goback__') {
                addUserMessage('Let me go back');
                clearInputArea();
                pickIndustryManually();
                return;
              }
              addUserMessage(chip.label);
              chatData.serviceType = chip.label;
              clearInputArea();
              askCustomers();
            },
            'Or describe it in your own words...',
            function (val) {
              addUserMessage(val);
              chatData.serviceType = val;
              clearInputArea();
              askCustomers();
            }
          );
        } else {
          renderTextInput(
            'e.g. Residential cleaning for homes and apartments...',
            function (val) {
              addUserMessage(val);
              chatData.serviceType = val;
              clearInputArea();
              askCustomers();
            }
          );
        }
      }
    );
  }

  function askCustomers() {
    addBellaMessage(
      '<p><strong>Question 2 of 3:</strong> Who are your ideal customers? ' +
      'Knowing your audience shapes everything from your marketing to your pricing.</p>',
      function () {
        var chips = CUSTOMER_CHIPS.map(function (label) {
          return { label: label, value: label };
        });
        chips.push({ label: 'Go back -- I want to change my answer', value: '__goback__' });

        renderChipsAndText(
          chips,
          function (chip) {
            if (chip.value === '__goback__') {
              addUserMessage('Let me go back');
              clearInputArea();
              askServiceType();
              return;
            }
            addUserMessage(chip.label);
            chatData.customers = chip.label;
            clearInputArea();
            askDifferentiator();
          },
          'Or describe your target customers...',
          function (val) {
            addUserMessage(val);
            chatData.customers = val;
            clearInputArea();
            askDifferentiator();
          }
        );
      }
    );
  }

  function askDifferentiator() {
    addBellaMessage(
      '<p><strong>Question 3 of 3 -- last one:</strong> What will set your business apart? ' +
      'Why should a customer pick you over someone else?</p>' +
      '<p>Think about things like: quality of work, speed, pricing, specialization, ' +
      'customer service, experience, or anything unique you bring to the table.</p>',
      function () {
        renderChipsAndText(
          [{ label: 'Go back -- I want to change my answer', value: '__goback__' }],
          function (chip) {
            if (chip.value === '__goback__') {
              addUserMessage('Let me go back');
              clearInputArea();
              askCustomers();
            }
          },
          'e.g. We offer same-day service and a satisfaction guarantee...',
          function (val) {
            addUserMessage(val);
            chatData.differentiator = val;
            clearInputArea();
            generateAbstract();
          }
        );
      }
    );
  }



  // ── Generate Business Abstract ──────────────────────────────

  function generateAbstract() {
    // Build the abstract from collected answers
    var idea = chatData.userIdea || '';
    var serviceType = chatData.serviceType || '';
    var customers = chatData.customers || '';
    var differentiator = chatData.differentiator || '';

    // Re-classify using ALL collected information for better accuracy
    var fullText = [idea, serviceType, customers, differentiator].join(' ');
    var results = classifyBusiness(fullText);

    var industryKey = chatData._prelimIndustry || (results.length > 0 ? results[0].industry : null);
    var industryName = industryKey ? INDUSTRY_NAMES[industryKey] : '';

    // Construct professional abstract
    var abstract = buildAbstractText(serviceType, customers, differentiator, industryName);
    chatData.generatedAbstract = abstract;

    // Show the abstract with industry classification
    var html = '<p>Here is a professional business abstract based on everything you told me:</p>' +
      '<div class="bella-chat__verify">' +
        '<div class="bella-chat__verify-title">Your Business Concept</div>' +
        '<div style="padding: var(--sp-md); color: var(--color-text); line-height: 1.7; font-size: var(--fs-sm);">' +
          esc(abstract) +
        '</div>' +
      '</div>';

    if (industryName) {
      html += '<p>Based on all of this, I would classify your business as <strong>' +
              esc(industryName) + '</strong> -- ' +
              esc(INDUSTRY_DESCRIPTIONS[industryKey] || '') + '. Does this look right?</p>';
    } else {
      html += '<p>Which industry category fits this best?</p>';
    }

    addBellaMessage(html, function () {
      if (industryKey) {
        renderChips([
          { label: 'Looks great -- ' + industryName, value: industryKey, primary: true },
          { label: 'Let me tweak the description', value: 'edit' },
          { label: 'Pick a different industry', value: 'pick' }
        ], function (chip) {
          if (chip.value === 'edit') {
            addUserMessage('Let me tweak the description');
            editAbstract();
          } else if (chip.value === 'pick') {
            addUserMessage('Pick a different industry');
            showAllIndustryChips();
          } else {
            addUserMessage('Looks great -- ' + industryName);
            chatData.businessDesc = chatData.generatedAbstract;
            selectIndustryChat(chip.value);
          }
        });
      } else {
        showAllIndustryChips();
      }
    });
  }

  function buildAbstractText(serviceType, customers, differentiator, industryName) {
    // Build a clean, professional abstract sentence by sentence
    var parts = [];

    // Opening line based on service type
    if (serviceType) {
      var svc = serviceType.replace(/^(Residential|Commercial|Specialty|General|Professional)\s*/i, '');
      parts.push('A ' + (industryName ? industryName.toLowerCase() : 'service') +
        ' business specializing in ' + serviceType.toLowerCase().replace(/\.$/, '') + '.');
    }

    // Customer focus
    if (customers) {
      var custLower = customers.toLowerCase();
      if (custLower.indexOf('individual') !== -1 || custLower.indexOf('homeowner') !== -1 || custLower.indexOf('families') !== -1) {
        parts.push('Serving residential customers including homeowners and families.');
      } else if (custLower.indexOf('business') !== -1 && custLower.indexOf('mix') === -1) {
        parts.push('Providing services to commercial clients and business organizations.');
      } else if (custLower.indexOf('property') !== -1) {
        parts.push('Serving property managers, landlords, and real estate professionals.');
      } else if (custLower.indexOf('mix') !== -1 || custLower.indexOf('both') !== -1) {
        parts.push('Serving both residential and commercial clients.');
      } else {
        parts.push('Serving ' + customers.toLowerCase().replace(/\.$/, '') + '.');
      }
    }

    // Differentiator
    if (differentiator) {
      var diff = differentiator.charAt(0).toUpperCase() + differentiator.slice(1).replace(/\.$/, '');
      parts.push('Differentiated by ' + differentiator.toLowerCase().replace(/\.$/, '') + '.');
    }

    return parts.join(' ');
  }

  function editAbstract() {
    addBellaMessage(
      '<p>No problem -- edit the description below to say exactly what you want:</p>',
      function () {
        renderTextInput(
          'Edit your business description...',
          function (val) {
            addUserMessage(val);
            chatData.generatedAbstract = val;
            chatData.businessDesc = val;
            clearInputArea();

            // Re-classify with edited text
            var results = classifyBusiness(val + ' ' + chatData.userIdea);
            var industryKey = results.length > 0 ? results[0].industry : chatData._prelimIndustry;
            var industryName = industryKey ? INDUSTRY_NAMES[industryKey] : '';

            if (industryKey) {
              addBellaMessage(
                '<p>Updated. I still see this as <strong>' + esc(industryName) + '</strong>. Ready to continue?</p>',
                function () {
                  renderChips([
                    { label: 'Yes, continue', value: industryKey, primary: true },
                    { label: 'Pick a different industry', value: 'pick' }
                  ], function (chip) {
                    if (chip.value === 'pick') {
                      addUserMessage('Pick a different industry');
                      showAllIndustryChips();
                    } else {
                      addUserMessage('Yes, continue');
                      selectIndustryChat(chip.value);
                    }
                  });
                }
              );
            } else {
              showAllIndustryChips();
            }
          },
          true // textarea
        );

        // Pre-fill
        var textarea = inputAreaEl.querySelector('textarea');
        if (textarea) textarea.value = chatData.generatedAbstract || '';
      }
    );
  }

  function showAllIndustryChips() {
    addBellaMessage(
      '<p>No problem! Pick the industry that best matches your business:</p>',
      function () {
        var chips = Object.keys(INDUSTRY_NAMES).map(function (key) {
          return { label: INDUSTRY_NAMES[key], value: key };
        });
        renderChips(chips, function (chip) {
          addUserMessage(chip.label);
          if (!chatData.businessDesc) chatData.businessDesc = chatData.generatedAbstract || chatData.userIdea || '';
          selectIndustryChat(chip.value);
        });
      }
    );
  }

  function selectIndustryChat(industryKey) {
    chatData.industry = industryKey;
    chatData.industryName = INDUSTRY_NAMES[industryKey] || industryKey;
    if (!chatData.businessDesc) chatData.businessDesc = chatData.generatedAbstract || chatData.userIdea || '';
    clearInputArea();

    // Set wizard global
    if (window.selections) window.selections.industry = industryKey;
    if (typeof window.selectIndustry === 'function') {
      try { window.selectIndustry(industryKey); } catch (e) { /* silent */ }
    }

    // XP
    if (window.gamification) {
      try { window.gamification.completeStep(0); } catch (e) { /* silent */ }
    }

    syncStepper(1);
    askState();
  }

  // -- Step 2: Ask about state ──────────────────────────────────

  function askState() {
    conversationStep = 1;
    updateGuideText('Great choice! Now, where will your business call home?');

    addBellaMessage(
      '<p>Now, what state will you be operating in? This matters because every state has ' +
      'different filing requirements, fees, and timelines.</p>',
      function () {
        // Build top state chips + search option
        var chips = [];
        TOP_STATES.forEach(function (key) {
          var st = STATES[key];
          if (st) {
            var label = st.title;
            if (st.llcFee) label += ' ($' + st.llcFee + ')';
            chips.push({ label: label, value: key });
          }
        });
        chips.push({ label: 'Search all states...', value: 'search' });
        chips.push({ label: 'Go back -- I want to change my business concept', value: '__goback__' });

        renderChips(chips, function (chip) {
          if (chip.value === '__goback__') {
            addUserMessage('Let me go back');
            clearInputArea();
            askBusinessIdea();
          } else if (chip.value === 'search') {
            addUserMessage('Search all states');
            showStateSearch();
          } else {
            var st = STATES[chip.value];
            addUserMessage(st ? st.title : chip.value);
            selectStateChat(chip.value);
          }
        });
      }
    );
  }

  function showStateSearch() {
    clearInputArea();

    // Search input
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'bella-chat__state-search';
    searchInput.placeholder = 'Type a state name...';
    searchInput.autocomplete = 'off';

    // Results container
    var resultsDiv = document.createElement('div');
    resultsDiv.className = 'bella-chat__state-results';

    inputAreaEl.appendChild(searchInput);
    inputAreaEl.appendChild(resultsDiv);

    function renderFilteredStates(query) {
      var q = (query || '').toLowerCase().trim();
      resultsDiv.innerHTML = '';

      var entries = Object.keys(STATES);
      var sorted = entries.sort(function (a, b) {
        return STATES[a].title.localeCompare(STATES[b].title);
      });

      var filtered = sorted.filter(function (key) {
        if (!q) return true;
        return STATES[key].title.toLowerCase().indexOf(q) !== -1 || key.indexOf(q) !== -1;
      });

      if (filtered.length === 0) {
        resultsDiv.innerHTML = '<span style="color: var(--color-text-muted); font-size: var(--fs-sm);">No states found.</span>';
        return;
      }

      filtered.forEach(function (key) {
        var st = STATES[key];
        var btn = document.createElement('button');
        btn.className = 'bella-chat__chip';
        btn.textContent = st.title + (st.llcFee ? ' ($' + st.llcFee + ')' : '');
        btn.addEventListener('click', function () {
          addUserMessage(st.title);
          selectStateChat(key);
        });
        resultsDiv.appendChild(btn);
      });
    }

    searchInput.addEventListener('input', function () {
      renderFilteredStates(this.value);
    });

    renderFilteredStates('');
    setTimeout(function () { searchInput.focus(); }, 100);
  }

  function selectStateChat(stateKey) {
    chatData.state = stateKey;
    var st = STATES[stateKey];
    chatData.stateName = st ? st.title : stateKey;
    clearInputArea();

    // Set wizard global
    if (window.selections) window.selections.state = stateKey;
    if (typeof window.selectState === 'function') {
      try { window.selectState(stateKey); } catch (e) { /* silent */ }
    }

    // XP
    if (window.gamification) {
      try { window.gamification.completeStep(1); } catch (e) { /* silent */ }
    }

    syncStepper(2);
    askEntity();
  }

  // -- Step 3: Ask about entity ─────────────────────────────────

  function askEntity() {
    conversationStep = 2;
    updateGuideText('Now let us figure out the right business structure for you.');

    var industryKey = chatData.industry;
    var rec = ENTITY_REASONS[industryKey] || ENTITY_REASONS['home-services'];
    var recType = rec.type || 'llc';
    var recName = recType === 'llc' ? 'LLC' : 'Sole Proprietorship';
    var industryName = chatData.industryName || 'your';
    var stName = chatData.stateName || 'your state';

    // Get fee for this state
    var fee = '';
    var st = STATES[chatData.state];
    if (st) {
      if (recType === 'llc' && st.llcFee) fee = '$' + st.llcFee;
    }

    var reasons = rec.reasons || [];
    var reasonsHtml = '<ul>';
    reasons.forEach(function (r) {
      reasonsHtml += '<li>' + esc(r) + '</li>';
    });
    if (fee) {
      reasonsHtml += '<li>Simple to set up -- just ' + esc(fee) + ' in ' + esc(stName) + '</li>';
    }
    reasonsHtml += '</ul>';

    addBellaMessage(
      '<p>' + esc(stName) + ' -- great choice. Now for the important part: what type of business entity ' +
      'should you form? For a ' + esc(industryName.toLowerCase()) + ' business like yours, ' +
      'I recommend an <strong>' + esc(recName) + '</strong>. Here is why:</p>' +
      reasonsHtml +
      '<p>Sound good?</p>',
      function () {
        renderChips([
          { label: recName + ' -- let us do it!', value: recType, primary: true },
          { label: 'Tell me about other options', value: 'other' },
          { label: 'Go back -- I want to change my state', value: '__goback__' }
        ], function (chip) {
          if (chip.value === '__goback__') {
            addUserMessage('Let me go back');
            clearInputArea();
            askState();
          } else if (chip.value === 'other') {
            addUserMessage('Tell me about other options');
            showAllEntityOptions();
          } else {
            addUserMessage(recName + ' -- let us do it!');
            selectEntityChat(chip.value);
          }
        });
      }
    );
  }

  function showAllEntityOptions() {
    var entitiesData = ENTITIES && ENTITIES.length ? ENTITIES : [
      { id: 'llc', title: 'LLC' },
      { id: 'sole', title: 'Sole Proprietorship' },
      { id: 'scorp', title: 'S-Corporation' },
      { id: 'nonprofit', title: '501(c)(3) Nonprofit' }
    ];

    var html = '<p>Here are your options:</p>';
    entitiesData.forEach(function (ent) {
      var desc = ENTITY_DESCRIPTIONS[ent.id] || ent.desc || '';
      var fee = '';
      var st = STATES[chatData.state];
      if (st && ent.feeKey && st[ent.feeKey]) {
        fee = ' -- $' + st[ent.feeKey] + ' filing fee';
      } else if (ent.id === 'sole') {
        fee = ' -- no filing fee';
      }
      html += '<p><strong>' + esc(ent.title) + '</strong>' + esc(fee) + '<br>' +
              '<span style="color: var(--color-text-muted);">' + esc(desc) + '</span></p>';
    });

    addBellaMessage(html, function () {
      var chips = entitiesData.map(function (ent) {
        return { label: ent.title, value: ent.id };
      });
      renderChips(chips, function (chip) {
        addUserMessage(chip.label);
        selectEntityChat(chip.value);
      });
    });
  }

  function selectEntityChat(entityKey) {
    chatData.entity = entityKey;
    chatData.entityName = ENTITY_DISPLAY_NAMES[entityKey] || entityKey;
    clearInputArea();

    // Set wizard global
    if (window.selections) window.selections.entity = entityKey;
    if (typeof window.selectEntity === 'function') {
      try { window.selectEntity(entityKey); } catch (e) { /* silent */ }
    }

    // XP
    if (window.gamification) {
      try { window.gamification.completeStep(2); } catch (e) { /* silent */ }
    }

    syncStepper(3);
    askBusinessName();
  }

  // -- Step 4: Ask business name ────────────────────────────────

  function askBusinessName() {
    conversationStep = 3;
    updateGuideText('Almost there! What will you call your business?');

    addBellaMessage(
      '<p>Almost there! What do you want to name your business?</p>',
      function () {
        var suffix = chatData.entity === 'llc' ? ' LLC' :
                     chatData.entity === 'scorp' ? ' Inc.' : '';
        renderTextInput(
          'e.g. Brightside Installations' + suffix,
          function (val) {
            addUserMessage(val);
            chatData.businessName = val;
            clearInputArea();
            askBusinessDesc();
          }
        );
      }
    );
  }

  // -- Step 5: Confirm or edit business description ────────────
  // Description was already generated during the discovery phase.
  // Now we just let them review and edit if needed.

  function askBusinessDesc() {
    conversationStep = 4;

    var currentDesc = chatData.businessDesc || chatData.generatedAbstract || chatData.userIdea || '';

    if (currentDesc && currentDesc.length > 20) {
      // We already have a good description from the discovery phase
      // Go straight to verification
      showVerification();
      return;
    }

    // Fallback: ask for description if somehow we don't have one
    addBellaMessage(
      '<p>Give me a quick description of what your business does. ' +
      'This will go on your formation documents.</p>',
      function () {
        renderTextInput(
          'Describe your business...',
          function (val) {
            addUserMessage(val);
            chatData.businessDesc = val;
            clearInputArea();
            showVerification();
          },
          true
        );
      }
    );
  }

  // -- Step 6: Verification ─────────────────────────────────────

  function showVerification() {
    conversationStep = 5;

    var st = STATES[chatData.state] || {};
    var fee = '';
    if (chatData.entity === 'llc' && st.llcFee) fee = '$' + st.llcFee;
    else if (chatData.entity === 'scorp' && st.corpFee) fee = '$' + st.corpFee;
    else if (chatData.entity === 'nonprofit' && st.nonprofitFee) fee = '$' + st.nonprofitFee;
    else if (chatData.entity === 'sole') fee = 'No filing fee';

    var verifyHtml =
      '<p>Here is everything I have got:</p>' +
      '<div class="bella-chat__verify">' +
        '<div class="bella-chat__verify-title">Your Business Summary</div>' +
        '<div class="bella-chat__verify-row">' +
          '<span class="bella-chat__verify-label">Industry</span>' +
          '<span class="bella-chat__verify-value">' + esc(chatData.industryName) + '</span>' +
        '</div>' +
        '<div class="bella-chat__verify-row">' +
          '<span class="bella-chat__verify-label">State</span>' +
          '<span class="bella-chat__verify-value">' + esc(chatData.stateName) + '</span>' +
        '</div>' +
        '<div class="bella-chat__verify-row">' +
          '<span class="bella-chat__verify-label">Entity</span>' +
          '<span class="bella-chat__verify-value">' + esc(chatData.entityName) + (fee ? ' (' + esc(fee) + ')' : '') + '</span>' +
        '</div>' +
        '<div class="bella-chat__verify-row">' +
          '<span class="bella-chat__verify-label">Business Name</span>' +
          '<span class="bella-chat__verify-value">' + esc(chatData.businessName) + '</span>' +
        '</div>' +
        '<div class="bella-chat__verify-row">' +
          '<span class="bella-chat__verify-label">Description</span>' +
          '<span class="bella-chat__verify-value">' + esc(chatData.businessDesc) + '</span>' +
        '</div>' +
      '</div>' +
      '<p>Does everything look good?</p>';

    addBellaMessage(verifyHtml, function () {
      renderChips([
        { label: 'Generate My Roadmap', value: 'generate', primary: true },
        { label: 'Let me change something', value: 'change' }
      ], function (chip) {
        if (chip.value === 'change') {
          addUserMessage('Let me change something');
          askWhatToChange();
        } else {
          addUserMessage('Generate My Roadmap');
          launchRoadmap();
        }
      });
    });
  }

  function askWhatToChange() {
    addBellaMessage(
      '<p>What would you like to change?</p>',
      function () {
        renderChips([
          { label: 'Industry', value: 'industry' },
          { label: 'State', value: 'state' },
          { label: 'Entity', value: 'entity' },
          { label: 'Business Name', value: 'name' },
          { label: 'Description', value: 'desc' }
        ], function (chip) {
          addUserMessage('Change ' + chip.label);
          clearInputArea();

          switch (chip.value) {
            case 'industry':
              showAllIndustryChips();
              break;
            case 'state':
              askState();
              break;
            case 'entity':
              showAllEntityOptions();
              break;
            case 'name':
              askBusinessName();
              break;
            case 'desc':
              askBusinessDesc();
              break;
          }
        });
      }
    );
  }

  // -- Launch Roadmap ───────────────────────────────────────────

  function launchRoadmap() {
    clearInputArea();

    // Set all wizard globals
    if (window.selections) {
      window.selections.industry = chatData.industry;
      window.selections.state = chatData.state;
      window.selections.entity = chatData.entity;
      window.selections.name = chatData.businessName;
      window.selections.desc = chatData.businessDesc;
    }

    // Set form fields
    var bizName = document.getElementById('biz-name');
    if (bizName) bizName.value = chatData.businessName;

    var bizDesc = document.getElementById('biz-desc');
    if (bizDesc) bizDesc.value = chatData.businessDesc;

    // Final Bella message
    addBellaMessage(
      '<p>You are all set! Generating your personalized roadmap now. ' +
      'Every step, every form, every fee -- all mapped out for <strong>' +
      esc(chatData.businessName) + '</strong>.</p>',
      function () {
        // Hide chat
        var chatEl = document.getElementById('bella-chat');
        if (chatEl) chatEl.style.display = 'none';

        // Show step 4 (roadmap)
        window.currentStep = 4;

        // Award XP for step 3 (details)
        if (window.gamification) {
          try { window.gamification.completeStep(3); } catch (e) { /* silent */ }
        }

        // Call the existing generateRoadmap function
        if (typeof window.generateRoadmap === 'function') {
          window.generateRoadmap();
        } else if (typeof window.goToStep === 'function') {
          window.goToStep(4);
        }
      }
    );
  }


  // ═══ EXPOSE GLOBALS FOR WIZARD COMPAT ═════════════════════════

  // Override selectIndustry/selectState/selectEntity only if needed
  // for the left panel chat input to still work
  function hookLeftPanelChat() {
    var bellaChatInput = document.getElementById('bellaChatInput');
    var bellaChatSend = document.getElementById('bellaChatSend');
    if (!bellaChatInput || !bellaChatSend) return;

    function handleLeftPanelMessage() {
      var text = bellaChatInput.value.trim();
      if (!text) return;
      bellaChatInput.value = '';

      // Echo into the main chat as a user message
      addUserMessage(text);

      // Try to handle it contextually
      if (conversationStep === 0) {
        handleBusinessIdea(text);
      } else {
        // Show as a note from the side panel
        addBellaMessage(
          '<p>Thanks for the message! Please use the options below to continue through the steps.</p>'
        );
      }
    }

    bellaChatSend.addEventListener('click', handleLeftPanelMessage);
    bellaChatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLeftPanelMessage();
      }
    });
  }


  // ═══ INITIALIZE ══════════════════════════════════════════════

  function init() {
    // Defensive: only run on launchpad page
    if (!document.querySelector('.lp-center')) return;
    if (!document.getElementById('step-0')) return;

    // Wait for wizard data to be available
    if (!window.STATES || !window.INDUSTRIES) {
      // Retry once after a short delay
      setTimeout(function () {
        if (!window.STATES || !window.INDUSTRIES) return;
        doInit();
      }, 500);
      return;
    }

    doInit();
  }

  function doInit() {
    injectStyles();

    if (!buildChatUI()) return;

    hookLeftPanelChat();

    // Start the conversation
    askBusinessIdea();
  }

  // ── Wait for DOM ────────────────────────────────────────────

  function onReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  onReady(function () {
    // Delay to ensure wizard inline scripts have run first
    setTimeout(init, 300);
  });

})();
