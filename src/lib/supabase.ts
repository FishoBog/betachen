import { createClient } from '@supabase/supabase-js';

<<<<<<< HEAD
// Lazy initialization - never crash at module load time
=======
>>>>>>> f71ccdcab84ede8e551ad60b7cb3d8a4f044742c
let _browserClient: ReturnType<typeof createClient> | null = null;

export const createBrowserClient = () => {
  if (typeof window === 'undefined') {
<<<<<<< HEAD
    // During SSR/build, return a dummy that won't crash
=======
>>>>>>> f71ccdcab84ede8e551ad60b7cb3d8a4f044742c
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
