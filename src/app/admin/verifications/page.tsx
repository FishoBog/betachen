import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Resolve a stored document reference into a usable link.
// Full URL (old data) → use as-is. Storage path → signed URL. Any error → null.
async function resolveDocLink(ref: string | null | undefined): Promise<string | null> {
  if (!ref) return null;
  if (ref.startsWith("http://") || ref.startsWith("https://")) return ref;
  try {
    const { data } = await supabase.storage.from("verifications").createSignedUrl(ref, 300);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

const statusStyle = (status: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#fef9c3", color: "#854d0e" },
    approved: { bg: "#dcfce7", color: "#15803d" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
  };
  const c = map[status] ?? { bg: "#f3f4f6", color: "#4b5563" };
  return { padding: "2px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: c.bg, color: c.color };
};

export default async function AdminVerificationsPage() {
  let requests: any[] = [];
  const links: Record<string, { id: string | null; biz: string | null }> = {};

  try {
    const { data } = await supabase
      .from("verification_requests")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(50);
    requests = data ?? [];
    for (const req of requests) {
      links[req.id] = {
        id: await resolveDocLink(req.id_document_url),
        biz: await resolveDocLink(req.business_license_url),
      };
    }
  } catch {
    requests = [];
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "2rem", background: "#f9fafb" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", color: "#111827" }}>Owner Badge Verifications</h1>

        {requests.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {requests.map((req: any) => (
              <div key={req.id} style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span style={statusStyle(req.status)}>{req.status}</span>
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : ""}</span>
                    </div>
                    {req.full_name && <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.25rem" }}><strong>Full Name:</strong> {req.full_name}</p>}
                    <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.25rem" }}><strong>User ID:</strong> {req.clerk_id ?? "—"}</p>
                    {req.reviewer_notes && <p style={{ fontSize: "0.875rem", color: "#374151" }}><strong>Notes:</strong> {req.reviewer_notes}</p>}
                    <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                      {req.id_document_url && (
                        links[req.id]?.id
                          ? <a href={links[req.id].id!} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.875rem", color: "#2563eb", textDecoration: "underline" }}>View ID document →</a>
                          : <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>ID document (link unavailable)</span>
                      )}
                      {req.business_license_url && (
                        links[req.id]?.biz
                          ? <a href={links[req.id].biz!} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.875rem", color: "#2563eb", textDecoration: "underline" }}>View business license →</a>
                          : <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Business license (link unavailable)</span>
                      )}
                    </div>
                  </div>
                  {req.status === "pending" && (
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <form action="/api/admin/verify" method="POST">
                        <input type="hidden" name="requestId" value={req.id} />
                        <input type="hidden" name="userId" value={req.clerk_id ?? ""} />
                        <button name="action" value="approve" style={{ padding: "0.375rem 0.75rem", fontSize: "0.875rem", background: "#16a34a", color: "white", borderRadius: "8px", fontWeight: 600, border: "none", cursor: "pointer" }}>Approve</button>
                      </form>
                      <form action="/api/admin/verify" method="POST">
                        <input type="hidden" name="requestId" value={req.id} />
                        <input type="hidden" name="userId" value={req.clerk_id ?? ""} />
                        <button name="action" value="reject" style={{ padding: "0.375rem 0.75rem", fontSize: "0.875rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontWeight: 600, border: "none", cursor: "pointer" }}>Reject</button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
            No verification requests yet.
          </div>
        )}
      </main>
    </div>
  );
}
