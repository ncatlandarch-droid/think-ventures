/**
 * Bella Financial Coaching -- Netlify Serverless Proxy
 *
 * Securely proxies Gemini 2.5-flash for AI-driven financial coaching.
 * API key stays in Netlify env vars, never exposed to the browser.
 *
 * POST /.netlify/functions/bella-coaching
 * Headers: X-User-Id (required for rate limiting)
 * Body: {
 *   industry, monthlyRevenue, monthlyExpenses,
 *   expenseBreakdown, profitMargin, monthsInBusiness, recentTrend
 * }
 * Returns: { insights: [ { severity, title, detail } ] }
 */

// Rate limiting removed -- cost per call is fractions of a cent.
// Unlimited coaching is a core value of Think! Ventures.

// ── Fallback Insights (pure math, no AI) ────────────────────
function generateFallbackInsights(data) {
  var insights = [];
  var revenue = parseFloat(data.monthlyRevenue) || 0;
  var expenses = parseFloat(data.monthlyExpenses) || 0;
  var margin = parseFloat(data.profitMargin) || 0;
  var breakdown = data.expenseBreakdown || {};

  // 1. Negative margin alert
  if (margin < 0) {
    insights.push({
      severity: 'alert',
      title: 'Your expenses exceed your revenue',
      detail: 'You are currently spending $' + Math.abs(revenue - expenses).toFixed(0) +
        ' more than you earn each month. Focus on increasing sales or cutting your ' +
        'largest expense category to get back to profitability.'
    });
  }

  // 2. Dominant expense category
  var totalExp = 0;
  var topCategory = '';
  var topAmount = 0;
  var keys = Object.keys(breakdown);
  for (var i = 0; i < keys.length; i++) {
    var amt = parseFloat(breakdown[keys[i]]) || 0;
    totalExp += amt;
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = keys[i];
    }
  }

  if (totalExp > 0 && topAmount / totalExp > 0.4) {
    var pct = Math.round((topAmount / totalExp) * 100);
    insights.push({
      severity: 'warning',
      title: topCategory + ' is ' + pct + '% of your total expenses',
      detail: 'When a single category exceeds 40% of total spending, it creates ' +
        'concentration risk. Look for alternative suppliers, negotiate volume ' +
        'discounts, or evaluate whether every dollar in this category drives revenue.'
    });
  }

  // 3. Revenue trend
  if (data.recentTrend === 'growing') {
    insights.push({
      severity: 'info',
      title: 'Your revenue is trending upward',
      detail: 'Momentum matters in a young business. Keep doing what is working, ' +
        'document your winning strategies, and consider reinvesting a portion of ' +
        'profits into the channels that are driving this growth.'
    });
  } else if (data.recentTrend === 'declining') {
    insights.push({
      severity: 'warning',
      title: 'Revenue has been declining recently',
      detail: 'A downward trend is a signal, not a verdict. Review your lead sources, ' +
        'check if a competitor shifted pricing, and talk to recent customers about ' +
        'what almost stopped them from buying.'
    });
  }

  // 4. Healthy margin encouragement
  if (margin >= 20 && insights.length < 3) {
    insights.push({
      severity: 'info',
      title: 'Your profit margin is solid at ' + margin.toFixed(0) + '%',
      detail: 'A healthy margin gives you room to invest in growth. Consider setting ' +
        'aside 10-15% of net profit as a cash reserve for slow months or unexpected ' +
        'opportunities.'
    });
  }

  // 5. Ensure at least 3 insights
  if (insights.length < 3) {
    insights.push({
      severity: 'info',
      title: 'Keep logging transactions consistently',
      detail: 'The more data you log, the better coaching Bella can provide. Aim to ' +
        'record every transaction within 24 hours so your dashboard always reflects ' +
        'the real state of your business.'
    });
  }
  if (insights.length < 3) {
    insights.push({
      severity: 'info',
      title: 'Review your numbers weekly',
      detail: 'Set a recurring 15-minute weekly review. Check revenue pace against ' +
        'last month, flag any expense spikes, and adjust your plan before small ' +
        'issues become big problems.'
    });
  }

  return insights.slice(0, 5);
}

