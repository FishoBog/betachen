import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendListingApprovedEmail } from "@/lib/email";
import { canAccessSection } from "@/lib/permissions";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  // Listing management requires the 'listings' permission
  // (super_admin, admin, listings_admin).
  if (!(await canAccessSection(userId, "listings"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const formData = await req.formData();
  const listingId = formData.get("listingId") as string;
  const action = formData.get("action") as string;
  if (!listingId || !action) {
    return NextResponse.redirect(new URL("/admin/listings", req.url));
  }

  if (action === "hard_delete") {
    await supabase.from("properties").delete().eq("id", listingId);
    return NextResponse.redirect(new URL("/admin/listings?filter=removed", req.url));
  }

  if (action === "soft_delete") {
    await supabase
      .from("properties")
      .update({ status: "removed", removed_at: new Date().toISOString() })
      .eq("id", listingId);
    return NextResponse.redirect(new URL("/admin/listings", req.url));
  }

  if (action === "restore") {
    await supabase
      .from("properties")
      .update({ status: "active", removed_at: null })
      .eq("id", listingId);
    return NextResponse.redirect(new URL("/admin/listings?filter=active", req.url));
  }

  const newStatus = action === "approve" ? "active" : "rejected";
  await supabase.from("properties").update({ status: newStatus }).eq("id", listingId);
  if (action === "approve") {
    const { data: property } = await supabase
      .from("properties")
      .select("title, owner_id, owner_email")
      .eq("id", listingId)
      .single();
    if (property?.owner_email) {
      try {
        await sendListingApprovedEmail(property.owner_email, property.title, listingId);
      } catch (e) {
        console.error("Email error:", e);
      }
    }
  }
  return NextResponse.redirect(new URL("/admin/listings", req.url));
}
