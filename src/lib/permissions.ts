import { createClient } from "@supabase/supabase-js";

// ── Tiered admin permissions ──
// One source of truth mapping each role to the admin sections it may access.
// Sections: 'listings', 'badges', 'users', 'payments', 'discounts', 'overview', 'roles'.

export type AdminSection =
  | "overview" | "listings" | "badges" | "users" | "payments" | "discounts" | "roles";

const FOUNDER_ADMIN_ID = "user_3BeYdNiwHjIpWA8iw63QXV5Yb6Y";

// Which sections each role can access. super_admin/admin get everything.
const ROLE_PERMISSIONS: Record<string, AdminSection[]> = {
  super_admin: ["overview", "listings", "badges", "users", "payments", "discounts", "roles"],
  admin:       ["overview", "listings", "badges", "users", "payments", "discounts"],
  listings_admin: ["overview", "listings", "badges"],
  payments_admin: ["overview", "payments", "discounts"],
  support:        ["overview", "users"],
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Fetch a user's role. Founder always resolves to super_admin. Never throws.
export async function getRole(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null;
  if (userId === FOUNDER_ADMIN_ID) return "super_admin";
  try {
    const { data } = await supabase.from("profiles").select("role").eq("clerk_id", userId).single();
    return data?.role ?? null;
  } catch {
    return null;
  }
}

// Any admin-level access at all (used to gate the whole /admin area).
export async function canAccessAdmin(userId: string | null | undefined): Promise<boolean> {
  const role = await getRole(userId);
  return !!role && role in ROLE_PERMISSIONS;
}

// Can this user access a SPECIFIC section? (used by pages + API routes)
export async function canAccessSection(
  userId: string | null | undefined,
  section: AdminSection
): Promise<boolean> {
  const role = await getRole(userId);
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role];
  return !!allowed && allowed.includes(section);
}

// Sections a user can see — handy for rendering the sidebar.
export async function allowedSections(userId: string | null | undefined): Promise<AdminSection[]> {
  const role = await getRole(userId);
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}
