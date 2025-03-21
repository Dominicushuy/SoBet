// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import type { Database } from './types';

// Tạo client dùng ở phía client-side components
export const createClient = () => {
  return createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};

// Helper function để sử dụng trong các components
export function useSupabase() {
  const supabase = createClient();
  return { supabase };
}

export default createClient;
