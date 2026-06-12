export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendExpiryWarningEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Grace-period configuration (days).
const WARN_DAYS_BEFORE = 3;      // email a reminder this many days before expiry
const SOFT_DELETE_AFTER = 7;     // days AFTER expiry before hiding (soft delete)
const HARD_DELETE_AFTER = 30;    // days in 'removed' before permanent deletion

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export async function GET(req: NextRequest) {
  // Security: only allow calls bearing the CRON_SECRET (Vercel cron sends it,
  // and you can trigger manually with the same header for testing).
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const summary = { warned: 0, soft_deleted: 0, hard_deleted: 0, errors: [] as string[] };

  // ── PASS 1: warn listings expiring within WARN_DAYS_BEFORE (still active) ──
  try {
    const { data: expiringSoon } = await supabase
      .from("properties")
      .select("id, title, owner_email, expires_at")
      .eq("status", "active")
      .gt("expires_at", now)
      .lt("expires_at", daysFromNow(WARN_DAYS_BEFORE));
    for (const p of expiringSoon ?? []) {
      if (!p.owner_email || !p.expires_at) continue;
      const daysLeft = Math.max(1, Math.ceil((new Date(p.expires_at).getTime() - Date.now()) / 86400000));
      try {
        await sendExpiryWarningEmail(p.owner_email, p.title, p.id, daysLeft);
        summary.warned++;
      } catch (e: any) {
        summary.errors.push(`warn ${p.id}: ${e?.message ?? e}`);
      }
    }
  } catch (e: any) {
    summary.errors.push(`pass1: ${e?.message ?? e}`);
  }

  // ── PASS 2: soft-delete listings expired more than SOFT_DELETE_AFTER days ──
  try {
    const cutoff = daysAgo(SOFT_DELETE_AFTER);
    const { data: toSoftDelete } = await supabase
      .from("properties")
      .select("id")
      .eq("status", "active")
      .lt("expires_at", cutoff);
    for (const p of toSoftDelete ?? []) {
      const { error } = await supabase
        .from("properties")
        .update({ status: "removed", removed_at: now })
        .eq("id", p.id);
      if (error) summary.errors.push(`soft ${p.id}: ${error.message}`);
      else summary.soft_deleted++;
    }
  } catch (e: any) {
    summary.errors.push(`pass2: ${e?.message ?? e}`);
  }

  // ── PASS 3: hard-delete listings in 'removed' longer than HARD_DELETE_AFTER ──
  try {
    const cutoff = daysAgo(HARD_DELETE_AFTER);
    const { data: toHardDelete } = await supabase
      .from("properties")
      .select("id")
      .eq("status", "removed")
      .lt("removed_at", cutoff);
    for (const p of toHardDelete ?? []) {
      const { error } = await supabase.from("properties").delete().eq("id", p.id);
      if (error) summary.errors.push(`hard ${p.id}: ${error.message}`);
      else summary.hard_deleted++;
    }
  } catch (e: any) {
    summary.errors.push(`pass3: ${e?.message ?? e}`);
  }

  return NextResponse.json({ ok: true, ran_at: now, ...summary });
}
