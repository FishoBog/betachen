import { createClient } from "@supabase/supabase-js";

export default async function AdminVerificationsPage() {
  let sidebarStatus = "not tested";
  let SidebarComp: any = null;

  // Test whether AdminSidebar can even be imported without throwing
  try {
    const mod = await import("@/components/admin/AdminSidebar");
    SidebarComp = mod.AdminSidebar;
    sidebarStatus = "AdminSidebar imported OK";
  } catch (e: any) {
    sidebarStatus = "AdminSidebar IMPORT FAILED: " + (e?.message || String(e));
  }

  let rows: any[] = [];
  let dataStatus = "—";
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) dataStatus = "DATA ERROR: " + JSON.stringify(error);
    else { rows = data ?? []; dataStatus = `data OK — ${rows.length} rows`; }
  } catch (e: any) {
    dataStatus = "DATA EXCEPTION: " + (e?.message || String(e));
  }

  return (
    <div style={{ padding: 32, fontFamily: "monospace", fontSize: 14, color: "#111", background: "#fff", minHeight: "100vh", width: "100%" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Verifications — Debug v3</h1>
      <div style={{ padding: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, marginBottom: 12 }}>
        <strong>Sidebar:</strong> {sidebarStatus}
      </div>
      <div style={{ padding: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, marginBottom: 16 }}>
        <strong>Data:</strong> {dataStatus}
      </div>
      <div style={{ padding: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, marginBottom: 16 }}>
        <strong>Now attempting to render AdminSidebar below this line:</strong>
      </div>
      {/* If the sidebar itself crashes during render, everything ABOVE still shows,
          so we'll know the sidebar is the culprit. */}
      {SidebarComp ? <SidebarComp /> : <div>No sidebar component</div>}
      <div style={{ padding: 12, background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 8, marginTop: 16 }}>
        <strong>✓ Reached the end — sidebar rendered without crashing.</strong>
      </div>
    </div>
  );
}
