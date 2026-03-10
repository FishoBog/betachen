import { createClient } from '@supabase/supabase-js';

let _browserClient: ReturnType<typeof createClient> | null = null;

export const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder',
    );
  }
  if (!_browserClient) {
    _browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _browserClient;
};

export const createServerClient = () => {
  try {
    const { cookies } = require('next/headers');
    const cookieStore = cookies();
    const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs');
    return createServerComponentClient({ cookies: () => cookieStore });
  } catch {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder',
    );
  }
};

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
