// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import type { Database } from './types';

// Tạo client dùng ở phía server-side components và Server Actions
export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};

// Tạo client dùng trong route handler API (App Router)
export async function createRouteHandlerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}

export default createServerClient;
