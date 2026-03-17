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
  const listingId = formData.get("listingId") as string;
  const action = formData.get("action") as string;

  if (!listingId || !action) {
    return NextResponse.redirect(new URL("/admin/listings", req.url));
  }

  const newStatus = action === "approve" ? "active" : "rejected";

  await supabase
    .from("properties")
    .update({ status: newStatus })
    .eq("id", listingId);

  return NextResponse.redirect(new URL("/admin/listings", req.url));
}
