import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  'https://orccvvyrbaihdgqofqsb.supabase.co';

const supabasePublishableKey =
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_VYOrsVcpXv9hAn317cBYSQ_1QoKhPlB';

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);