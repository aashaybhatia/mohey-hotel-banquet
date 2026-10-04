(function () {
  'use strict';

  const CFG = window.MOHEY_CONFIG || {};

  if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY || CFG.ANALYTICS_ENABLED === false) {
    return;
  }

  const SUPABASE_URL = CFG.SUPABASE_URL.replace(/\/$/, '');
  const SUPABASE_KEY = CFG.SUPABASE_ANON_KEY;
  const EVENTS_TABLE = (CFG.TABLES && CFG.TABLES.EVENTS) || 'site_events';

  const SESSION_KEY = 'mohey_analytics_session';
  const UTM_KEY = 'mohey_analytics_utm';

  function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);

    if (!id) {
      id = (crypto.randomUUID
        ? crypto.randomUUID()
        : 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2));

      localStorage.setItem(SESSION_KEY, id);
    }

    return id;
  }

  function getUTM() {
    const saved = localStorage.getItem(UTM_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }

    const params = new URLSearchParams(window.location.search);

    const utm = {
      source: params.get('utm_source') || null,
      medium: params.get('utm_medium') || null,
      campaign: params.get('utm_campaign') || null,
      content: params.get('utm_content') || null,
      term: params.get('utm_term') || null
    };

    if (Object.values(utm).some(Boolean)) {
      localStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }

    return utm;
  }

  const sessionId = getSessionId();
  const utm = getUTM();

  async function track(eventName, extra = {}) {
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/${EVENTS_TABLE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            event_name: eventName,
            session_id: sessionId,
            page_path: window.location.pathname,
            page_url: window.location.href,
            referrer: document.referrer || null,

            utm_source: utm.source,
            utm_medium: utm.medium,
            utm_campaign: utm.campaign,
            utm_content: utm.content,
            utm_term: utm.term,

            ...extra
          })
        }
      );
    } catch (error) {
      console.warn('Mohey analytics error:', error);
    }
  }

  window.MoheyAnalytics = {
    track
  };

  // Session started
  track('session_start');

  // Page viewed
  track('page_view');

  // Track important clicks
  document.addEventListener('click', function (event) {
    const link = event.target.closest('a');

    if (!link) return;

    const href = link.href || '';
    const text = (link.innerText || '').trim();

    if (href.includes('wa.me') || href.includes('whatsapp')) {
      track('whatsapp_click', {
        link_text: text,
        link_url: href
      });
    }

    if (href.startsWith('tel:')) {
      track('phone_click', {
        link_text: text,
        link_url: href
      });
    }
  });

  // Track enquiry form start
  document.addEventListener('focusin', function (event) {
    const el = event.target;

    if (
      el &&
      (
        el.matches('#enquiryForm input') ||
        el.matches('#enquiryForm textarea') ||
        el.matches('#enquiryForm select')
      )
    ) {
      track('enquiry_start');
    }
  }, { once: true });

  // Keep session alive for live visitor count
  setInterval(function () {
    track('heartbeat');
  }, 60000);

})();
