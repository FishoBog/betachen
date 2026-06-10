import { createClient } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Turn a stored document reference into a usable link.
// - If it's already a full URL (old data), return it as-is.
// - If it's a storage path, create a short-lived signed URL from the private bucket.
// - On any problem, return null so the UI shows "link unavailable" instead of crashing.
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
      const idLink = await resolveDocLink(req.id_document_url);
      const bizLink = await resolveDocLink(req.business_license_url);
      links[req.id] = { id: idLink, biz: bizLink };
    }
  } catch {
    requests = [];
  }

  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--navy)" }}>Owner Badge Verifications</h1>
        <div className="grid gap-4">
          {requests.length > 0 ? requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status] ?? "bg-gray-100 text-gray-600"}`}>{req.status}</span>
                    <span className="text-xs text-gray-400">{req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : ""}</span>
                  </div>
                  {req.full_name && <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Full Name:</span> {req.full_name}</p>}
                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">User ID:</span> {req.clerk_id ?? "—"}</p>
                  {req.reviewer_notes && <p className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {req.reviewer_notes}</p>}
                  <div className="mt-2 flex flex-wrap gap-4">
                    {req.id_document_url && (
                      links[req.id]?.id
                        ? <a href={links[req.id].id!} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">View ID document →</a>
                        : <span className="text-sm text-gray-400">ID document (link unavailable)</span>
                    )}
                    {req.business_license_url && (
                      links[req.id]?.biz
                        ? <a href={links[req.id].biz!} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">View business license →</a>
                        : <span className="text-sm text-gray-400">Business license (link unavailable)</span>
                    )}
                  </div>
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <form action="/api/admin/verify" method="POST">
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="userId" value={req.clerk_id ?? ""} />
                      <button name="action" value="approve" className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Approve</button>
                    </form>
                    <form action="/api/admin/verify" method="POST">
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="userId" value={req.clerk_id ?? ""} />
                      <button name="action" value="reject" className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">Reject</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">No verification requests yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}
