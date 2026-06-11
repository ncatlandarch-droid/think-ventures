/* ============================================================
   THINK! VENTURES -- LaunchPad Save / Resume System
   Auto-saves wizard progress to Firestore and restores on
   return visits. Loaded AFTER the inline wizard script and
   AFTER Firebase + Auth scripts.
   ============================================================ */

(function () {
  'use strict';

  // ── Guard: Firebase must be available ─────────────────────
  if (typeof firebase === 'undefined' || typeof db === 'undefined' || typeof auth === 'undefined') {
    console.warn('[LaunchPad-Save] Firebase not available. Save/resume disabled.');
    return;
  }

  // ── Constants ─────────────────────────────────────────────
  var COLLECTION = 'applications';
  var DEBOUNCE_MS = 500;
  var BANNER_DISMISS_MS = 8000;
  var STEP_LABELS = ['Industry', 'Location', 'Entity', 'Details', 'Roadmap'];

  // ── Internal state ────────────────────────────────────────
  var _saveTimer = null;
  var _currentUser = null;
  var _restoredOnce = false;   // prevent double-restore
  var _bannerShown = false;
  var _loginPromptShown = false;

  // ═══════════════════════════════════════════════════════════
  //  INJECTED STYLES
  // ═══════════════════════════════════════════════════════════

  var style = document.createElement('style');
  style.textContent = [

    /* ── Welcome Back Banner ──────────────────────────────── */
    '.lp-save-banner {',
    '  position: relative;',
    '  margin-bottom: var(--sp-xl, 24px);',
    '  padding: var(--sp-lg, 16px) var(--sp-xl, 24px);',
    '  background: rgba(13, 79, 79, 0.35);',
    '  backdrop-filter: blur(16px);',
    '  -webkit-backdrop-filter: blur(16px);',
    '  border: 1px solid rgba(245, 166, 35, 0.25);',
    '  border-radius: var(--border-radius-lg, 16px);',
    '  display: flex;',
    '  align-items: center;',
    '  gap: var(--sp-lg, 16px);',
    '  animation: lpBannerSlide 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);',
    '  flex-wrap: wrap;',
    '}',

    '.lp-save-banner__icon {',
    '  width: 44px;',
    '  height: 44px;',
    '  min-width: 44px;',
    '  border-radius: 50%;',
    '  background: linear-gradient(135deg, #F5A623, #e6951e);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 22px;',
    '  flex-shrink: 0;',
    '}',

    '.lp-save-banner__body {',
    '  flex: 1;',
    '  min-width: 0;',
    '}',

    '.lp-save-banner__title {',
    '  font-family: var(--font-heading, "Outfit", sans-serif);',
    '  font-weight: 700;',
    '  font-size: var(--fs-base, 16px);',
    '  color: var(--color-white, #fff);',
    '  margin-bottom: 2px;',
    '}',

    '.lp-save-banner__sub {',
    '  font-size: var(--fs-sm, 14px);',
    '  color: var(--color-text-muted, #94A3B8);',
    '  line-height: 1.4;',
    '}',

    '.lp-save-banner__actions {',
    '  display: flex;',
    '  gap: var(--sp-sm, 8px);',
    '  flex-shrink: 0;',
    '}',

    '.lp-save-banner__btn {',
    '  padding: 8px 18px;',
    '  border-radius: var(--border-radius-sm, 8px);',
    '  font-family: var(--font-heading, "Outfit", sans-serif);',
    '  font-weight: 700;',
    '  font-size: var(--fs-sm, 14px);',
    '  border: none;',
    '  cursor: pointer;',
    '  transition: transform 0.2s, box-shadow 0.2s;',
    '}',

    '.lp-save-banner__btn:hover {',
    '  transform: translateY(-2px);',
    '}',

    '.lp-save-banner__btn--continue {',
    '  background: linear-gradient(135deg, #F5A623, #e6951e);',
    '  color: #070F1A;',
    '}',

    '.lp-save-banner__btn--continue:hover {',
    '  box-shadow: 0 4px 16px rgba(245, 166, 35, 0.4);',
    '}',

    '.lp-save-banner__btn--reset {',
    '  background: rgba(255, 255, 255, 0.08);',
    '  color: var(--color-text-muted, #94A3B8);',
    '  border: 1px solid rgba(255, 255, 255, 0.12);',
    '}',

    '.lp-save-banner__btn--reset:hover {',
    '  background: rgba(255, 255, 255, 0.12);',
    '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);',
    '}',

    '.lp-save-banner__close {',
    '  position: absolute;',
    '  top: 8px;',
    '  right: 12px;',
    '  background: none;',
    '  border: none;',
    '  color: var(--color-text-muted, #94A3B8);',
    '  font-size: 18px;',
    '  cursor: pointer;',
    '  opacity: 0.6;',
    '  transition: opacity 0.2s;',
    '  line-height: 1;',
    '}',

    '.lp-save-banner__close:hover { opacity: 1; }',

    /* ── Fade-out class ─────────────────────────────────────── */
    '.lp-save-banner--out {',
    '  animation: lpBannerFadeOut 0.4s ease forwards;',
    '}',

    '@keyframes lpBannerSlide {',
    '  from { opacity: 0; transform: translateY(-16px); }',
    '  to   { opacity: 1; transform: translateY(0); }',
    '}',

    '@keyframes lpBannerFadeOut {',
    '  from { opacity: 1; max-height: 200px; margin-bottom: var(--sp-xl, 24px); }',
    '  to   { opacity: 0; max-height: 0; margin-bottom: 0; padding: 0; overflow: hidden; }',
    '}',

    /* ── Login Prompt ──────────────────────────────────────── */
    '.lp-login-prompt {',
    '  margin-top: var(--sp-xl, 24px);',
    '  padding: var(--sp-lg, 16px) var(--sp-xl, 24px);',
    '  background: rgba(16, 185, 129, 0.08);',
    '  backdrop-filter: blur(12px);',
    '  -webkit-backdrop-filter: blur(12px);',
    '  border: 1px solid rgba(16, 185, 129, 0.2);',
    '  border-radius: var(--border-radius-md, 12px);',
    '  display: flex;',
    '  align-items: center;',
    '  gap: var(--sp-lg, 16px);',
    '  animation: lpBannerSlide 0.4s ease;',
    '  flex-wrap: wrap;',
    '}',

    '.lp-login-prompt__icon {',
    '  width: 36px;',
    '  height: 36px;',
    '  min-width: 36px;',
    '  border-radius: 50%;',
    '  background: rgba(16, 185, 129, 0.15);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  flex-shrink: 0;',
    '}',

    '.lp-login-prompt__icon svg {',
    '  width: 18px;',
    '  height: 18px;',
    '  color: #10B981;',
    '}',

    '.lp-login-prompt__text {',
    '  flex: 1;',
    '  font-size: var(--fs-sm, 14px);',
    '  color: var(--color-text-muted, #94A3B8);',
    '  line-height: 1.5;',
    '}',

    '.lp-login-prompt__btn {',
    '  padding: 8px 16px;',
    '  border-radius: var(--border-radius-sm, 8px);',
    '  background: linear-gradient(135deg, #10B981, #0D4F4F);',
    '  color: #fff;',
    '  font-family: var(--font-heading, "Outfit", sans-serif);',
    '  font-weight: 700;',
    '  font-size: var(--fs-sm, 14px);',
    '  border: none;',
    '  cursor: pointer;',
    '  transition: transform 0.2s, box-shadow 0.2s;',
    '  flex-shrink: 0;',
    '}',

    '.lp-login-prompt__btn:hover {',
    '  transform: translateY(-2px);',
    '  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);',
    '}',

    '.lp-login-prompt__dismiss {',
    '  background: none;',
    '  border: none;',
    '  color: var(--color-text-muted, #94A3B8);',
    '  font-size: 16px;',
    '  cursor: pointer;',
    '  opacity: 0.5;',
    '  transition: opacity 0.2s;',
    '  padding: 4px;',
    '  line-height: 1;',
    '}',

    '.lp-login-prompt__dismiss:hover { opacity: 1; }',

    /* ── Responsive ───────────────────────────────────────── */
    '@media (max-width: 768px) {',
    '  .lp-save-banner { flex-direction: column; text-align: center; }',
    '  .lp-save-banner__actions { width: 100%; justify-content: center; }',
    '  .lp-login-prompt { flex-direction: column; text-align: center; }',
    '}',

    /* ── Print: hide save UI ──────────────────────────────── */
    '@media print {',
    '  .lp-save-banner, .lp-login-prompt { display: none !important; }',
    '}'

  ].join('\n');

  document.head.appendChild(style);

  // ═══════════════════════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════════════════════

  /**
   * Collect the current wizard state into a plain object
   * suitable for Firestore. Reads from the global `selections`
   * object and the gamification engine.
   */
  function collectState() {
    var bizNameEl = document.getElementById('biz-name');
    var bizDescEl = document.getElementById('biz-desc');

    var data = {
      currentStep:      typeof currentStep !== 'undefined' ? currentStep : 0,
      selectedIndustry: (typeof selections !== 'undefined' && selections.industry) || null,
      selectedState:    (typeof selections !== 'undefined' && selections.state) || null,
      selectedEntity:   (typeof selections !== 'undefined' && selections.entity) || null,
      businessName:     bizNameEl ? bizNameEl.value : '',
      businessDesc:     bizDescEl ? bizDescEl.value : '',
      xp:               window.gamification ? window.gamification.getXP() : 0,
      badges:           window.gamification ? window.gamification.getBadges() : [],
      status:           (typeof currentStep !== 'undefined' && currentStep >= 4) ? 'completed' : 'in-progress',
      lastUpdated:      firebase.firestore.FieldValue.serverTimestamp()
    };

    // Attach user metadata for admin visibility
    if (_currentUser) {
      data.userName  = _currentUser.displayName || '';
      data.userEmail = _currentUser.email || '';
    }

    return data;
  }

  // ═══════════════════════════════════════════════════════════
  //  SAVE (debounced)
  // ═══════════════════════════════════════════════════════════

  function scheduleSave() {
    if (!_currentUser) return;
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(doSave, DEBOUNCE_MS);
  }

  function doSave() {
    if (!_currentUser) return;

    var data = collectState();

    db.collection(COLLECTION)
      .doc(_currentUser.uid)
      .set(data, { merge: true })
      .then(function () {
        console.log('[LaunchPad-Save] Progress saved.');
      })
      .catch(function (err) {
        // Firestore unavailable or permission error -- fail silently
        console.warn('[LaunchPad-Save] Save failed:', err.message || err);
      });
  }

  /**
   * First-time save includes a createdAt timestamp that should
   * not be overwritten on subsequent saves.
   */
  function ensureCreatedAt() {
    if (!_currentUser) return;

    db.collection(COLLECTION)
      .doc(_currentUser.uid)
      .get()
      .then(function (doc) {
        if (!doc.exists) {
          // Write the seed document with createdAt
          return db.collection(COLLECTION).doc(_currentUser.uid).set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      })
      .catch(function (err) {
        console.warn('[LaunchPad-Save] createdAt check failed:', err.message || err);
      });
  }

  // ═══════════════════════════════════════════════════════════
  //  RESTORE
  // ═══════════════════════════════════════════════════════════

  function restore() {
    if (!_currentUser || _restoredOnce) return;
    _restoredOnce = true;

    db.collection(COLLECTION)
      .doc(_currentUser.uid)
      .get()
      .then(function (doc) {
        if (!doc.exists) return;

        var d = doc.data();
        var savedStep = typeof d.currentStep === 'number' ? d.currentStep : 0;

        // Nothing to restore if they never passed step 0
        if (savedStep === 0 && !d.selectedIndustry) return;

        // ── Re-select option cards ──────────────────────────
        if (d.selectedIndustry && typeof selectIndustry === 'function') {
          try { selectIndustry(d.selectedIndustry); } catch (_) {}
        }
        if (d.selectedState && typeof selectState === 'function') {
          try { selectState(d.selectedState); } catch (_) {}
        }
        if (d.selectedEntity && typeof selectEntity === 'function') {
          try { selectEntity(d.selectedEntity); } catch (_) {}
        }

        // ── Restore form values ─────────────────────────────
        var bizNameEl = document.getElementById('biz-name');
        var bizDescEl = document.getElementById('biz-desc');
        if (bizNameEl && d.businessName) bizNameEl.value = d.businessName;
        if (bizDescEl && d.businessDesc) bizDescEl.value = d.businessDesc;

        // ── If they reached the roadmap step, regenerate it ─
        if (savedStep >= 4 && d.selectedIndustry && d.selectedState && d.selectedEntity) {
          // Populate selections so generateRoadmap() works
          if (typeof selections !== 'undefined') {
            selections.industry = d.selectedIndustry;
            selections.state    = d.selectedState;
            selections.entity   = d.selectedEntity;
            selections.name     = d.businessName || '';
            selections.desc     = d.businessDesc || '';
          }
          if (typeof generateRoadmap === 'function') {
            try { generateRoadmap(); } catch (_) {}
          }
        } else if (savedStep > 0) {
          // Jump to saved step (below roadmap)
          if (typeof goToStep === 'function') {
            try { goToStep(savedStep); } catch (_) {}
          }
        }

        // ── Show welcome back banner ────────────────────────
        showBanner(
          _currentUser.displayName || _currentUser.email.split('@')[0],
          savedStep
        );
      })
      .catch(function (err) {
        console.warn('[LaunchPad-Save] Restore failed:', err.message || err);
      });
  }

  // ═══════════════════════════════════════════════════════════
  //  WELCOME BACK BANNER
  // ═══════════════════════════════════════════════════════════

  function showBanner(name, savedStep) {
    if (_bannerShown) return;
    _bannerShown = true;

    var stepLabel = STEP_LABELS[savedStep] || ('Step ' + (savedStep + 1));

    var banner = document.createElement('div');
    banner.className = 'lp-save-banner';
    banner.id = 'lp-save-banner';
    banner.innerHTML = [
      '<div class="lp-save-banner__icon" aria-hidden="true">&#128075;</div>',
      '<div class="lp-save-banner__body">',
      '  <div class="lp-save-banner__title">Welcome back, ' + escHtml(name) + '!</div>',
      '  <div class="lp-save-banner__sub">You were on step ' + (savedStep + 1) + ' (' + stepLabel + '). Pick up where you left off?</div>',
      '</div>',
      '<div class="lp-save-banner__actions">',
      '  <button class="lp-save-banner__btn lp-save-banner__btn--continue" id="lp-save-continue">Continue</button>',
      '  <button class="lp-save-banner__btn lp-save-banner__btn--reset" id="lp-save-reset">Start Over</button>',
      '</div>',
      '<button class="lp-save-banner__close" id="lp-save-close" aria-label="Dismiss">&times;</button>'
    ].join('');

    // Insert at the top of the wizard center panel
    var center = document.querySelector('.lp-center');
    if (center && center.firstChild) {
      center.insertBefore(banner, center.firstChild);
    } else if (center) {
      center.appendChild(banner);
    }

    // ── Button handlers ─────────────────────────────────────
    document.getElementById('lp-save-continue').addEventListener('click', function () {
      dismissBanner();
    });

    document.getElementById('lp-save-reset').addEventListener('click', function () {
      dismissBanner();
      // Clear Firestore doc
      if (_currentUser) {
        db.collection(COLLECTION).doc(_currentUser.uid).delete().catch(function () {});
      }
      // Reset gamification
      if (window.gamification && typeof window.gamification.reset === 'function') {
        window.gamification.reset();
      }
      // Reset wizard
      if (typeof startOver === 'function') startOver();
    });

    document.getElementById('lp-save-close').addEventListener('click', function () {
      dismissBanner();
    });

    // Auto-dismiss after 8 seconds
    setTimeout(function () {
      dismissBanner();
    }, BANNER_DISMISS_MS);
  }

  function dismissBanner() {
    var banner = document.getElementById('lp-save-banner');
    if (!banner) return;
    banner.classList.add('lp-save-banner--out');
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 450);
  }

  // ═══════════════════════════════════════════════════════════
  //  LOGIN PROMPT (after step 2 if not signed in)
  // ═══════════════════════════════════════════════════════════

  function showLoginPrompt() {
    if (_loginPromptShown || _currentUser) return;
    _loginPromptShown = true;

    var step2 = document.getElementById('step-2');
    if (!step2) return;

    var prompt = document.createElement('div');
    prompt.className = 'lp-login-prompt';
    prompt.id = 'lp-login-prompt';
    prompt.innerHTML = [
      '<div class="lp-login-prompt__icon" aria-hidden="true">',
      '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '    <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/>',
      '    <circle cx="12" cy="7" r="4"/>',
      '  </svg>',
      '</div>',
      '<div class="lp-login-prompt__text">Want to save your progress? Sign in to pick up where you left off anytime.</div>',
      '<button class="lp-login-prompt__btn" id="lp-login-prompt-btn">Sign In</button>',
      '<button class="lp-login-prompt__dismiss" id="lp-login-prompt-dismiss" aria-label="Dismiss">&times;</button>'
    ].join('');

    // Insert after the navigation buttons inside step 2
    var nav = step2.querySelector('.wizard__nav');
    if (nav) {
      nav.parentNode.insertBefore(prompt, nav);
    } else {
      step2.appendChild(prompt);
    }

    document.getElementById('lp-login-prompt-btn').addEventListener('click', function () {
      if (typeof Auth !== 'undefined' && Auth.openModal) {
        Auth.openModal('signup');
      }
    });

    document.getElementById('lp-login-prompt-dismiss').addEventListener('click', function () {
      removeLoginPrompt();
    });
  }

  function removeLoginPrompt() {
    var el = document.getElementById('lp-login-prompt');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // ═══════════════════════════════════════════════════════════
  //  HOOK: Wrap goToStep()
  // ═══════════════════════════════════════════════════════════

  if (typeof goToStep === 'function') {
    var _origGoToStep = goToStep;

    // Reassign the global goToStep
    window.goToStep = function (step) {
      _origGoToStep(step);
      scheduleSave();

      // Show login prompt when arriving at step 2 (Entity) while signed out
      if (step === 2 && !_currentUser) {
        showLoginPrompt();
      }
    };

    // Also reassign locally-scoped references in nextStep / prevStep
    // They call goToStep internally, which now points to the wrapped version.
  }

  // ═══════════════════════════════════════════════════════════
  //  HOOK: Wrap generateRoadmap()
  // ═══════════════════════════════════════════════════════════

  if (typeof generateRoadmap === 'function') {
    var _origGenerateRoadmap = generateRoadmap;

    window.generateRoadmap = function () {
      _origGenerateRoadmap();
      scheduleSave();
    };
  }

  // ═══════════════════════════════════════════════════════════
  //  HOOK: Form input changes (biz-name, biz-desc)
  // ═══════════════════════════════════════════════════════════

  var bizNameEl = document.getElementById('biz-name');
  var bizDescEl = document.getElementById('biz-desc');

  if (bizNameEl) {
    bizNameEl.addEventListener('input', function () {
      // Keep the selections object in sync
      if (typeof selections !== 'undefined') selections.name = bizNameEl.value;
      scheduleSave();
    });
  }

  if (bizDescEl) {
    bizDescEl.addEventListener('input', function () {
      if (typeof selections !== 'undefined') selections.desc = bizDescEl.value;
      scheduleSave();
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  HOOK: Option card clicks (event delegation)
  //  Covers selectIndustry / selectState / selectEntity which
  //  are already wrapped by goToStep, but the selection itself
  //  happens before goToStep is called. We catch these via
  //  click delegation on the option grids.
  // ═══════════════════════════════════════════════════════════

  document.addEventListener('click', function (e) {
    var card = e.target.closest('.option-card[data-industry], .option-card[data-state], .option-card[data-entity]');
    if (card) {
      // Small delay to let the selection function finish setting state
      setTimeout(scheduleSave, 50);
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  AUTH STATE LISTENER
  // ═══════════════════════════════════════════════════════════

  window.addEventListener('authStateChanged', function (e) {
    var user = e.detail ? e.detail.user : null;

    if (user) {
      _currentUser = user;
      ensureCreatedAt();
      restore();
      removeLoginPrompt();
      // Trigger an immediate save so current in-progress state is captured
      scheduleSave();
    } else {
      // User signed out
      _currentUser = null;
      _restoredOnce = false;
      _bannerShown = false;
      dismissBanner();
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  FALLBACK: If auth state already resolved before this
  //  script loaded, check auth.currentUser directly.
  // ═══════════════════════════════════════════════════════════

  if (auth.currentUser) {
    _currentUser = auth.currentUser;
    ensureCreatedAt();
    restore();
  }

  // ═══════════════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════════════

  function escHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  console.log('[LaunchPad-Save] Save/resume system loaded.');

})();
