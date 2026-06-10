import { createClient } from "@supabase/supabase-js";

export default async function AdminVerificationsPage() {
  let debugInfo = "Starting...";
  let requests: any[] = [];

  try {
    debugInfo = "Creating client...";
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    debugInfo = "Querying verification_requests...";
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      debugInfo = "QUERY ERROR: " + JSON.stringify(error);
    } else {
      requests = data ?? [];
      debugInfo = `Query OK. Found ${requests.length} request(s).`;
    }
  } catch (err: any) {
    debugInfo = "CAUGHT EXCEPTION: " + (err?.message || String(err));
  }

  return (
    <div style={{ padding: 32, fontFamily: "monospace", fontSize: 14, color: "#111", background: "#fff", minHeight: "100vh", width: "100%" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Verifications — Debug Mode</h1>
      <div style={{ padding: 16, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, marginBottom: 16 }}>
        <strong>Status:</strong> {debugInfo}
      </div>
      <div style={{ padding: 16, background: "#f3f4f6", borderRadius: 8 }}>
        <strong>Raw data ({requests.length} rows):</strong>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", marginTop: 8 }}>
          {JSON.stringify(requests, null, 2)}
        </pre>
      </div>
    </div>
  );
}
