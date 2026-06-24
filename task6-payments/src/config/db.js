const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase config missing in environment');
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

module.exports = supabase;
