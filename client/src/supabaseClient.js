import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxozyxbjywoccfzirnps.supabase.co'; // Get from your URL in screenshot
const supabaseKey = 'sb_publishable_FIJqhEzz8Ti0usiOoFRvBQ_FBa_2cis'; 
export const supabase = createClient(supabaseUrl, supabaseKey);