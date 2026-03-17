import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER_ID = "user_3AmnQEFKPsp6EX1W9xl88nOW4AV";

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

  await supabase
    .from("verification_requests")
    .update({ status: approved ? "approved" : "rejected" })
    .eq("id", requestId);

  if (approved && targetUserId) {
    await supabase
      .from("profiles")
      .update({ is_verified: true })
      .eq("id", targetUserId);
  }

  return NextResponse.redirect(new URL("/admin/verifications", req.url));
}
