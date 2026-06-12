import { createClient } from "@supabase/supabase-js";

// Single source of truth for "is this user an admin?".
// Allows anyone whose profile role is 'admin' or 'super_admin'.
// Also always allows the original hardcoded founder ID as a permanent
// fallback, so a database/role mishap can never lock the owner out.

const FOUNDER_ADMIN_ID = "user_3BeYdNiwHjIpWA8iw63QXV5Yb6Y";
const ADMIN_ROLES = ["admin", "super_admin"];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Returns the user's role string, or null. Never throws.
export async function getUserRole(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("clerk_id", userId)
      .single();
    return data?.role ?? null;
  } catch {
    return null;
  }
}

// True if the user may access the admin area at all.
export async function isAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  if (userId === FOUNDER_ADMIN_ID) return true; // permanent fallback
  const role = await getUserRole(userId);
  return role !== null && ADMIN_ROLES.includes(role);
}

// True only for the highest tier (for super-admin-only actions later).
export async function isSuperAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  if (userId === FOUNDER_ADMIN_ID) return true;
  const role = await getUserRole(userId);
  return role === "super_admin";
}
