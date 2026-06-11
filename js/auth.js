/* ============================================================
   THINK! VENTURES -- Authentication System
   Handles sign up, sign in, sign out, auth state, and UI
   ============================================================ */

const Auth = {

  // ── Core Auth Functions ────────────────────────────────

  async signUp(email, password, name) {
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });

      // Create user document in Firestore
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      await db.collection('users').doc(cred.user.uid).set({
        email: email.toLowerCase(),
        name: name,
        role: isAdmin ? 'admin' : 'applicant',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, user: cred.user };
    } catch (err) {
      return { success: false, error: Auth._friendlyError(err.code) };
    }
  },

  async signIn(email, password) {
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);

      // Update last login
      await db.collection('users').doc(cred.user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, user: cred.user };
    } catch (err) {
      return { success: false, error: Auth._friendlyError(err.code) };
    }
  },

  async signOut() {
    await auth.signOut();
  },

  async getUserRole(uid) {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) return doc.data().role;
      return 'applicant';
    } catch (err) {
      console.error('[Auth] Error getting user role:', err);
      return 'applicant';
    }
  },

  async isAdmin(user) {
    if (!user) return false;
    const role = await Auth.getUserRole(user.uid);
    return role === 'admin';
  },

  onAuthChange(callback) {
    auth.onAuthStateChanged(callback);
  },

  _friendlyError(code) {
    const errors = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/network-request-failed': 'Network error. Check your connection.'
    };
    return errors[code] || 'Something went wrong. Please try again.';
  },

  // ── Auth UI ────────────────────────────────────────────

  _modalInjected: false,

  injectAuthUI() {
    if (Auth._modalInjected) return;
    Auth._modalInjected = true;

    const overlay = document.createElement('div');
    overlay.id = 'tv-auth-overlay';
    overlay.innerHTML = `
      <div class="tv-auth-modal">
        <button class="tv-auth-close" onclick="Auth.closeModal()" aria-label="Close">&times;</button>

        <div class="tv-auth-header">
          <h2 id="tv-auth-title">Sign In</h2>
          <p id="tv-auth-subtitle">Save your LaunchPad progress and access your dashboard</p>
        </div>

        <div id="tv-auth-error" class="tv-auth-error" style="display:none"></div>

        <form id="tv-auth-form" onsubmit="Auth._handleSubmit(event)">
          <div id="tv-auth-name-field" class="tv-auth-field" style="display:none">
            <label for="tv-auth-name">Full Name</label>
            <input type="text" id="tv-auth-name" placeholder="Your full name" autocomplete="name">
          </div>

          <div class="tv-auth-field">
            <label for="tv-auth-email">Email</label>
            <input type="email" id="tv-auth-email" placeholder="you@example.com" autocomplete="email" required>
          </div>

          <div class="tv-auth-field">
            <label for="tv-auth-password">Password</label>
            <input type="password" id="tv-auth-password" placeholder="Min. 6 characters" autocomplete="current-password" required>
          </div>

          <button type="submit" class="tv-auth-submit" id="tv-auth-submit-btn">
            <span id="tv-auth-submit-text">Sign In</span>
            <span id="tv-auth-submit-loading" style="display:none">
              <span class="tv-auth-spinner"></span>
            </span>
          </button>
        </form>

        <div class="tv-auth-toggle">
          <span id="tv-auth-toggle-text">Don't have an account?</span>
          <button onclick="Auth.toggleMode()" id="tv-auth-toggle-btn">Create one</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) Auth.closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Auth.closeModal();
    });
  },

  _mode: 'signin',
  _onSuccess: null,

  openModal(mode = 'signin', onSuccess = null) {
    Auth.injectAuthUI();
    Auth._mode = mode;
    Auth._onSuccess = onSuccess;
    Auth._updateModalUI();
    document.getElementById('tv-auth-overlay').classList.add('active');
    document.getElementById('tv-auth-email').focus();
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const overlay = document.getElementById('tv-auth-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      // Reset form
      document.getElementById('tv-auth-form').reset();
      document.getElementById('tv-auth-error').style.display = 'none';
    }
  },

  toggleMode() {
    Auth._mode = Auth._mode === 'signin' ? 'signup' : 'signin';
    Auth._updateModalUI();
  },

  _updateModalUI() {
    const isSignUp = Auth._mode === 'signup';
    document.getElementById('tv-auth-title').textContent = isSignUp ? 'Create Account' : 'Sign In';
    document.getElementById('tv-auth-subtitle').textContent = isSignUp
      ? 'Join Think! Ventures to save your progress'
      : 'Save your LaunchPad progress and access your dashboard';
    document.getElementById('tv-auth-name-field').style.display = isSignUp ? 'block' : 'none';
    document.getElementById('tv-auth-submit-text').textContent = isSignUp ? 'Create Account' : 'Sign In';
    document.getElementById('tv-auth-toggle-text').textContent = isSignUp
      ? 'Already have an account?'
      : "Don't have an account?";
    document.getElementById('tv-auth-toggle-btn').textContent = isSignUp ? 'Sign in' : 'Create one';
    document.getElementById('tv-auth-error').style.display = 'none';

    if (isSignUp) {
      document.getElementById('tv-auth-name').setAttribute('required', 'true');
    } else {
      document.getElementById('tv-auth-name').removeAttribute('required');
    }
  },

  async _handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('tv-auth-submit-btn');
    const errorEl = document.getElementById('tv-auth-error');

    // Show loading
    document.getElementById('tv-auth-submit-text').style.display = 'none';
    document.getElementById('tv-auth-submit-loading').style.display = 'inline-flex';
    btn.disabled = true;
    errorEl.style.display = 'none';

    const email = document.getElementById('tv-auth-email').value.trim();
    const password = document.getElementById('tv-auth-password').value;
    const name = document.getElementById('tv-auth-name').value.trim();

    let result;
    if (Auth._mode === 'signup') {
      result = await Auth.signUp(email, password, name);
    } else {
      result = await Auth.signIn(email, password);
    }

    // Reset loading
    document.getElementById('tv-auth-submit-text').style.display = 'inline';
    document.getElementById('tv-auth-submit-loading').style.display = 'none';
    btn.disabled = false;

    if (result.success) {
      Auth.closeModal();
      if (Auth._onSuccess) Auth._onSuccess(result.user);
      Auth.updateNavAuth(result.user);
    } else {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      // Shake animation
      errorEl.classList.remove('shake');
      void errorEl.offsetWidth;
      errorEl.classList.add('shake');
    }
  },

  // ── Nav Auth State ─────────────────────────────────────

  updateNavAuth(user) {
    const navAuth = document.getElementById('tv-nav-auth');
    if (!navAuth) return;

    if (user) {
      const displayName = user.displayName || user.email.split('@')[0];
      navAuth.innerHTML = `
        <span class="tv-nav-user">Hi, ${displayName}</span>
        <button class="tv-nav-auth-btn tv-nav-signout" onclick="Auth.signOut()">Sign Out</button>
      `;
    } else {
      navAuth.innerHTML = `
        <button class="tv-nav-auth-btn" onclick="Auth.openModal('signin')">Sign In</button>
      `;
    }
  },

  // ── Initialize ─────────────────────────────────────────

  init() {
    Auth.onAuthChange((user) => {
      Auth.updateNavAuth(user);
      // Dispatch custom event for other scripts to listen to
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
    });
  }
};

// Auto-initialize when script loads
Auth.init();
