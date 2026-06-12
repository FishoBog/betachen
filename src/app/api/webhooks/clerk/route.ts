import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "No webhook secret" }, { status: 500 });
  }
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }
  const body = await req.text();
  const wh = new Webhook(webhookSecret);
  let payload: any;
  try {
    payload = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  const { type, data } = payload;

  // Helper: pull the standard fields out of a Clerk user payload.
  const extract = (d: any) => {
    const email = d.email_addresses?.[0]?.email_address ?? null;
    const first = d.first_name ?? "";
    const last = d.last_name ?? "";
    const fullName = `${first} ${last}`.trim() || null;
    return {
      clerk_id: d.id as string,
      email,
      full_name: fullName,
      avatar_url: d.image_url ?? null,
    };
  };

  if (type === "user.created") {
    const u = extract(data);
    // Create the profile row so the admin Users page shows real data.
    // upsert on clerk_id avoids duplicates; role defaults to 'user'.
    try {
      await supabase.from("profiles").upsert(
        {
          clerk_id: u.clerk_id,
          email: u.email,
          full_name: u.full_name,
          avatar_url: u.avatar_url,
          role: "user",
        },
        { onConflict: "clerk_id" }
      );
    } catch (e) {
      console.error("Profile create error:", e);
    }
    // Existing behaviour: send a welcome email.
    if (u.email) {
      try {
        await sendWelcomeEmail(u.email, data.first_name || "there");
      } catch (e) {
        console.error("Email error:", e);
      }
    }
  }

  if (type === "user.updated") {
    const u = extract(data);
    // Keep name / email / avatar in sync. IMPORTANT: we do NOT touch `role`
    // here, so an admin role set manually in the DB is never overwritten.
    try {
      await supabase
        .from("profiles")
        .update({
          email: u.email,
          full_name: u.full_name,
          avatar_url: u.avatar_url,
        })
        .eq("clerk_id", u.clerk_id);
    } catch (e) {
      console.error("Profile update error:", e);
    }
  }

  return NextResponse.json({ success: true });
}
