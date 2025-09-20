import { createClient } from '@supabase/supabase-js';
import { supabaseDataProvider, supabaseAuthProvider } from 'ra-supabase';

import { MergedDatabase } from 'types';

export const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_SUPABASE_API_KEY;
export const supabase = createClient<MergedDatabase>(instanceUrl, apiKey);
export const dataProvider = supabaseDataProvider({
  instanceUrl,
  apiKey,
  supabase,
});
export const authProvider = supabaseAuthProvider(supabase, {});
