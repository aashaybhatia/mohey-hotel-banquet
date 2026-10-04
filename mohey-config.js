/* =========================================================
   MOHEY LIVE CONFIGURATION
   Edit this ONE file before hosting.
   Use the same Supabase project URL + public anon/publishable key
   in both the public website folder and admin dashboard folder.
   NEVER put the Supabase service_role/secret key here.
   ========================================================= */
window.MOHEY_CONFIG = {
  SUPABASE_URL: 'PASTE_YOUR_SUPABASE_PROJECT_URL_HERE',
  SUPABASE_ANON_KEY: 'PASTE_YOUR_SUPABASE_PUBLIC_ANON_KEY_HERE',

  // Change this path later to replace the Watch Video media.
  VIDEO_SRC: 'mohey-venue-video.mp4',
  VIDEO_POSTER: 'mohey-venue-poster.jpg',

  TABLES: {
    ENQUIRIES: 'enquiries',
    EVENTS: 'site_events',
    BOOKINGS: 'bookings',
    CHAT_SESSIONS: 'chat_sessions'
  },

  ANALYTICS: {
    ENABLED: true,
    EVENT_TABLE: 'site_events',
    HEARTBEAT_MS: 60000
  },

  DASHBOARD: {
    BRAND_NAME: 'Mohey Hotel & Banquet Hall',
    DEMO_MODE: false,
    DEFAULT_DAYS: 30,
    REFRESH_MS: 60000
  }
};
