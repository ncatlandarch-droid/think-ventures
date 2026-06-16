/* ============================================================
   THINK! VENTURES -- Financial Dashboard Module
   Comprehensive financial tracking, AI coaching via Bella,
   industry benchmarks, health scoring, and give-back calculator.
   Builds all UI dynamically into #finance-section.
   ============================================================ */

(function () {
  'use strict';

  // ── Guard: Firebase must be available ─────────────────────
  if (typeof firebase === 'undefined' || typeof db === 'undefined' || typeof auth === 'undefined') {
    console.warn('[Finance] Firebase not available.');
    return;
  }

  // ── Industry-Specific Expense Categories ──────────────────
  var EXPENSE_CATEGORIES = {
    'home-services': ['Supplies & Materials', 'Equipment & Tools', 'Vehicle & Gas', 'Insurance', 'Marketing', 'Licensing & Permits', 'Subcontractors', 'Other'],
    'construction': ['Materials', 'Equipment Rental', 'Subcontractors', 'Insurance & Bonding', 'Vehicle & Gas', 'Permits', 'Marketing', 'Other'],
    'food-beverage': ['Ingredients & Supplies', 'Equipment', 'Packaging', 'Rent & Utilities', 'Health Permits', 'Marketing', 'Staff', 'Other'],
    'health-beauty': ['Products & Supplies', 'Equipment', 'Rent & Utilities', 'Insurance', 'Licensing', 'Marketing', 'Staff', 'Other'],
    'professional': ['Software & Tools', 'Office Expenses', 'Marketing', 'Insurance', 'Licensing', 'Subcontractors', 'Travel', 'Other'],
    'retail': ['Inventory & COGS', 'Shipping & Packaging', 'Platform Fees', 'Marketing', 'Rent & Utilities', 'Insurance', 'Other'],
    'creative': ['Equipment & Software', 'Props & Materials', 'Studio/Office', 'Marketing', 'Insurance', 'Subcontractors', 'Other'],
    'tech': ['Cloud & Hosting', 'Software & Licenses', 'Equipment', 'Marketing', 'Insurance', 'Contractors', 'Other'],
    'education': ['Materials & Curriculum', 'Space Rental', 'Equipment', 'Marketing', 'Insurance', 'Licensing', 'Staff', 'Other']
  };

  var REVENUE_CATEGORIES = ['Services', 'Products', 'Contracts', 'Consulting', 'Tips & Gratuity', 'Other Revenue'];

  // ── Industry Benchmarks ───────────────────────────────────
  var INDUSTRY_BENCHMARKS = {
    'home-services': { avgMargin: 25, goodMargin: 35, supplyRatio: 22 },
    'construction': { avgMargin: 15, goodMargin: 25, supplyRatio: 40 },
    'food-beverage': { avgMargin: 10, goodMargin: 20, supplyRatio: 35 },
    'health-beauty': { avgMargin: 20, goodMargin: 30, supplyRatio: 15 },
    'professional': { avgMargin: 35, goodMargin: 50, supplyRatio: 10 },
    'retail': { avgMargin: 20, goodMargin: 30, supplyRatio: 50 },
    'creative': { avgMargin: 30, goodMargin: 45, supplyRatio: 15 },
    'tech': { avgMargin: 40, goodMargin: 55, supplyRatio: 20 },
    'education': { avgMargin: 25, goodMargin: 40, supplyRatio: 20 }
  };

  // ── State ─────────────────────────────────────────────────
  var _uid = null;
  var _industry = 'professional';
  var _financeData = null;
  var _filterType = 'all';
  var _initialized = false;

  // ── Helpers ───────────────────────────────────────────────
  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatCurrency(amount) {
    var num = parseFloat(amount) || 0;
    var sign = num < 0 ? '-' : '';
    var abs = Math.abs(num);
    if (abs >= 1000) {
      return sign + '$' + abs.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return sign + '$' + abs.toFixed(2);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function generateId() {
    return 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
  }

  function todayStr() {
    var d = new Date();
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function monthKey(dateStr) {
    return dateStr ? dateStr.substring(0, 7) : '';
  }

  function timeAgo(isoStr) {
    if (!isoStr) return '';
    var now = Date.now();
    var then = new Date(isoStr).getTime();
    var diff = now - then;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' minute' + (mins === 1 ? '' : 's') + ' ago';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
    var days = Math.floor(hours / 24);
    return days + ' day' + (days === 1 ? '' : 's') + ' ago';
  }

  // ── Toast Notification ────────────────────────────────────
  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'fin-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add('fin-toast--visible'); }, 10);
    setTimeout(function () {
      toast.classList.remove('fin-toast--visible');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  // ── Data Grouping ─────────────────────────────────────────
  function getTransactions() {
    return (_financeData && _financeData.transactions) ? _financeData.transactions : [];
  }

  function groupByMonth(transactions) {
    var map = {};
    for (var i = 0; i < transactions.length; i++) {
      var tx = transactions[i];
      var mk = monthKey(tx.date);
      if (!mk) continue;
      if (!map[mk]) {
        map[mk] = { month: mk, revenue: 0, expenses: 0, transactions: [] };
      }
      if (tx.type === 'revenue') {
        map[mk].revenue += (parseFloat(tx.amount) || 0);
      } else {
        map[mk].expenses += (parseFloat(tx.amount) || 0);
      }
      map[mk].transactions.push(tx);
    }
    var keys = Object.keys(map).sort();
    var arr = [];
    for (var j = 0; j < keys.length; j++) {
      arr.push(map[keys[j]]);
    }
    return arr;
  }

  function getCurrentMonthTransactions() {
    var mk = todayStr().substring(0, 7);
    var txns = getTransactions();
    var result = [];
    for (var i = 0; i < txns.length; i++) {
      if (monthKey(txns[i].date) === mk) {
        result.push(txns[i]);
      }
    }
    return result;
  }

  function computeTotals(transactions) {
    var revenue = 0;
    var expenses = 0;
    for (var i = 0; i < transactions.length; i++) {
      var tx = transactions[i];
      var amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'revenue') {
        revenue += amt;
      } else {
        expenses += amt;
      }
    }
    return { revenue: revenue, expenses: expenses, net: revenue - expenses };
  }

  // ── Health Score ──────────────────────────────────────────
  function calculateAvgMargin(months) {
    if (!months.length) return 0;
    var totalMargin = 0;
    for (var i = 0; i < months.length; i++) {
      var m = months[i];
      if (m.revenue > 0) {
        totalMargin += ((m.revenue - m.expenses) / m.revenue) * 100;
      }
    }
    return totalMargin / months.length;
  }

  function calculateRevenueVariance(months) {
    if (months.length < 2) return 0;
    var revs = [];
    for (var i = 0; i < months.length; i++) {
      revs.push(months[i].revenue);
    }
    var avg = 0;
    for (var j = 0; j < revs.length; j++) avg += revs[j];
    avg = avg / revs.length;
    if (avg === 0) return 100;
    var variance = 0;
    for (var k = 0; k < revs.length; k++) {
      variance += Math.pow(revs[k] - avg, 2);
    }
    variance = Math.sqrt(variance / revs.length);
    return (variance / avg) * 100;
  }

  function calculateExpenseRatio(months) {
    var totalRev = 0;
    var totalExp = 0;
    for (var i = 0; i < months.length; i++) {
      totalRev += months[i].revenue;
      totalExp += months[i].expenses;
    }
    if (totalRev === 0) return 100;
    return (totalExp / totalRev) * 100;
  }

  function calculateLoggingConsistency(transactions) {
    if (!transactions.length) return 0;
    var months = groupByMonth(transactions);
    if (months.length === 0) return 0;
    // Check how many of the last 3 calendar months have any transactions
    var now = new Date();
    var checked = 0;
    var found = 0;
    for (var offset = 0; offset < 3; offset++) {
      var d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      var mk = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
      checked++;
      for (var j = 0; j < months.length; j++) {
        if (months[j].month === mk) {
          found++;
          break;
        }
      }
    }
    return checked > 0 ? found / checked : 0;
  }

  function calculateHealthScore(transactions, industry) {
    var benchmark = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['professional'];
    var score = 0;

    var months = groupByMonth(transactions);
    var recentMonths = months.slice(-3);

    if (recentMonths.length === 0) return 0;

    // 1. Profit Margin (40 points)
    var avgMargin = calculateAvgMargin(recentMonths);
    if (avgMargin >= benchmark.goodMargin) score += 40;
    else if (avgMargin >= benchmark.avgMargin) score += 30;
    else if (avgMargin >= 0) score += 15;

    // 2. Revenue Consistency (20 points)
    var variance = calculateRevenueVariance(recentMonths);
    if (variance < 15) score += 20;
    else if (variance < 30) score += 14;
    else if (variance < 50) score += 7;

    // 3. Expense Control (20 points)
    var expenseRatio = calculateExpenseRatio(recentMonths);
    if (expenseRatio <= benchmark.supplyRatio * 1.1) score += 20;
    else if (expenseRatio <= benchmark.supplyRatio * 1.3) score += 14;
    else if (expenseRatio <= benchmark.supplyRatio * 1.5) score += 7;

    // 4. Record-Keeping (20 points)
    var loggingScore = calculateLoggingConsistency(transactions);
    score += Math.round(loggingScore * 20);

    return Math.min(100, Math.max(0, score));
  }

  // ── Firestore Operations ──────────────────────────────────
  function getDocRef(uid) {
    return db.collection('users').doc(uid).collection('finance').doc('data');
  }

  function loadFinanceData(uid) {
    return getDocRef(uid).get().then(function (doc) {
      if (doc.exists) {
        _financeData = doc.data();
      } else {
        _financeData = { transactions: [], coachingSessions: [], lastUpdated: null };
      }
      return _financeData;
    }).catch(function (err) {
      console.warn('[Finance] Load failed:', err.message || err);
      _financeData = { transactions: [], coachingSessions: [], lastUpdated: null };
      return _financeData;
    });
  }

  function saveFinanceData(uid) {
    _financeData.lastUpdated = new Date().toISOString();
    return getDocRef(uid).set(_financeData, { merge: true }).catch(function (err) {
      console.warn('[Finance] Save failed:', err.message || err);
    });
  }

  function saveTransaction(uid, transaction) {
    if (!_financeData) _financeData = { transactions: [], coachingSessions: [] };
    if (!_financeData.transactions) _financeData.transactions = [];
    _financeData.transactions.push(transaction);
    return saveFinanceData(uid);
  }

  function deleteTransaction(uid, txId) {
    if (!_financeData || !_financeData.transactions) return Promise.resolve();
    _financeData.transactions = _financeData.transactions.filter(function (tx) {
      return tx.id !== txId;
    });
    return saveFinanceData(uid);
  }

  function saveCoachingSession(uid, session) {
    if (!_financeData) _financeData = { transactions: [], coachingSessions: [] };
    if (!_financeData.coachingSessions) _financeData.coachingSessions = [];
    _financeData.coachingSessions.push(session);
    return saveFinanceData(uid);
  }

  // ── Inject Styles ─────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('fin-styles')) return;
    var style = document.createElement('style');
    style.id = 'fin-styles';
    style.textContent = [
      /* Toast */
      '.fin-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);',
      'padding:12px 24px;background:rgba(16,185,129,0.95);color:#070F1A;font-family:var(--font-heading);',
      'font-weight:600;font-size:var(--fs-sm);border-radius:var(--border-radius-sm);',
      'opacity:0;transition:opacity 0.3s ease,transform 0.3s ease;z-index:10000;pointer-events:none;}',
      '.fin-toast--visible{opacity:1;transform:translateX(-50%) translateY(0);}',

      /* Form */
      '.fin-form{padding:var(--sp-xl);background:rgba(255,255,255,0.03);border:1px solid var(--color-border);',
      'border-radius:var(--border-radius-md);margin-bottom:var(--sp-xl);}',
      '.fin-form__row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--sp-md);margin-bottom:var(--sp-md);}',
      '.fin-form__group{display:flex;flex-direction:column;gap:var(--sp-xs);}',
      '.fin-form__group label{font-size:var(--fs-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:1px;}',
      '.fin-form__group input,.fin-form__group select{padding:10px 14px;background:rgba(7,15,26,0.8);',
      'border:1px solid var(--color-border);border-radius:var(--border-radius-sm);color:var(--color-text);',
      'font-family:var(--font-body);font-size:var(--fs-sm);outline:none;transition:var(--transition-fast);}',
      '.fin-form__group input:focus,.fin-form__group select:focus{border-color:var(--color-accent);',
      'box-shadow:0 0 0 3px rgba(16,185,129,0.15);}',

      /* Toggle */
      '.fin-toggle{display:inline-flex;background:rgba(255,255,255,0.04);border:1px solid var(--color-border);',
      'border-radius:var(--border-radius-sm);overflow:hidden;margin-bottom:var(--sp-md);}',
      '.fin-toggle__btn{padding:8px 20px;background:transparent;border:none;color:var(--color-text-muted);',
      'font-family:var(--font-heading);font-weight:600;font-size:var(--fs-sm);cursor:pointer;transition:var(--transition-fast);}',
      '.fin-toggle__btn--active{background:var(--color-accent);color:var(--color-bg);}',
      '.fin-toggle__btn:hover:not(.fin-toggle__btn--active){color:var(--color-white);}',

      /* Health Gauge */
      '.fin-health{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--sp-lg);}',
      '.fin-health__dial{position:relative;width:100px;height:100px;}',
      '.fin-health__dial svg{width:100%;height:100%;transform:rotate(-90deg);}',
      '.fin-health__dial circle{fill:none;stroke-width:8;stroke-linecap:round;}',
      '.fin-health__dial .track{stroke:rgba(255,255,255,0.06);}',
      '.fin-health__dial .fill{transition:stroke-dashoffset 1s ease;}',
      '.fin-health__score{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
      'font-family:var(--font-heading);font-weight:800;font-size:var(--fs-xl);color:var(--color-white);}',
      '.fin-health__label{margin-top:var(--sp-sm);font-size:var(--fs-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:1px;}',

      /* Insight Cards */
      '.fin-insights{display:flex;flex-direction:column;gap:var(--sp-md);}',
      '.fin-insight{padding:var(--sp-lg);border-radius:var(--border-radius-sm);border-left:4px solid;}',
      '.fin-insight--alert{background:rgba(239,68,68,0.08);border-color:#EF4444;}',
      '.fin-insight--warning{background:rgba(245,166,35,0.08);border-color:#F5A623;}',
      '.fin-insight--info{background:rgba(16,185,129,0.08);border-color:#10B981;}',
      '.fin-insight__title{font-family:var(--font-heading);font-weight:700;font-size:var(--fs-sm);',
      'color:var(--color-white);margin:0 0 var(--sp-xs);}',
      '.fin-insight__detail{font-size:var(--fs-xs);color:var(--color-text-muted);line-height:1.6;margin:0;}',

      /* Charts */
      '.fin-chart{display:flex;flex-direction:column;gap:var(--sp-sm);}',
      '.fin-chart__row{display:grid;grid-template-columns:70px 1fr 70px;align-items:center;gap:var(--sp-sm);}',
      '.fin-chart__label{font-size:var(--fs-xs);color:var(--color-text-muted);text-align:right;}',
      '.fin-chart__bar-wrap{height:20px;background:rgba(255,255,255,0.04);border-radius:4px;overflow:hidden;position:relative;}',
      '.fin-chart__bar{height:100%;border-radius:4px;transition:width 0.8s ease;min-width:2px;}',
      '.fin-chart__bar--revenue{background:linear-gradient(90deg,var(--color-accent),var(--color-accent-light));}',
      '.fin-chart__bar--expense{background:linear-gradient(90deg,#EF4444,#F87171);}',
      '.fin-chart__bar--category{background:linear-gradient(90deg,var(--color-secondary),var(--color-secondary-light));}',
      '.fin-chart__bar--over{background:linear-gradient(90deg,#F5A623,#FFD07A);}',
      '.fin-chart__value{font-size:var(--fs-xs);color:var(--color-text);font-weight:600;}',

      /* Table */
      '.fin-table{width:100%;border-collapse:collapse;font-size:var(--fs-sm);}',
      '.fin-table th{text-align:left;padding:var(--sp-sm) var(--sp-md);color:var(--color-text-muted);',
      'font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid var(--color-border);}',
      '.fin-table td{padding:var(--sp-sm) var(--sp-md);border-bottom:1px solid rgba(255,255,255,0.04);color:var(--color-text);}',
      '.fin-table .positive{color:var(--color-accent);}',
      '.fin-table .negative{color:#EF4444;}',
      '.fin-table .ytd-row{background:rgba(245,166,35,0.06);font-weight:700;}',

      /* Give-back */
      '.fin-giveback{padding:var(--sp-xl);background:linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(245,166,35,0.06) 100%);',
      'border:1px solid rgba(16,185,129,0.2);border-radius:var(--border-radius-lg);}',
      '.fin-giveback__row{display:flex;justify-content:space-between;align-items:center;padding:var(--sp-sm) 0;',
      'border-bottom:1px solid rgba(255,255,255,0.05);}',
      '.fin-giveback__row:last-child{border-bottom:none;}',
      '.fin-giveback__rate{font-family:var(--font-heading);font-weight:700;color:var(--color-secondary);}',

      /* Calendar */
      '.fin-calendar{display:flex;flex-direction:column;gap:var(--sp-sm);}',
      '.fin-calendar__item{display:flex;align-items:center;gap:var(--sp-md);padding:var(--sp-md);',
      'background:rgba(255,255,255,0.03);border:1px solid var(--color-border);border-radius:var(--border-radius-sm);}',
      '.fin-calendar__dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}',
      '.fin-calendar__item--urgent .fin-calendar__dot{background:#EF4444;}',
      '.fin-calendar__item--soon .fin-calendar__dot{background:#F5A623;}',
      '.fin-calendar__item--upcoming .fin-calendar__dot{background:#10B981;}',
      '.fin-calendar__text{flex:1;font-size:var(--fs-sm);color:var(--color-text);}',
      '.fin-calendar__date{font-size:var(--fs-xs);color:var(--color-text-muted);white-space:nowrap;}',

      /* Transaction list */
      '.fin-txn{display:grid;grid-template-columns:85px 70px 1fr 2fr auto 40px;align-items:center;gap:var(--sp-sm);',
      'padding:var(--sp-sm) var(--sp-md);border-bottom:1px solid rgba(255,255,255,0.04);font-size:var(--fs-sm);}',
      '.fin-txn__badge{display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600;text-transform:uppercase;}',
      '.fin-txn__badge--revenue{background:rgba(16,185,129,0.15);color:var(--color-accent);}',
      '.fin-txn__badge--expense{background:rgba(239,68,68,0.15);color:#EF4444;}',
      '.fin-txn__del{background:transparent;border:1px solid rgba(239,68,68,0.3);border-radius:6px;',
      'color:#EF4444;cursor:pointer;padding:4px 8px;font-size:11px;transition:var(--transition-fast);}',
      '.fin-txn__del:hover{background:rgba(239,68,68,0.15);border-color:#EF4444;}',
      '.fin-txn__amount--revenue{color:var(--color-accent);font-weight:600;}',
      '.fin-txn__amount--expense{color:#EF4444;font-weight:600;}',

      /* Filter bar */
      '.fin-filter{display:flex;gap:var(--sp-sm);margin-bottom:var(--sp-md);flex-wrap:wrap;}',
      '.fin-filter__btn{padding:6px 16px;background:rgba(255,255,255,0.04);border:1px solid var(--color-border);',
      'border-radius:20px;color:var(--color-text-muted);font-size:var(--fs-xs);font-family:var(--font-body);cursor:pointer;transition:var(--transition-fast);}',
      '.fin-filter__btn--active{background:rgba(245,166,35,0.1);border-color:var(--color-secondary);color:var(--color-secondary);}',

      /* Coaching button */
      '.fin-coaching__btn{padding:12px 28px;background:linear-gradient(135deg,var(--color-accent) 0%,var(--color-primary-light) 100%);',
      'color:var(--color-white);border:none;border-radius:var(--border-radius-sm);font-family:var(--font-heading);',
      'font-weight:600;font-size:var(--fs-sm);cursor:pointer;transition:var(--transition-base);margin-bottom:var(--sp-md);}',
      '.fin-coaching__btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(16,185,129,0.3);}',
      '.fin-coaching__btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;box-shadow:none;}',
      '.fin-coaching__typing{display:flex;align-items:center;gap:var(--sp-sm);color:var(--color-text-muted);font-size:var(--fs-sm);padding:var(--sp-md) 0;}',
      '.fin-coaching__dots span{display:inline-block;width:6px;height:6px;background:var(--color-accent);',
      'border-radius:50%;margin:0 2px;animation:finDotPulse 1.4s infinite ease-in-out both;}',
      '.fin-coaching__dots span:nth-child(2){animation-delay:0.16s;}',
      '.fin-coaching__dots span:nth-child(3){animation-delay:0.32s;}',
      '@keyframes finDotPulse{0%,80%,100%{transform:scale(0.4);opacity:0.4;}40%{transform:scale(1);opacity:1;}}',

      /* Submit button */
      '.fin-form__submit{padding:10px 24px;background:linear-gradient(135deg,var(--color-accent) 0%,var(--color-primary-light) 100%);',
      'color:var(--color-white);border:none;border-radius:var(--border-radius-sm);font-family:var(--font-heading);',
      'font-weight:600;font-size:var(--fs-sm);cursor:pointer;transition:var(--transition-base);}',
      '.fin-form__submit:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(16,185,129,0.3);}',

      /* Scrollable txn list */
      '.fin-txn-list{max-height:400px;overflow-y:auto;border:1px solid var(--color-border);border-radius:var(--border-radius-sm);}',

      /* Responsive */
      '@media(max-width:768px){',
      '.fin-txn{grid-template-columns:1fr 1fr;gap:var(--sp-xs);padding:var(--sp-md);}',
      '.fin-form__row{grid-template-columns:1fr;}',
      '.fin-chart__row{grid-template-columns:50px 1fr 60px;}',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Build UI ──────────────────────────────────────────────
  function buildUI(container) {
    container.innerHTML = '';

    var sections = [
      buildStatsRow(),
      buildTransactionForm(),
      buildCoachingPanel(),
      buildRevenueExpenseChart(),
      buildExpenseBreakdown(),
      buildMonthlyPnL(),
      buildGiveBackCalculator(),
      buildTransactionHistory(),
      buildComplianceCalendar()
    ];

    for (var i = 0; i < sections.length; i++) {
      container.appendChild(sections[i]);
    }
  }

  // ── 1. Stats Row ──────────────────────────────────────────
  function buildStatsRow() {
    var section = document.createElement('div');
    section.className = 'dash-stats';
    section.id = 'fin-stats';
    section.innerHTML =
      '<div class="dash-stat" style="border-left:3px solid var(--color-accent);">' +
        '<div class="dash-stat__value" id="fin-stat-revenue">$0</div>' +
        '<div class="dash-stat__label">Total Revenue</div>' +
      '</div>' +
      '<div class="dash-stat" style="border-left:3px solid #EF4444;">' +
        '<div class="dash-stat__value" id="fin-stat-expenses" style="color:#EF4444;">$0</div>' +
        '<div class="dash-stat__label">Total Expenses</div>' +
      '</div>' +
      '<div class="dash-stat" id="fin-stat-profit-card" style="border-left:3px solid var(--color-secondary);">' +
        '<div class="dash-stat__value" id="fin-stat-profit" style="color:var(--color-secondary);">$0</div>' +
        '<div class="dash-stat__label">Net Profit</div>' +
      '</div>' +
      '<div class="dash-stat" style="border-left:3px solid var(--color-accent);">' +
        '<div id="fin-health-gauge" class="fin-health"></div>' +
      '</div>';
    return section;
  }

  function updateStats() {
    var txns = getTransactions();
    var totals = computeTotals(txns);

    var revEl = document.getElementById('fin-stat-revenue');
    var expEl = document.getElementById('fin-stat-expenses');
    var profEl = document.getElementById('fin-stat-profit');
    var profCard = document.getElementById('fin-stat-profit-card');

    if (revEl) revEl.textContent = formatCurrency(totals.revenue);
    if (expEl) expEl.textContent = formatCurrency(totals.expenses);
    if (profEl) {
      profEl.textContent = formatCurrency(totals.net);
      if (totals.net >= 0) {
        profEl.style.color = 'var(--color-secondary)';
        if (profCard) profCard.style.borderLeftColor = 'var(--color-secondary)';
      } else {
        profEl.style.color = '#EF4444';
        if (profCard) profCard.style.borderLeftColor = '#EF4444';
      }
    }

    // Health gauge
    var healthScore = calculateHealthScore(txns, _industry);
    renderHealthGauge(healthScore);
  }

  function renderHealthGauge(score) {
    var gauge = document.getElementById('fin-health-gauge');
    if (!gauge) return;

    var circumference = 2 * Math.PI * 42;
    var offset = circumference - (score / 100) * circumference;
    var color = score >= 60 ? '#10B981' : (score >= 35 ? '#F5A623' : '#EF4444');

    gauge.innerHTML =
      '<div class="fin-health__dial">' +
        '<svg viewBox="0 0 100 100">' +
          '<circle class="track" cx="50" cy="50" r="42"/>' +
          '<circle class="fill" cx="50" cy="50" r="42" stroke="' + color + '" ' +
            'stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '"/>' +
        '</svg>' +
        '<div class="fin-health__score">' + score + '</div>' +
      '</div>' +
      '<div class="fin-health__label">Health Score</div>';
  }

  // ── 2. Transaction Form ───────────────────────────────────
  function buildTransactionForm() {
    var section = document.createElement('div');
    section.className = 'dash-section';

    var categories = EXPENSE_CATEGORIES[_industry] || EXPENSE_CATEGORIES['professional'];

    var catOptions = '<option value="">Select category</option>';
    // Start with expense categories by default
    for (var i = 0; i < categories.length; i++) {
      catOptions += '<option value="' + escHtml(categories[i]) + '">' + escHtml(categories[i]) + '</option>';
    }

    section.innerHTML =
      '<h2 class="dash-section__title">Log Transaction</h2>' +
      '<p class="dash-section__subtitle">Track your income and expenses. The more consistently you log, the better your health score and coaching insights.</p>' +
      '<div class="fin-form">' +
        '<div class="fin-toggle" id="fin-type-toggle">' +
          '<button class="fin-toggle__btn" id="fin-toggle-revenue" type="button">Revenue</button>' +
          '<button class="fin-toggle__btn fin-toggle__btn--active" id="fin-toggle-expense" type="button">Expense</button>' +
        '</div>' +
        '<input type="hidden" id="fin-tx-type" value="expense">' +
        '<div class="fin-form__row">' +
          '<div class="fin-form__group">' +
            '<label for="fin-tx-category">Category</label>' +
            '<select id="fin-tx-category">' + catOptions + '</select>' +
          '</div>' +
          '<div class="fin-form__group">' +
            '<label for="fin-tx-amount">Amount ($)</label>' +
            '<input type="number" id="fin-tx-amount" min="0" step="0.01" placeholder="0.00">' +
          '</div>' +
          '<div class="fin-form__group">' +
            '<label for="fin-tx-date">Date</label>' +
            '<input type="date" id="fin-tx-date" value="' + todayStr() + '">' +
          '</div>' +
        '</div>' +
        '<div class="fin-form__row">' +
          '<div class="fin-form__group" style="grid-column:1/-1;">' +
            '<label for="fin-tx-desc">Description</label>' +
            '<input type="text" id="fin-tx-desc" placeholder="Brief description of this transaction" maxlength="200">' +
          '</div>' +
        '</div>' +
        '<button class="fin-form__submit" id="fin-tx-submit" type="button">Log Transaction</button>' +
      '</div>';

    return section;
  }

  function bindFormEvents() {
    var revBtn = document.getElementById('fin-toggle-revenue');
    var expBtn = document.getElementById('fin-toggle-expense');
    var typeInput = document.getElementById('fin-tx-type');
    var catSelect = document.getElementById('fin-tx-category');
    var submitBtn = document.getElementById('fin-tx-submit');

    if (revBtn) {
      revBtn.addEventListener('click', function () {
        revBtn.classList.add('fin-toggle__btn--active');
        expBtn.classList.remove('fin-toggle__btn--active');
        typeInput.value = 'revenue';
        updateCategoryOptions('revenue');
      });
    }

    if (expBtn) {
      expBtn.addEventListener('click', function () {
        expBtn.classList.add('fin-toggle__btn--active');
        revBtn.classList.remove('fin-toggle__btn--active');
        typeInput.value = 'expense';
        updateCategoryOptions('expense');
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        handleSubmitTransaction();
      });
    }
  }

  function updateCategoryOptions(type) {
    var catSelect = document.getElementById('fin-tx-category');
    if (!catSelect) return;

    var cats;
    if (type === 'revenue') {
      cats = REVENUE_CATEGORIES;
    } else {
      cats = EXPENSE_CATEGORIES[_industry] || EXPENSE_CATEGORIES['professional'];
    }

    var html = '<option value="">Select category</option>';
    for (var i = 0; i < cats.length; i++) {
      html += '<option value="' + escHtml(cats[i]) + '">' + escHtml(cats[i]) + '</option>';
    }
    catSelect.innerHTML = html;
  }

  function handleSubmitTransaction() {
    var type = (document.getElementById('fin-tx-type') || {}).value || 'expense';
    var category = (document.getElementById('fin-tx-category') || {}).value;
    var amount = parseFloat((document.getElementById('fin-tx-amount') || {}).value);
    var date = (document.getElementById('fin-tx-date') || {}).value;
    var desc = (document.getElementById('fin-tx-desc') || {}).value || '';

    if (!category) { showToast('Please select a category.'); return; }
    if (!amount || amount <= 0) { showToast('Please enter a valid amount.'); return; }
    if (!date) { showToast('Please select a date.'); return; }

    var tx = {
      id: generateId(),
      date: date,
      type: type,
      category: category,
      amount: amount,
      description: desc.trim(),
      createdAt: new Date().toISOString()
    };

    saveTransaction(_uid, tx).then(function () {
      showToast('Transaction logged: ' + formatCurrency(amount) + ' (' + category + ')');
      // Clear form
      var amtEl = document.getElementById('fin-tx-amount');
      var descEl = document.getElementById('fin-tx-desc');
      if (amtEl) amtEl.value = '';
      if (descEl) descEl.value = '';
      refreshAllSections();
    });
  }

  // ── 3. Coaching Panel ─────────────────────────────────────
  function buildCoachingPanel() {
    var section = document.createElement('div');
    section.className = 'dash-section';
    section.id = 'fin-coaching-section';

    var lastSession = getLastCoachingDate();

    section.innerHTML =
      '<h2 class="dash-section__title">Ask Bella for Coaching</h2>' +
      '<p class="dash-section__subtitle">Get personalized financial insights powered by AI. Bella analyzes your numbers and gives you specific, actionable advice.</p>' +
      '<button class="fin-coaching__btn" id="fin-coaching-btn" type="button">Get Financial Coaching</button>' +
      (lastSession ? '<div style="font-size:var(--fs-xs);color:var(--color-text-muted);margin-bottom:var(--sp-md);">Last coached: ' + timeAgo(lastSession) + '</div>' : '') +
      '<div id="fin-coaching-loading" style="display:none;"></div>' +
      '<div id="fin-coaching-results" class="fin-insights"></div>';

    return section;
  }

  function getLastCoachingDate() {
    if (!_financeData || !_financeData.coachingSessions || !_financeData.coachingSessions.length) return null;
    return _financeData.coachingSessions[_financeData.coachingSessions.length - 1].date;
  }

  function bindCoachingEvents() {
    var btn = document.getElementById('fin-coaching-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      requestCoaching();
    });
  }

  function requestCoaching() {
    var btn = document.getElementById('fin-coaching-btn');
    var loadingEl = document.getElementById('fin-coaching-loading');
    var resultsEl = document.getElementById('fin-coaching-results');

    if (!btn || !loadingEl || !resultsEl) return;

    btn.disabled = true;
    resultsEl.innerHTML = '';
    loadingEl.style.display = 'block';
    loadingEl.innerHTML =
      '<div class="fin-coaching__typing">' +
        '<div class="fin-coaching__dots"><span></span><span></span><span></span></div>' +
        '<span>Bella is analyzing your finances...</span>' +
      '</div>';

    // Build request data
    var txns = getTransactions();
    var months = groupByMonth(txns);
    var recent = months.slice(-3);
    var currentMonth = getCurrentMonthTransactions();
    var currentTotals = computeTotals(currentMonth);
    var allTotals = computeTotals(txns);

    var monthlyRevenue = recent.length > 0 ? recent[recent.length - 1].revenue : currentTotals.revenue;
    var monthlyExpenses = recent.length > 0 ? recent[recent.length - 1].expenses : currentTotals.expenses;
    var profitMargin = monthlyRevenue > 0 ? ((monthlyRevenue - monthlyExpenses) / monthlyRevenue) * 100 : 0;

    // Calculate trend
    var recentTrend = 'stable';
    if (recent.length >= 2) {
      var prev = recent[recent.length - 2].revenue;
      var curr = recent[recent.length - 1].revenue;
      if (prev > 0) {
        var change = ((curr - prev) / prev) * 100;
        if (change > 5) recentTrend = 'growing';
        else if (change < -5) recentTrend = 'declining';
      }
    }

    // Build expense breakdown
    var expenseBreakdown = {};
    for (var i = 0; i < currentMonth.length; i++) {
      var tx = currentMonth[i];
      if (tx.type === 'expense') {
        expenseBreakdown[tx.category] = (expenseBreakdown[tx.category] || 0) + (parseFloat(tx.amount) || 0);
      }
    }

    var payload = {
      industry: _industry,
      monthlyRevenue: monthlyRevenue,
      monthlyExpenses: monthlyExpenses,
      expenseBreakdown: expenseBreakdown,
      profitMargin: profitMargin,
      monthsInBusiness: months.length,
      recentTrend: recentTrend
    };

    fetch('/.netlify/functions/bella-coaching', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': _uid
      },
      body: JSON.stringify(payload)
    })
    .then(function (resp) {
      return resp.json();
    })
    .then(function (data) {
      if (!data) return;
      loadingEl.style.display = 'none';
      btn.disabled = false;

      var insights = data.insights || [];
      renderInsights(resultsEl, insights);

      // Save session
      var session = {
        date: new Date().toISOString(),
        insights: insights,
        snapshot: { revenue: monthlyRevenue, expenses: monthlyExpenses, margin: profitMargin }
      };
      saveCoachingSession(_uid, session);
    })
    .catch(function (err) {
      console.warn('[Finance] Coaching request failed:', err);
      loadingEl.style.display = 'none';
      btn.disabled = false;
      // Show fallback
      var fallback = generateLocalFallbackInsights(payload);
      renderInsights(resultsEl, fallback);
    });
  }

  function renderInsights(container, insights) {
    var html = '';
    for (var i = 0; i < insights.length; i++) {
      var ins = insights[i];
      var severity = ins.severity || 'info';
      html +=
        '<div class="fin-insight fin-insight--' + escHtml(severity) + '">' +
          '<div class="fin-insight__title">' + escHtml(ins.title) + '</div>' +
          '<p class="fin-insight__detail">' + escHtml(ins.detail) + '</p>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  function generateLocalFallbackInsights(data) {
    var insights = [];
    var margin = data.profitMargin || 0;
    var revenue = data.monthlyRevenue || 0;
    var expenses = data.monthlyExpenses || 0;

    if (margin < 0) {
      insights.push({
        severity: 'alert',
        title: 'Your expenses exceed revenue',
        detail: 'Focus on increasing sales or reducing your top expense category. ' +
          'You are spending ' + formatCurrency(Math.abs(revenue - expenses)) + ' more than you earn.'
      });
    }

    var breakdown = data.expenseBreakdown || {};
    var bKeys = Object.keys(breakdown);
    var totalExp = 0;
    var topCat = '';
    var topAmt = 0;
    for (var i = 0; i < bKeys.length; i++) {
      var amt = breakdown[bKeys[i]];
      totalExp += amt;
      if (amt > topAmt) { topAmt = amt; topCat = bKeys[i]; }
    }
    if (totalExp > 0 && topAmt / totalExp > 0.4) {
      var benchmark = INDUSTRY_BENCHMARKS[_industry] || INDUSTRY_BENCHMARKS['professional'];
      insights.push({
        severity: 'warning',
        title: topCat + ' spending is ' + Math.round((topAmt / totalExp) * 100) + '% of total expenses',
        detail: 'Industry average supply ratio is around ' + benchmark.supplyRatio + '%. Look for ways to reduce costs in this category.'
      });
    }

    if (data.recentTrend === 'growing') {
      insights.push({
        severity: 'info',
        title: 'Your revenue is growing',
        detail: 'Keep the momentum going. Document what is working and double down on those channels.'
      });
    }

    if (insights.length < 3) {
      insights.push({
        severity: 'info',
        title: 'Keep logging transactions consistently',
        detail: 'The more data you provide, the better Bella can coach you. Try to log every transaction within 24 hours.'
      });
    }

    return insights.slice(0, 5);
  }

  // ── 4. Revenue vs Expenses Chart ──────────────────────────
  function buildRevenueExpenseChart() {
    var section = document.createElement('div');
    section.className = 'dash-section';
    section.innerHTML =
      '<h2 class="dash-section__title">Revenue vs Expenses</h2>' +
      '<p class="dash-section__subtitle">Last 6 months at a glance. Green bars are revenue, red bars are expenses.</p>' +
      '<div id="fin-rev-exp-chart" class="fin-chart"></div>';
    return section;
  }

  function updateRevenueExpenseChart() {
    var container = document.getElementById('fin-rev-exp-chart');
    if (!container) return;

    var months = groupByMonth(getTransactions()).slice(-6);
    if (months.length === 0) {
      container.innerHTML = '<div style="color:var(--color-text-muted);font-size:var(--fs-sm);padding:var(--sp-lg);text-align:center;">No transaction data yet. Start logging to see your revenue vs expenses chart.</div>';
      return;
    }

    // Find max for scaling
    var maxVal = 0;
    for (var i = 0; i < months.length; i++) {
      if (months[i].revenue > maxVal) maxVal = months[i].revenue;
      if (months[i].expenses > maxVal) maxVal = months[i].expenses;
    }
    if (maxVal === 0) maxVal = 1;

    var html = '';
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (var j = 0; j < months.length; j++) {
      var m = months[j];
      var parts = m.month.split('-');
      var label = monthNames[parseInt(parts[1], 10) - 1] + ' ' + parts[0].substring(2);
      var revPct = Math.max(1, (m.revenue / maxVal) * 100);
      var expPct = Math.max(1, (m.expenses / maxVal) * 100);

      html +=
        '<div class="fin-chart__row">' +
          '<div class="fin-chart__label">' + label + '</div>' +
          '<div class="fin-chart__bar-wrap">' +
            '<div class="fin-chart__bar fin-chart__bar--revenue" style="width:' + revPct + '%;"></div>' +
          '</div>' +
          '<div class="fin-chart__value" style="color:var(--color-accent);">' + formatCurrency(m.revenue) + '</div>' +
        '</div>' +
        '<div class="fin-chart__row">' +
          '<div class="fin-chart__label"></div>' +
          '<div class="fin-chart__bar-wrap">' +
            '<div class="fin-chart__bar fin-chart__bar--expense" style="width:' + expPct + '%;"></div>' +
          '</div>' +
          '<div class="fin-chart__value" style="color:#EF4444;">' + formatCurrency(m.expenses) + '</div>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  // ── 5. Expense Breakdown ──────────────────────────────────
  function buildExpenseBreakdown() {
    var section = document.createElement('div');
    section.className = 'dash-section';
    section.innerHTML =
      '<h2 class="dash-section__title">Expense Breakdown</h2>' +
      '<p class="dash-section__subtitle">Current month expenses by category. Categories above industry benchmarks are highlighted.</p>' +
      '<div id="fin-expense-breakdown" class="fin-chart"></div>';
    return section;
  }

  function updateExpenseBreakdown() {
    var container = document.getElementById('fin-expense-breakdown');
    if (!container) return;

    var currentMonth = getCurrentMonthTransactions();
    var catTotals = {};
    var totalExpenses = 0;

    for (var i = 0; i < currentMonth.length; i++) {
      var tx = currentMonth[i];
      if (tx.type === 'expense') {
        var amt = parseFloat(tx.amount) || 0;
        catTotals[tx.category] = (catTotals[tx.category] || 0) + amt;
        totalExpenses += amt;
      }
    }

    var keys = Object.keys(catTotals).sort(function (a, b) { return catTotals[b] - catTotals[a]; });

    if (keys.length === 0) {
      container.innerHTML = '<div style="color:var(--color-text-muted);font-size:var(--fs-sm);padding:var(--sp-lg);text-align:center;">No expenses logged this month yet.</div>';
      return;
    }

    var benchmark = INDUSTRY_BENCHMARKS[_industry] || INDUSTRY_BENCHMARKS['professional'];
    var html = '';

    for (var j = 0; j < keys.length; j++) {
      var cat = keys[j];
      var amount = catTotals[cat];
      var pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      var isOver = pct > benchmark.supplyRatio;
      var barClass = isOver ? 'fin-chart__bar--over' : 'fin-chart__bar--category';

      html +=
        '<div class="fin-chart__row">' +
          '<div class="fin-chart__label" title="' + escHtml(cat) + '">' + escHtml(cat.length > 12 ? cat.substring(0, 10) + '..' : cat) + '</div>' +
          '<div class="fin-chart__bar-wrap">' +
            '<div class="fin-chart__bar ' + barClass + '" style="width:' + Math.max(2, pct) + '%;"></div>' +
          '</div>' +
          '<div class="fin-chart__value">' + Math.round(pct) + '% / ' + formatCurrency(amount) + '</div>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  // ── 6. Monthly P&L Table ──────────────────────────────────
  function buildMonthlyPnL() {
    var section = document.createElement('div');
    section.className = 'dash-section';
    section.innerHTML =
      '<h2 class="dash-section__title">Monthly Profit & Loss</h2>' +
      '<p class="dash-section__subtitle">Your month-by-month financial performance at a glance.</p>' +
      '<div style="overflow-x:auto;"><table class="fin-table" id="fin-pnl-table"></table></div>';
    return section;
  }

  function updateMonthlyPnL() {
    var table = document.getElementById('fin-pnl-table');
    if (!table) return;

    var months = groupByMonth(getTransactions());
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (months.length === 0) {
      table.innerHTML = '<tr><td style="color:var(--color-text-muted);padding:var(--sp-lg);text-align:center;">No data yet. Log transactions to see your P&L.</td></tr>';
      return;
    }

    var html =
      '<thead><tr>' +
        '<th>Month</th><th>Revenue</th><th>Expenses</th><th>Net</th><th>Margin</th>' +
      '</tr></thead><tbody>';

    var ytdRev = 0;
    var ytdExp = 0;

    for (var i = 0; i < months.length; i++) {
      var m = months[i];
      var net = m.revenue - m.expenses;
      var margin = m.revenue > 0 ? ((net / m.revenue) * 100).toFixed(1) : '0.0';
      var netClass = net >= 0 ? 'positive' : 'negative';

      var parts = m.month.split('-');
      var label = monthNames[parseInt(parts[1], 10) - 1] + ' ' + parts[0];

      ytdRev += m.revenue;
      ytdExp += m.expenses;

      html +=
        '<tr>' +
          '<td>' + label + '</td>' +
          '<td>' + formatCurrency(m.revenue) + '</td>' +
          '<td>' + formatCurrency(m.expenses) + '</td>' +
          '<td class="' + netClass + '">' + formatCurrency(net) + '</td>' +
          '<td class="' + netClass + '">' + margin + '%</td>' +
        '</tr>';
    }

    // YTD row
    var ytdNet = ytdRev - ytdExp;
    var ytdMargin = ytdRev > 0 ? ((ytdNet / ytdRev) * 100).toFixed(1) : '0.0';
    var ytdClass = ytdNet >= 0 ? 'positive' : 'negative';

    html +=
      '<tr class="ytd-row">' +
        '<td>YTD Total</td>' +
        '<td>' + formatCurrency(ytdRev) + '</td>' +
        '<td>' + formatCurrency(ytdExp) + '</td>' +
        '<td class="' + ytdClass + '">' + formatCurrency(ytdNet) + '</td>' +
        '<td class="' + ytdClass + '">' + ytdMargin + '%</td>' +
      '</tr>';

    html += '</tbody>';
    table.innerHTML = html;
  }

  // ── 7. Give-Back Calculator ───────────────────────────────
  function buildGiveBackCalculator() {
    var section = document.createElement('div');
    section.className = 'dash-section';
    section.innerHTML =
      '<h2 class="dash-section__title">Give-Back Calculator</h2>' +
      '<p class="dash-section__subtitle">Based on your trailing 3-month average profit, here is what your graduated contributions would look like.</p>' +
      '<div class="fin-giveback" id="fin-giveback"></div>';
    return section;
  }

  function updateGiveBackCalculator() {
    var container = document.getElementById('fin-giveback');
    if (!container) return;

    var months = groupByMonth(getTransactions());
    var recent = months.slice(-3);

    var avgProfit = 0;
    if (recent.length > 0) {
      var totalProfit = 0;
      for (var i = 0; i < recent.length; i++) {
        totalProfit += (recent[i].revenue - recent[i].expenses);
      }
      avgProfit = totalProfit / recent.length;
    }

    var avgProfitDisplay = Math.max(0, avgProfit);

    var y1Monthly = Math.min(avgProfitDisplay * 0.10, 5000 / 12);
    var y2Monthly = Math.min(avgProfitDisplay * 0.07, 5000 / 12);
    var y3Monthly = Math.min(avgProfitDisplay * 0.05, 5000 / 12);

    var y1Annual = Math.min(y1Monthly * 12, 5000);
    var y2Annual = Math.min(y2Monthly * 12, 5000);
    var y3Annual = Math.min(y3Monthly * 12, 5000);

    container.innerHTML =
      '<div style="font-size:var(--fs-sm);color:var(--color-text-muted);margin-bottom:var(--sp-lg);">' +
        'Based on your trailing 3-month average profit of <strong style="color:var(--color-white);">' +
        formatCurrency(avgProfitDisplay) + '/month</strong>:' +
      '</div>' +
      '<div class="fin-giveback__row">' +
        '<div><strong style="color:var(--color-white);">Year 1 (10%)</strong></div>' +
        '<div class="fin-giveback__rate">~' + formatCurrency(y1Monthly) + '/month</div>' +
        '<div style="font-size:var(--fs-xs);color:var(--color-text-muted);">Capped at $5,000/year (' + formatCurrency(y1Annual) + '/yr est.)</div>' +
      '</div>' +
      '<div class="fin-giveback__row">' +
        '<div><strong style="color:var(--color-white);">Year 2 (7%)</strong></div>' +
        '<div class="fin-giveback__rate">~' + formatCurrency(y2Monthly) + '/month</div>' +
        '<div style="font-size:var(--fs-xs);color:var(--color-text-muted);">Capped at $5,000/year (' + formatCurrency(y2Annual) + '/yr est.)</div>' +
      '</div>' +
      '<div class="fin-giveback__row">' +
        '<div><strong style="color:var(--color-white);">Year 3 (5%)</strong></div>' +
        '<div class="fin-giveback__rate">~' + formatCurrency(y3Monthly) + '/month</div>' +
        '<div style="font-size:var(--fs-xs);color:var(--color-text-muted);">Capped at $5,000/year (' + formatCurrency(y3Annual) + '/yr est.)</div>' +
      '</div>' +
      '<div class="fin-giveback__row">' +
        '<div><strong style="color:var(--color-white);">Year 4+</strong></div>' +
        '<div style="font-size:var(--fs-sm);color:var(--color-accent);">Voluntary -- pay it forward</div>' +
        '<div style="font-size:var(--fs-xs);color:var(--color-text-muted);">You keep the dashboard forever.</div>' +
      '</div>';
  }

  // ── 8. Transaction History ────────────────────────────────
  function buildTransactionHistory() {
    var section = document.createElement('div');
    section.className = 'dash-section';
    section.innerHTML =
      '<h2 class="dash-section__title">Transaction History</h2>' +
      '<p class="dash-section__subtitle">All logged transactions, most recent first.</p>' +
      '<div class="fin-filter" id="fin-txn-filter">' +
        '<button class="fin-filter__btn fin-filter__btn--active" data-filter="all" type="button">All</button>' +
        '<button class="fin-filter__btn" data-filter="revenue" type="button">Revenue</button>' +
        '<button class="fin-filter__btn" data-filter="expense" type="button">Expenses</button>' +
      '</div>' +
      '<div class="fin-txn-list" id="fin-txn-list"></div>';
    return section;
  }

  function bindFilterEvents() {
    var filterBar = document.getElementById('fin-txn-filter');
    if (!filterBar) return;

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.fin-filter__btn');
      if (!btn) return;

      var filter = btn.getAttribute('data-filter');
      _filterType = filter;

      var btns = filterBar.querySelectorAll('.fin-filter__btn');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('fin-filter__btn--active');
      }
      btn.classList.add('fin-filter__btn--active');

      updateTransactionHistory();
    });
  }

  function updateTransactionHistory() {
    var container = document.getElementById('fin-txn-list');
    if (!container) return;

    var txns = getTransactions().slice().sort(function (a, b) {
      return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    });

    if (_filterType !== 'all') {
      txns = txns.filter(function (tx) { return tx.type === _filterType; });
    }

    if (txns.length === 0) {
      container.innerHTML = '<div style="color:var(--color-text-muted);font-size:var(--fs-sm);padding:var(--sp-xl);text-align:center;">No transactions found.</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < txns.length; i++) {
      var tx = txns[i];
      var badgeClass = tx.type === 'revenue' ? 'fin-txn__badge--revenue' : 'fin-txn__badge--expense';
      var amountClass = tx.type === 'revenue' ? 'fin-txn__amount--revenue' : 'fin-txn__amount--expense';
      var amountPrefix = tx.type === 'revenue' ? '+' : '-';

      html +=
        '<div class="fin-txn">' +
          '<div style="color:var(--color-text-muted);font-size:var(--fs-xs);">' + escHtml(formatDate(tx.date)) + '</div>' +
          '<div><span class="fin-txn__badge ' + badgeClass + '">' + escHtml(tx.type) + '</span></div>' +
          '<div style="font-size:var(--fs-xs);color:var(--color-text);">' + escHtml(tx.category) + '</div>' +
          '<div style="font-size:var(--fs-xs);color:var(--color-text-muted);">' + escHtml(tx.description || '--') + '</div>' +
          '<div class="' + amountClass + '">' + amountPrefix + formatCurrency(tx.amount) + '</div>' +
          '<button class="fin-txn__del" data-txid="' + escHtml(tx.id) + '" type="button" title="Delete">X</button>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  function bindDeleteEvents() {
    var list = document.getElementById('fin-txn-list');
    if (!list) return;

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.fin-txn__del');
      if (!btn) return;

      var txId = btn.getAttribute('data-txid');
      if (!txId) return;

      // Simple confirm
      if (!confirm('Delete this transaction?')) return;

      deleteTransaction(_uid, txId).then(function () {
        showToast('Transaction deleted.');
        refreshAllSections();
      });
    });
  }

  // ── 9. Compliance Calendar ────────────────────────────────
  function buildComplianceCalendar() {
    var section = document.createElement('div');
    section.className = 'dash-section';
    section.innerHTML =
      '<h2 class="dash-section__title">Compliance Calendar</h2>' +
      '<p class="dash-section__subtitle">Key tax and regulatory deadlines. Stay ahead to avoid penalties.</p>' +
      '<div id="fin-compliance-calendar" class="fin-calendar"></div>';
    return section;
  }

  function updateComplianceCalendar() {
    var container = document.getElementById('fin-compliance-calendar');
    if (!container) return;

    var now = new Date();
    var year = now.getFullYear();
    var deadlines = [];

    // Quarterly estimated tax deadlines
    var quarters = [
      { label: 'Q1 Estimated Taxes', month: 3, day: 15 },
      { label: 'Q2 Estimated Taxes', month: 5, day: 15 },
      { label: 'Q3 Estimated Taxes', month: 8, day: 15 },
      { label: 'Q4 Estimated Taxes', month: 0, day: 15, nextYear: true }
    ];

    for (var i = 0; i < quarters.length; i++) {
      var q = quarters[i];
      var qYear = q.nextYear ? year + 1 : year;
      var qDate = new Date(qYear, q.month, q.day);
      // Only show future and recently past (within 30 days)
      var diff = qDate.getTime() - now.getTime();
      var daysDiff = diff / (1000 * 60 * 60 * 24);

      if (daysDiff > -30) {
        deadlines.push({
          label: q.label,
          date: qDate,
          daysDiff: daysDiff
        });
      }
    }

    // Annual report (assume due in the filing state's month -- default to the anniversary month)
    deadlines.push({
      label: 'Annual Report (check your state requirements)',
      date: new Date(year, 11, 31),
      daysDiff: (new Date(year, 11, 31).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    });

    // Federal tax return
    var taxDay = new Date(year, 3, 15);
    var taxDayDiff = (taxDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (taxDayDiff > -30) {
      deadlines.push({
        label: 'Federal Tax Return Due (or extension)',
        date: taxDay,
        daysDiff: taxDayDiff
      });
    }

    // Sort by date
    deadlines.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });

    var html = '';
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (var j = 0; j < deadlines.length; j++) {
      var dl = deadlines[j];
      var urgency;
      if (dl.daysDiff < 0) {
        urgency = 'urgent'; // overdue
      } else if (dl.daysDiff <= 7) {
        urgency = 'urgent'; // due this week
      } else if (dl.daysDiff <= 30) {
        urgency = 'soon'; // due this month
      } else {
        urgency = 'upcoming'; // future
      }

      var dateLabel = monthNames[dl.date.getMonth()] + ' ' + dl.date.getDate() + ', ' + dl.date.getFullYear();
      var statusLabel = '';
      if (dl.daysDiff < 0) {
        statusLabel = ' (overdue)';
      } else if (dl.daysDiff <= 7) {
        statusLabel = ' (this week)';
      }

      html +=
        '<div class="fin-calendar__item fin-calendar__item--' + urgency + '">' +
          '<div class="fin-calendar__dot"></div>' +
          '<div class="fin-calendar__text">' + escHtml(dl.label) + escHtml(statusLabel) + '</div>' +
          '<div class="fin-calendar__date">' + dateLabel + '</div>' +
        '</div>';
    }

    container.innerHTML = html;
  }

  // ── Refresh All ───────────────────────────────────────────
  function refreshAllSections() {
    updateStats();
    updateRevenueExpenseChart();
    updateExpenseBreakdown();
    updateMonthlyPnL();
    updateGiveBackCalculator();
    updateTransactionHistory();
    updateComplianceCalendar();
  }

  // ── Init ──────────────────────────────────────────────────
  function init(uid, industry) {
    if (_initialized && _uid === uid) {
      // Already initialized for this user, just refresh
      refreshAllSections();
      return;
    }

    _uid = uid;
    _industry = industry || 'professional';
    _initialized = true;

    injectStyles();

    var container = document.getElementById('finance-section');
    if (!container) {
      console.warn('[Finance] #finance-section container not found.');
      return;
    }

    // Show loading state
    container.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;padding:var(--sp-3xl);gap:var(--sp-lg);">' +
        '<div style="width:40px;height:40px;border:4px solid rgba(255,255,255,0.1);border-top-color:var(--color-secondary);border-radius:50%;animation:dashSpin 0.8s linear infinite;"></div>' +
        '<div style="font-family:var(--font-heading);color:var(--color-text-muted);font-size:var(--fs-sm);">Loading financial data...</div>' +
      '</div>';

    loadFinanceData(uid).then(function () {
      buildUI(container);
      bindFormEvents();
      bindCoachingEvents();
      bindFilterEvents();
      bindDeleteEvents();
      refreshAllSections();
    });
  }

  // ── Export Global Module ──────────────────────────────────
  window.financeModule = {
    init: init
  };

})();