// ── Handler ─────────────────────────────────────────────────
exports.handler = async function (event) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }


  // ── Parse body ──────────────────────────────────────────────
  var data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  var industry = data.industry || 'general';
  var monthlyRevenue = parseFloat(data.monthlyRevenue) || 0;
  var monthlyExpenses = parseFloat(data.monthlyExpenses) || 0;
  var profitMargin = parseFloat(data.profitMargin) || 0;
  var monthsInBusiness = parseInt(data.monthsInBusiness, 10) || 0;
  var recentTrend = data.recentTrend || 'stable';
  var expenseBreakdown = data.expenseBreakdown || {};

  // ── API Key ─────────────────────────────────────────────────
  var API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.warn('[bella-coaching] GEMINI_API_KEY not set, returning fallback insights.');
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ insights: generateFallbackInsights(data) })
    };
  }

  // ── Build Prompt ────────────────────────────────────────────
  var breakdownLines = '';
  var bKeys = Object.keys(expenseBreakdown);
  for (var i = 0; i < bKeys.length; i++) {
    breakdownLines += '  - ' + bKeys[i] + ': $' + (parseFloat(expenseBreakdown[bKeys[i]]) || 0).toFixed(0) + '\n';
  }

  var systemPrompt = 'You are Bella, a business coach for a ' + industry +
    ' startup founder. Analyze their financial data and provide exactly 3-5 specific, ' +
    'actionable coaching insights. Each insight must have a one-line title and a 2-3 ' +
    'sentence explanation. Be direct, warm, and encouraging. Never use emoji. ' +
    'Format your entire response as a JSON array: ' +
    '[{"severity":"info|warning|alert","title":"...","detail":"..."}]. ' +
    'Severity rules: "alert" for urgent problems (negative profit, 3+ months declining). ' +
    '"warning" for concerning trends (high expense ratios, inconsistency). ' +
    '"info" for positive observations and growth tips. ' +
    'Return ONLY the JSON array, no other text.';

  var userMessage = 'Here is the financial snapshot for this ' + industry + ' business:\n' +
    '- Monthly Revenue: $' + monthlyRevenue.toFixed(0) + '\n' +
    '- Monthly Expenses: $' + monthlyExpenses.toFixed(0) + '\n' +
    '- Profit Margin: ' + profitMargin.toFixed(1) + '%\n' +
    '- Months in Business: ' + monthsInBusiness + '\n' +
    '- Recent Revenue Trend: ' + recentTrend + '\n' +
    '- Expense Breakdown:\n' + (breakdownLines || '  (no breakdown provided)\n') +
    '\nProvide your coaching insights as JSON.';

  // ── Call Gemini ─────────────────────────────────────────────
  var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY;

  try {
    var response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      var errText = await response.text();
      console.error('[bella-coaching] Gemini API error:', response.status, errText.substring(0, 300));
      // Fallback to math-based insights
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ insights: generateFallbackInsights(data) })
      };
    }

    var geminiData = await response.json();

    // Extract text from response
    var rawText = '';
    if (geminiData.candidates && geminiData.candidates[0] &&
        geminiData.candidates[0].content && geminiData.candidates[0].content.parts) {
      var parts = geminiData.candidates[0].content.parts;
      for (var p = 0; p < parts.length; p++) {
        if (parts[p].text) rawText += parts[p].text;
      }
    }

    if (!rawText) {
      console.warn('[bella-coaching] Empty Gemini response, using fallback.');
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ insights: generateFallbackInsights(data) })
      };
    }

    // Parse the JSON from Gemini's response
    var insights;
    try {
      // Strip markdown code fences if present
      var cleaned = rawText.trim();
      if (cleaned.indexOf('```') === 0) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
      }
      insights = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('[bella-coaching] Failed to parse Gemini JSON, using fallback.', parseErr.message);
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ insights: generateFallbackInsights(data) })
      };
    }

    // Validate structure
    if (!Array.isArray(insights) || insights.length === 0) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ insights: generateFallbackInsights(data) })
      };
    }

    // Sanitize each insight
    var validSeverities = { alert: true, warning: true, info: true };
    var sanitized = [];
    for (var s = 0; s < insights.length && s < 5; s++) {
      var ins = insights[s];
      if (ins && ins.title && ins.detail) {
        sanitized.push({
          severity: validSeverities[ins.severity] ? ins.severity : 'info',
          title: String(ins.title).substring(0, 200),
          detail: String(ins.detail).substring(0, 600)
        });
      }
    }

    if (sanitized.length === 0) {
      sanitized = generateFallbackInsights(data);
    }

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ insights: sanitized })
    };

  } catch (fetchErr) {
    console.error('[bella-coaching] Fetch error:', fetchErr.message || fetchErr);
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ insights: generateFallbackInsights(data) })
    };
  }
};
