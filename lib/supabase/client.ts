// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Helper function để sử dụng trong các components
export function useSupabase() {
  const supabase = createClient();
  return { supabase };
}

export default createClient;
