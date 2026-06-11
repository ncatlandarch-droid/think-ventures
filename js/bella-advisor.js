/* ═══════════════════════════════════════════════════════════════
 *  bella-advisor.js  --  Conversational business classifier
 *  Think! Ventures LaunchPad
 *  ---------------------------------------------------------------
 *  Users describe their business idea in plain English.
 *  Bella matches keywords to the correct industry category,
 *  auto-selects it in the wizard, and pre-fills the description.
 *  Runs 100% client-side -- no API keys needed.
 * ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Keyword-to-Industry Mapping ──────────────────────────────
  // Each industry has an array of keywords/phrases that indicate
  // a business belongs in that category. Phrases are checked first
  // (longer matches win), then individual words.

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

  // ── Suggestion Chips (Popular Business Ideas) ────────────────
  var SUGGESTION_CHIPS = [
    { label: 'Cleaning Service', text: 'I want to start a cleaning service' },
    { label: 'Food Truck', text: 'I want to start a food truck' },
    { label: 'Hair Salon', text: 'I want to open a hair salon' },
    { label: 'Online Store', text: 'I want to start an online store' },
    { label: 'Landscaping', text: 'I want to start a landscaping business' },
    { label: 'Photography', text: 'I want to start a photography business' },
    { label: 'Tutoring', text: 'I want to start a tutoring service' },
    { label: 'Consulting', text: 'I want to start a consulting firm' },
    { label: 'Construction', text: 'I want to start a construction company' },
    { label: 'Fitness Training', text: 'I want to become a personal trainer' },
    { label: 'Restaurant', text: 'I want to open a restaurant' },
    { label: 'Tech Startup', text: 'I want to build a software app' }
  ];

  // ── Industry Display Names (for Bella's responses) ──────────
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

  // ── Entity Suggestions by Industry ──────────────────────────
  var ENTITY_SUGGESTIONS = {
    'home-services': { type: 'llc', reason: 'An LLC protects your personal assets while keeping taxes simple. Perfect for service businesses.' },
    'construction': { type: 'llc', reason: 'An LLC is ideal for construction. It shields your personal assets from job-site liability.' },
    'food-beverage': { type: 'llc', reason: 'An LLC gives you liability protection, which is critical when serving food to the public.' },
    'health-beauty': { type: 'llc', reason: 'An LLC keeps your personal finances separate from your salon or spa business.' },
    'professional': { type: 'llc', reason: 'Most consultants and freelancers start with an LLC for flexibility and protection.' },
    'retail': { type: 'llc', reason: 'An LLC protects you personally while keeping your online or retail store simple to manage.' },
    'creative': { type: 'sole-prop', reason: 'Many creatives start as sole proprietors to keep things simple, then upgrade to LLC as they grow.' },
    'tech': { type: 'llc', reason: 'An LLC works great for tech businesses. If you plan to raise investment, consider a C-Corp later.' },
    'education': { type: 'llc', reason: 'An LLC protects you and keeps operations straightforward for training and tutoring businesses.' }
  };

  // ═══ CLASSIFICATION ENGINE ═══════════════════════════════════

  /**
   * Classify a business description into one or more industries.
   * Returns an array of { industry, score, matchedTerms } sorted by score desc.
   */
  function classifyBusiness(description) {
    if (!description || typeof description !== 'string') return [];

    var input = description.toLowerCase().trim();
    if (input.length < 2) return [];

    var scores = {};

    // Score each industry
    Object.keys(BUSINESS_KEYWORDS).forEach(function (industry) {
      var keywords = BUSINESS_KEYWORDS[industry];
      var matchedTerms = [];
      var score = 0;

      keywords.forEach(function (keyword) {
        var kw = keyword.toLowerCase();
        if (input.indexOf(kw) !== -1) {
          // Longer matches are weighted more heavily
          var weight = kw.split(' ').length;
          score += weight;
          matchedTerms.push(keyword);
        }
      });

      if (score > 0) {
        scores[industry] = { industry: industry, score: score, matchedTerms: matchedTerms };
      }
    });

    // Sort by score descending
    var results = Object.keys(scores).map(function (k) { return scores[k]; });
    results.sort(function (a, b) { return b.score - a.score; });

    return results;
  }

  // ═══ RESPONSE GENERATOR ══════════════════════════════════════

  /**
   * Generate Bella's conversational response based on classification results.
   */
  function generateBellaResponse(results, description) {
    if (!results || results.length === 0) {
      return {
        message: "I'm not quite sure what category that falls into, but that's totally fine! " +
                 "You can pick a category from the options below, or try describing your business " +
                 "a different way. For example: 'I want to start a cleaning service' or " +
                 "'I want to open a restaurant.'",
        industry: null,
        confidence: 'none'
      };
    }

    var top = results[0];
    var topName = INDUSTRY_NAMES[top.industry] || top.industry;
    var entitySuggestion = ENTITY_SUGGESTIONS[top.industry];

    // High confidence: single clear match
    if (results.length === 1 || top.score >= results[1].score * 2) {
      var msg = "That sounds like a " + topName + " business! " +
                "I've selected that category for you.";

      if (entitySuggestion) {
        msg += " Most people in " + topName.toLowerCase() + " start with an " +
               (entitySuggestion.type === 'llc' ? 'LLC' : 'Sole Proprietorship') +
               ". " + entitySuggestion.reason;
      }

      msg += " Click 'Next' to continue, or pick a different category below if I got it wrong.";

      return {
        message: msg,
        industry: top.industry,
        confidence: 'high'
      };
    }

    // Multi-industry match
    if (results.length >= 2) {
      var secondName = INDUSTRY_NAMES[results[1].industry] || results[1].industry;

      var msg = "Based on what you described, your business touches both " +
                topName + " and " + secondName + ". " +
                "I've selected " + topName + " as your primary category since it's the strongest match";

      if (top.matchedTerms.length > 0) {
        msg += " (matched: " + top.matchedTerms.slice(0, 3).join(', ') + ")";
      }

      msg += ". You can change this to " + secondName + " below if that fits better.";

      return {
        message: msg,
        industry: top.industry,
        secondaryIndustry: results[1].industry,
        confidence: 'medium'
      };
    }

    return {
      message: "That sounds like it could be a " + topName + " business. " +
               "I've selected that for you, but feel free to change it below.",
      industry: top.industry,
      confidence: 'low'
    };
  }

  // ═══ UI BUILDER ══════════════════════════════════════════════

  /**
   * Build and inject the Bella advisor UI into Step 0.
   */
  function initBellaAdvisor() {
    var industryGrid = document.getElementById('industry-grid');
    if (!industryGrid) return;

    // Find the step container (step-0)
    var step0 = document.getElementById('step-0');
    if (!step0) return;

    // Find where to insert (before the industry grid)
    var gridParent = industryGrid.parentElement;

    // Build the advisor HTML
    var advisorHTML = '';
    advisorHTML += '<div class="bella-advisor" id="bella-advisor">';

    // Bella intro message
    advisorHTML += '  <div class="bella-advisor__intro">';
    advisorHTML += '    <img src="assets/images/bella-mascot.png" alt="Bella" class="bella-advisor__avatar">';
    advisorHTML += '    <div class="bella-advisor__bubble" id="bella-advisor-bubble">';
    advisorHTML += '      <p class="bella-advisor__greeting">Hi there! Tell me about the business you want to start. ' +
                         'What products or services will you offer? I will figure out everything else for you.</p>';
    advisorHTML += '    </div>';
    advisorHTML += '  </div>';

    // Input area
    advisorHTML += '  <div class="bella-advisor__input-wrap">';
    advisorHTML += '    <input type="text" class="bella-advisor__input" id="bella-advisor-input" ' +
                       'placeholder="Example: I want to install Christmas lights and garage doors..." ' +
                       'autocomplete="off">';
    advisorHTML += '    <button class="bella-advisor__send" id="bella-advisor-send" title="Ask Bella">';
    advisorHTML += '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
                         'stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/>' +
                         '<polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    advisorHTML += '    </button>';
    advisorHTML += '  </div>';

    // Suggestion chips
    advisorHTML += '  <div class="bella-advisor__chips" id="bella-advisor-chips">';
    advisorHTML += '    <span class="bella-advisor__chips-label">Popular ideas:</span>';
    SUGGESTION_CHIPS.forEach(function (chip, i) {
      advisorHTML += '    <button class="bella-advisor__chip" data-chip="' + i + '">' + chip.label + '</button>';
    });
    advisorHTML += '  </div>';

    advisorHTML += '</div>'; // end bella-advisor

    // Divider before manual grid
    advisorHTML += '<div class="bella-advisor__divider" id="bella-advisor-divider">';
    advisorHTML += '  <span>or pick a category manually</span>';
    advisorHTML += '</div>';

    // Insert before the industry grid
    var wrapper = document.createElement('div');
    wrapper.innerHTML = advisorHTML;

    // Insert all children before the grid
    while (wrapper.firstChild) {
      gridParent.insertBefore(wrapper.firstChild, industryGrid);
    }

    // Wire up events
    wireAdvisorEvents();
  }

  /**
   * Wire up input, send button, and chip click events.
   */
  function wireAdvisorEvents() {
    var input = document.getElementById('bella-advisor-input');
    var sendBtn = document.getElementById('bella-advisor-send');
    var chipsContainer = document.getElementById('bella-advisor-chips');

    if (!input || !sendBtn) return;

    // Send on button click
    sendBtn.addEventListener('click', function () {
      handleBellaQuery(input.value);
    });

    // Send on Enter key
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleBellaQuery(input.value);
      }
    });

    // Chip clicks
    if (chipsContainer) {
      chipsContainer.addEventListener('click', function (e) {
        var chip = e.target.closest('.bella-advisor__chip');
        if (!chip) return;
        var idx = parseInt(chip.getAttribute('data-chip'), 10);
        if (isNaN(idx) || !SUGGESTION_CHIPS[idx]) return;

        input.value = SUGGESTION_CHIPS[idx].text;
        handleBellaQuery(SUGGESTION_CHIPS[idx].text);
      });
    }
  }

  /**
   * Process user input, classify, respond, and auto-select.
   */
  function handleBellaQuery(text) {
    if (!text || !text.trim()) return;

    var input = document.getElementById('bella-advisor-input');
    var bubble = document.getElementById('bella-advisor-bubble');

    // Classify
    var results = classifyBusiness(text);
    var response = generateBellaResponse(results, text);

    // Show typing animation briefly
    bubble.innerHTML = '<div class="bella-advisor__typing">' +
                       '<span></span><span></span><span></span></div>';
    bubble.classList.add('bella-advisor__bubble--active');

    // Disable input during "thinking"
    input.disabled = true;

    setTimeout(function () {
      // Show response
      bubble.innerHTML = '<p class="bella-advisor__response">' + response.message + '</p>';

      // Re-enable input
      input.disabled = false;

      // Auto-select industry if we found one
      if (response.industry && typeof window.selectIndustry === 'function') {
        window.selectIndustry(response.industry);

        // Highlight the selected card
        var card = document.querySelector('[data-industry="' + response.industry + '"]');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Store the description for pre-filling Step 3
        window._bellaDescription = text.trim();

        // Store entity suggestion
        if (ENTITY_SUGGESTIONS[response.industry]) {
          window._bellaEntitySuggestion = ENTITY_SUGGESTIONS[response.industry].type;
        }
      }

      // Scroll bubble into view
      bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    }, 600 + Math.random() * 400);
  }

  // ═══ SMART-FILL: Auto-fill after State Selection ══════════════

  /**
   * Entity display names for the verification card.
   */
  var ENTITY_DISPLAY = {
    'llc': 'LLC (Limited Liability Company)',
    'sole': 'Sole Proprietorship',
    'scorp': 'S-Corporation',
    'nonprofit': '501(c)(3) Nonprofit'
  };

  /**
   * Check if Bella has enough info to smart-fill the remaining steps.
   * Called from the overridden nextStep when leaving Step 1 (state).
   */
  function canSmartFill() {
    return !!(window._bellaDescription && window._bellaEntitySuggestion);
  }

  /**
   * Execute the smart-fill: auto-select entity, pre-fill description,
   * build the verification summary, and jump to Step 3.
   */
  function doSmartFill() {
    var entityType = window._bellaEntitySuggestion || 'llc';
    var description = window._bellaDescription || '';

    // 1. Auto-select entity in the wizard (triggers the internal state)
    if (typeof window.selectEntity === 'function') {
      window.selectEntity(entityType);
    }

    // 2. Pre-fill description field
    var descField = document.getElementById('biz-desc');
    if (descField && description) {
      descField.value = description;
    }

    // 3. Build the verification summary at the top of Step 3
    buildVerificationSummary();

    // 4. Jump to Step 3 (skip Step 2 entity selection)
    if (typeof window.goToStep === 'function') {
      // Award XP for both skipped steps
      if (window.gamification) {
        window.gamification.completeStep(1);  // state step
        window.gamification.completeStep(2);  // entity step (auto-filled)
      }
      window.goToStep(3);
    }
  }

  /**
   * Build and inject the Bella verification summary card at the top of Step 3.
   */
  function buildVerificationSummary() {
    var step3 = document.getElementById('step-3');
    if (!step3) return;

    // Remove any existing verification summary
    var existing = document.getElementById('bella-verify-summary');
    if (existing) existing.remove();

    // Gather all the data
    var industry = window.selections ? window.selections.industry : null;
    var state = window.selections ? window.selections.state : null;
    var entityType = window._bellaEntitySuggestion || 'llc';
    var description = window._bellaDescription || '';
    var entitySuggestion = ENTITY_SUGGESTIONS[industry] || {};

    var industryName = INDUSTRY_NAMES[industry] || industry || 'Not selected';
    var stateName = 'Not selected';
    if (state && window.STATES && window.STATES[state]) {
      stateName = window.STATES[state].title;
    }
    var entityName = ENTITY_DISPLAY[entityType] || entityType;

    // Build the summary HTML
    var html = '';
    html += '<div class="bella-verify" id="bella-verify-summary">';
    html += '  <div class="bella-verify__header">';
    html += '    <img src="assets/images/bella-mascot.png" alt="Bella" class="bella-verify__avatar">';
    html += '    <div>';
    html += '      <h3 class="bella-verify__title">Bella\'s Recommendation</h3>';
    html += '      <p class="bella-verify__subtitle">I filled everything out based on your business idea. Review and edit anything below, then generate your roadmap.</p>';
    html += '    </div>';
    html += '  </div>';

    // Summary cards
    html += '  <div class="bella-verify__grid">';

    // Industry
    html += '    <div class="bella-verify__card">';
    html += '      <div class="bella-verify__label">Industry</div>';
    html += '      <div class="bella-verify__value">' + escHtml(industryName) + '</div>';
    html += '      <button class="bella-verify__change" onclick="bellaChangeStep(0)">Change</button>';
    html += '    </div>';

    // State
    html += '    <div class="bella-verify__card">';
    html += '      <div class="bella-verify__label">State</div>';
    html += '      <div class="bella-verify__value">' + escHtml(stateName) + '</div>';
    html += '      <button class="bella-verify__change" onclick="bellaChangeStep(1)">Change</button>';
    html += '    </div>';

    // Entity
    html += '    <div class="bella-verify__card">';
    html += '      <div class="bella-verify__label">Business Structure</div>';
    html += '      <div class="bella-verify__value">' + escHtml(entityName) + '</div>';
    if (entitySuggestion.reason) {
      html += '      <div class="bella-verify__reason">' + escHtml(entitySuggestion.reason) + '</div>';
    }
    html += '      <button class="bella-verify__change" onclick="bellaChangeStep(2)">Change</button>';
    html += '    </div>';

    // Description
    html += '    <div class="bella-verify__card bella-verify__card--wide">';
    html += '      <div class="bella-verify__label">Your Business Idea</div>';
    html += '      <div class="bella-verify__value bella-verify__value--desc">' + escHtml(description) + '</div>';
    html += '    </div>';

    html += '  </div>'; // end grid
    html += '</div>'; // end bella-verify

    // Insert at the top of Step 3, after the title/subtitle
    var subtitle = step3.querySelector('.wizard__subtitle');
    if (subtitle) {
      subtitle.insertAdjacentHTML('afterend', html);
    } else {
      step3.insertAdjacentHTML('afterbegin', html);
    }

    // Update the step 3 title to reflect verification mode
    var title = step3.querySelector('.wizard__title');
    if (title) title.textContent = 'Review and Confirm';
    var sub = step3.querySelector('.wizard__subtitle');
    if (sub) sub.textContent = 'Bella pre-filled your details. Edit anything below, then generate your roadmap.';
  }

  /**
   * Navigate back to a specific step when user clicks "Change" on the verification card.
   */
  window.bellaChangeStep = function(step) {
    if (typeof window.goToStep === 'function') {
      window.goToStep(step);
    }
  };

  /**
   * Simple HTML escaper.
   */
  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ═══ HOOK INTO WIZARD NAVIGATION ═════════════════════════════

  /**
   * Override the wizard's nextStep to intercept the state->entity transition.
   * If Bella has recommendations, skip entity selection and jump to verification.
   */
  function hookNextStep() {
    // Store the original nextStep
    var originalNextStep = window.nextStep;

    window.nextStep = function() {
      // If we're on Step 1 (state) and Bella can smart-fill, do it
      if (window.currentStep === 1 && canSmartFill()) {
        doSmartFill();
        return;
      }

      // Otherwise, use the original flow
      if (typeof originalNextStep === 'function') {
        originalNextStep();
      }
    };

    // Expose goToStep, selectEntity, and STATES globally if not already
    // (they should be, but ensure the smart-fill can access them)
  }

  // ═══ PRE-FILL INTEGRATION ════════════════════════════════════

  /**
   * Pre-fill the business description field in Step 3
   * when user arrives there (if Bella captured a description).
   */
  function watchForDescriptionField() {
    var observer = new MutationObserver(function () {
      var descField = document.getElementById('biz-desc');
      if (descField && window._bellaDescription && !descField.value) {
        descField.value = window._bellaDescription;
      }
    });

    var step3 = document.getElementById('step-3');
    if (step3) {
      observer.observe(step3, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // ═══ INIT ON DOM READY ═══════════════════════════════════════

  function onReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  onReady(function () {
    // Small delay to let the wizard render the industry grid first
    setTimeout(function () {
      initBellaAdvisor();
      watchForDescriptionField();
      hookNextStep();
    }, 200);
  });

})();

