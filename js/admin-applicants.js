// ═══════════════════════════════════════════════════════════════════════
// Think! Ventures -- Admin Applicant Dashboard
// Loads all applicant data from Firestore 'applications' collection
// and renders it in the accounting dashboard.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // -- Guard: Firebase must be loaded
  if (typeof firebase === 'undefined' || typeof db === 'undefined') {
    console.warn('[Admin Applicants] Firebase not available, skipping.');
    return;
  }

  // -- Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    /* ── Applicant Panel ── */
    .applicant-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--sp-md);
      margin-bottom: var(--sp-xl);
    }
    .applicant-stat {
      padding: var(--sp-lg);
      background: rgba(7, 15, 26, 0.5);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      text-align: center;
    }
    .applicant-stat__value {
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: var(--fs-2xl);
      line-height: 1.2;
    }
    .applicant-stat__value--total { color: var(--color-white); }
    .applicant-stat__value--active { color: var(--color-secondary); }
    .applicant-stat__value--complete { color: var(--color-accent); }
    .applicant-stat__label {
      font-size: var(--fs-xs);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: var(--sp-xs);
    }

    /* ── Applicant Table ── */
    .applicant-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--fs-sm);
    }
    .applicant-table thead th {
      text-align: left;
      padding: var(--sp-sm) var(--sp-md);
      font-weight: 600;
      font-size: var(--fs-xs);
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-text-muted);
      border-bottom: 1px solid var(--color-border);
      white-space: nowrap;
    }
    .applicant-table tbody td {
      padding: var(--sp-sm) var(--sp-md);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--color-text);
      vertical-align: middle;
    }
    .applicant-table tbody tr:hover {
      background: rgba(16, 185, 129, 0.04);
    }
    .applicant-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .applicant-badge--active {
      background: rgba(245, 166, 35, 0.15);
      color: #F5A623;
    }
    .applicant-badge--complete {
      background: rgba(16, 185, 129, 0.15);
      color: #10B981;
    }
    .applicant-badge--new {
      background: rgba(99, 179, 237, 0.15);
      color: #63B3ED;
    }
    .applicant-empty {
      text-align: center;
      padding: var(--sp-3xl);
      color: var(--color-text-muted);
      font-size: var(--fs-sm);
    }
    .applicant-refresh {
      background: none;
      border: 1px solid var(--color-border);
      color: var(--color-text-muted);
      padding: var(--sp-xs) var(--sp-md);
      border-radius: var(--border-radius-sm);
      font-size: var(--fs-xs);
      cursor: pointer;
      transition: var(--transition-fast);
      margin-left: auto;
    }
    .applicant-refresh:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
    .applicant-search {
      width: 100%;
      max-width: 300px;
      padding: var(--sp-sm) var(--sp-md);
      background: rgba(7, 15, 26, 0.6);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      color: var(--color-text);
      font-family: var(--font-body);
      font-size: var(--fs-sm);
      outline: none;
      transition: var(--transition-fast);
      margin-bottom: var(--sp-lg);
    }
    .applicant-search:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    .applicant-table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    @media print {
      .applicant-panel { break-inside: avoid; }
    }
  `;
  document.head.appendChild(style);

  // -- Step labels
  const STEP_LABELS = ['Industry', 'Location', 'Entity', 'Details', 'Roadmap'];

  // -- Build panel HTML
  function buildPanel() {
    const target = document.getElementById('filingSection');
    if (!target) return;

    const panel = document.createElement('div');
    panel.className = 'panel dash-reveal applicant-panel';
    panel.id = 'applicantSection';
    panel.innerHTML = `
      <h2 class="panel__title" style="display: flex; align-items: center; gap: var(--sp-sm);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        LaunchPad Applicants
        <button class="applicant-refresh" onclick="AdminApplicants.refresh()" title="Refresh data">Refresh</button>
      </h2>

      <div class="applicant-stats" id="applicantStats">
        <div class="applicant-stat">
          <div class="applicant-stat__value applicant-stat__value--total" id="statTotal">--</div>
          <div class="applicant-stat__label">Total</div>
        </div>
        <div class="applicant-stat">
          <div class="applicant-stat__value applicant-stat__value--active" id="statActive">--</div>
          <div class="applicant-stat__label">In Progress</div>
        </div>
        <div class="applicant-stat">
          <div class="applicant-stat__value applicant-stat__value--complete" id="statComplete">--</div>
          <div class="applicant-stat__label">Completed</div>
        </div>
      </div>

      <input type="text" class="applicant-search" id="applicantSearch" placeholder="Search by name, email, or business..." oninput="AdminApplicants.filter(this.value)">

      <div class="applicant-table-wrap">
        <table class="applicant-table" id="applicantTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Business</th>
              <th>Industry</th>
              <th>State</th>
              <th>Entity</th>
              <th>Step</th>
              <th>Status</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody id="applicantBody">
            <tr><td colspan="9" class="applicant-empty">Loading applicant data...</td></tr>
          </tbody>
        </table>
      </div>
    `;

    target.parentNode.insertBefore(panel, target.nextSibling);
  }

  // -- Fetch and render applicants
  let allApplicants = [];

  function fetchApplicants() {
    db.collection('applications')
      .orderBy('lastUpdated', 'desc')
      .get()
      .then(function (snapshot) {
        allApplicants = [];
        snapshot.forEach(function (doc) {
          allApplicants.push({ id: doc.id, ...doc.data() });
        });
        renderApplicants(allApplicants);
        updateStats(allApplicants);
      })
      .catch(function (err) {
        console.warn('[Admin Applicants] Fetch error:', err);
        const body = document.getElementById('applicantBody');
        if (body) {
          body.innerHTML = '<tr><td colspan="9" class="applicant-empty">Unable to load applicant data.</td></tr>';
        }
      });
  }

  function updateStats(applicants) {
    const total = applicants.length;
    const active = applicants.filter(function (a) { return a.status === 'in-progress'; }).length;
    const complete = applicants.filter(function (a) { return a.status === 'completed'; }).length;

    const el = function (id, val) {
      var e = document.getElementById(id);
      if (e) e.textContent = val;
    };
    el('statTotal', total);
    el('statActive', active);
    el('statComplete', complete);
  }

  function renderApplicants(applicants) {
    const body = document.getElementById('applicantBody');
    if (!body) return;

    if (applicants.length === 0) {
      body.innerHTML = '<tr><td colspan="9" class="applicant-empty">No applicants yet. When someone uses the LaunchPad, they will appear here.</td></tr>';
      return;
    }

    body.innerHTML = applicants.map(function (a) {
      var step = typeof a.currentStep === 'number' ? a.currentStep : 0;
      var stepLabel = STEP_LABELS[step] || 'Unknown';
      var statusClass = a.status === 'completed' ? 'complete' : 'active';
      var statusLabel = a.status === 'completed' ? 'Complete' : 'In Progress';

      // If they just signed up but haven't done anything, mark as New
      if (step === 0 && !a.selectedIndustry) {
        statusClass = 'new';
        statusLabel = 'New';
      }

      var lastActive = '--';
      if (a.lastUpdated) {
        var d = a.lastUpdated.toDate ? a.lastUpdated.toDate() : new Date(a.lastUpdated);
        lastActive = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      var industry = a.selectedIndustry || '--';
      // Clean up industry slug to readable text
      industry = industry.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });

      return '<tr>' +
        '<td>' + escHtml(a.userName || '--') + '</td>' +
        '<td>' + escHtml(a.userEmail || '--') + '</td>' +
        '<td>' + escHtml(a.businessName || '--') + '</td>' +
        '<td>' + escHtml(industry) + '</td>' +
        '<td>' + escHtml(a.selectedState || '--') + '</td>' +
        '<td>' + escHtml(a.selectedEntity || '--') + '</td>' +
        '<td>' + (step + 1) + '/5 (' + stepLabel + ')</td>' +
        '<td><span class="applicant-badge applicant-badge--' + statusClass + '">' + statusLabel + '</span></td>' +
        '<td>' + lastActive + '</td>' +
        '</tr>';
    }).join('');
  }

  function filterApplicants(query) {
    if (!query) {
      renderApplicants(allApplicants);
      return;
    }
    var q = query.toLowerCase();
    var filtered = allApplicants.filter(function (a) {
      return (a.userName || '').toLowerCase().indexOf(q) !== -1 ||
        (a.userEmail || '').toLowerCase().indexOf(q) !== -1 ||
        (a.businessName || '').toLowerCase().indexOf(q) !== -1 ||
        (a.selectedIndustry || '').toLowerCase().indexOf(q) !== -1 ||
        (a.selectedState || '').toLowerCase().indexOf(q) !== -1;
    });
    renderApplicants(filtered);
  }

  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // -- Public API
  window.AdminApplicants = {
    refresh: fetchApplicants,
    filter: filterApplicants
  };

  // -- Init: wait for dashboard to be visible
  function init() {
    buildPanel();
    fetchApplicants();
  }

  // Wait for DOMContentLoaded + a small delay (dashboard gate must open first)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(init, 1000);
    });
  } else {
    setTimeout(init, 1000);
  }
})();
