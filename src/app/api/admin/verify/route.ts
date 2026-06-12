import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const FOUNDER_ADMIN_ID = "user_3BeYdNiwHjIpWA8iw63QXV5Yb6Y";
const ADMIN_ROLES = ["admin", "super_admin"];
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inlined admin check (role-based, with founder fallback). Returns true if the
// signed-in user may perform admin actions.
async function userIsAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  if (userId === FOUNDER_ADMIN_ID) return true;
  try {
    const { data } = await supabase.from("profiles").select("role").eq("clerk_id", userId).single();
    return !!data?.role && ADMIN_ROLES.includes(data.role);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!(await userIsAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const formData = await req.formData();
  const requestId = formData.get("requestId") as string;
  const targetUserId = formData.get("userId") as string;
  const action = formData.get("action") as string;
  if (!requestId || !action) {
    return NextResponse.redirect(new URL("/admin/verifications", req.url));
  }
  const approved = action === "approve";

  await supabase
    .from("verification_requests")
    .update({ status: approved ? "approved" : "rejected" })
    .eq("id", requestId);

  if (approved && targetUserId) {
    await supabase
      .from("profiles")
      .update({ is_verified: true, verification_status: "verified" })
      .eq("clerk_id", targetUserId);
  }

  return NextResponse.redirect(new URL("/admin/verifications", req.url));
}
