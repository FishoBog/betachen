import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
const ADMIN_USER_ID = "user_3BeYdNiwHjIpWA8iw63QXV5Yb6Y";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) {
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

  // Update the verification request status.
  await supabase
    .from("verification_requests")
    .update({ status: approved ? "approved" : "rejected" })
    .eq("id", requestId);

  // On approve, grant the verified badge on the owner's profile.
  // IMPORTANT: profiles are keyed by clerk_id (text), NOT id (uuid).
  // The previous code matched on `id`, which is a uuid column, so passing a
  // Clerk id like "user_3BeY..." threw a type error and the whole approve
  // action failed. We match on clerk_id and set both verification fields so it
  // works regardless of which one the badge UI reads.
  if (approved && targetUserId) {
    await supabase
      .from("profiles")
      .update({ is_verified: true, verification_status: "verified" })
      .eq("clerk_id", targetUserId);
  }

  return NextResponse.redirect(new URL("/admin/verifications", req.url));
}
