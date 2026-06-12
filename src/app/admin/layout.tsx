import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const FOUNDER_ADMIN_ID = "user_3BeYdNiwHjIpWA8iw63QXV5Yb6Y";
const ADMIN_ROLES = ["admin", "super_admin"];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  // Role-based gate (inlined so it has no dependency on other files).
  // Allow the founder ID always, plus anyone whose profile role is admin/super_admin.
  let allowed = false;
  if (userId) {
    if (userId === FOUNDER_ADMIN_ID) {
      allowed = true;
    } else {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("clerk_id", userId)
          .single();
        if (data?.role && ADMIN_ROLES.includes(data.role)) allowed = true;
      } catch {
        allowed = false;
      }
    }
  }

  if (!allowed) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {children}
    </div>
  );
}
