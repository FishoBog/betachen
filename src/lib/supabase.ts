import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createBrowserClient = () =>
  createClient(supabaseUrl, supabaseAnonKey);

export const createServerClient = () => {
  const { cookies } = require('next/headers');
  const cookieStore = cookies();
  const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs');
  return createServerComponentClient({ cookies: () => cookieStore });
};

export const createAdminClient = () =>
  createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
