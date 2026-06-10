import { createClient } from "@supabase/supabase-js";

export default async function AdminVerificationsPage() {
  let debug1 = "—";
  let debug2 = "—";
  let rows: any[] = [];
  let allRows: any[] = [];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Test 1: ordered by submitted_at
  try {
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(50);
    if (error) debug1 = "ERROR: " + JSON.stringify(error);
    else { rows = data ?? []; debug1 = `OK — ${rows.length} row(s) ordered by submitted_at`; }
  } catch (e: any) {
    debug1 = "EXCEPTION: " + (e?.message || String(e));
  }

  // Test 2: no ordering at all — just grab everything in the table
  try {
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*");
    if (error) debug2 = "ERROR: " + JSON.stringify(error);
    else { allRows = data ?? []; debug2 = `OK — ${allRows.length} total row(s) in table`; }
  } catch (e: any) {
    debug2 = "EXCEPTION: " + (e?.message || String(e));
  }

  return (
    <div style={{ padding: 32, fontFamily: "monospace", fontSize: 14, color: "#111", background: "#fff", minHeight: "100vh", width: "100%" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Verifications — Debug v2</h1>
      <div style={{ padding: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, marginBottom: 12 }}>
        <strong>Test 1 (order by submitted_at):</strong> {debug1}
      </div>
      <div style={{ padding: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, marginBottom: 16 }}>
        <strong>Test 2 (no order, all rows):</strong> {debug2}
      </div>
      <div style={{ padding: 16, background: "#f3f4f6", borderRadius: 8 }}>
        <strong>All rows raw data:</strong>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", marginTop: 8 }}>
          {JSON.stringify(allRows, null, 2)}
        </pre>
      </div>
    </div>
  );
}
